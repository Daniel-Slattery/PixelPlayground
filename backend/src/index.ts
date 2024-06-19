import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

// CORS options
const corsOptions = {
  origin: 'http://pixelplayground.s3-website.eu-west-2.amazonaws.com',
  optionsSuccessStatus: 200
};

const app = express();
app.use(cors(corsOptions));
const server = http.createServer(app);
const io = new Server(server);

const port = process.env.PORT || 3001;

app.get('/', (req, res) => {
  res.send('Socket.io Server for PixelPlayground');
});

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

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
