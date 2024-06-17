import { io } from 'socket.io-client';

// Replace with your backend server URL
const SERVER_URL = 'http://localhost:3001';

const socket = io(SERVER_URL, {
  transports: ['websocket'],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  autoConnect: true,
});

export default socket;
