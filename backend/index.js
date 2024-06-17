const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

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
