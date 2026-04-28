import http from 'http';
import { Server } from 'socket.io';
import { createApp } from './app.js';
import { env } from './config/env.js';

const httpServer = http.createServer();
const io = new Server(httpServer, {
  cors: { origin: env.frontendUrl === '*' ? true : env.frontendUrl }
});

io.on('connection', (socket) => {
  socket.on('conversation:join', (conversationId) => {
    socket.join(conversationId);
  });
});

const app = createApp(io);
httpServer.removeAllListeners('request');
httpServer.on('request', app);

httpServer.listen(env.port, () => {
  console.log(`Backend listening on :${env.port}`);
});
