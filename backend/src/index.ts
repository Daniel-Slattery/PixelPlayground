import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();

// Apply CORS for Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: "http://pixelplayground.s3-website.eu-west-2.amazonaws.com",
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
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
