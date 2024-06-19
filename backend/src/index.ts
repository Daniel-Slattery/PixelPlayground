import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();

const io = new Server(httpServer);

// List of allowed origins
const allowedOrigins = [
  'http://pixelplayground.s3-website.eu-west-2.amazonaws.com',
  'http://localhost:5173'
];

// Disallow connections from outside the specified origins
io.use((socket, next) => {
  const origin = socket.handshake.headers.origin;
  if (origin && !allowedOrigins.includes(origin)) {
    return next(new Error('origin not allowed'));
  }
  next();
});

const port = process.env.PORT || 3001;

const avatars: { [id: string]: { position: { x: number; y: number; z: number } } } = {};

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Send the initial state of all avatars to the new client
  socket.emit('initial-avatars', avatars);

  // Handle new position updates
  socket.on('move', (data) => {
    avatars[socket.id] = data.position;
    // Broadcast the movement to other users
    socket.broadcast.emit('avatar-moved', { id: socket.id, position: data.position });
  });

  // Handle user disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    delete avatars[socket.id];
    io.emit('avatar-disconnected', socket.id);
  });
});

httpServer.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
