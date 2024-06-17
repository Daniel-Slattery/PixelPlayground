import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = process.env.PORT || 3001;

app.get('/', (req, res) => {
  res.send('Socket.io Server for PixelPlayground');
});

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Handle user movement
  socket.on('move', (data) => {
    console.log('Move:', data);
    // Broadcast the movement to other users
    socket.broadcast.emit('move', data);
  });

  // Handle user disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
