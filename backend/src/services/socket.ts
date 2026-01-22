import { WebSocketServer, WebSocket } from 'ws';

let wss: WebSocketServer | null = null;

export const setWss = (_wss: WebSocketServer) => {
  wss = _wss;
};

export const broadcast = (data: any) => {
  if (!wss) return;

  const message = JSON.stringify(data);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};