import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

let io: SocketIOServer | null = null;

export function initializeSocketGateway(
  server: HttpServer,
  allowedOrigins: string[],
  options?: { path?: string }
) {
  if (io) return io;

  io = new SocketIOServer(server, {
    path: options?.path ?? '/socket.io',
    cors: {
      origin: allowedOrigins,
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    socket.on('mass_message:subscribe', (requestId: string) => {
      if (requestId) socket.join(`mass_message:${requestId}`);
    });

    socket.on('mass_message:unsubscribe', (requestId: string) => {
      if (requestId) socket.leave(`mass_message:${requestId}`);
    });
  });

  return io;
}

export function emitMassMessageEvent(
  eventName: string,
  payload: Record<string, unknown> & { requestId: string }
) {
  if (!io) return;
  io.to(`mass_message:${payload.requestId}`).emit(eventName, payload);
  io.emit(eventName, payload);
}
