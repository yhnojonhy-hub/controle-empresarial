import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

export type RealtimeChannel = 
  | 'contas'
  | 'empresas'
  | 'kpis'
  | 'fluxoCaixa'
  | 'impostos'
  | 'funcionarios'
  | 'alertas'
  | 'dashboard';

interface WebSocketClient extends WebSocket {
  userId?: number;
  channels?: Set<RealtimeChannel>;
}

export class RealtimeService {
  private wss: WebSocketServer | null = null;
  private clients: Set<WebSocketClient> = new Set();

  /**
   * Inicializar servidor WebSocket
   */
  initialize(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws: WebSocketClient) => {
      ws.channels = new Set();
      this.clients.add(ws);

      ws.on('message', (data: string) => {
        try {
          const message = JSON.parse(data);
          this.handleMessage(ws, message);
        } catch (error) {
          console.error('Erro ao processar mensagem WebSocket:', error);
        }
      });

      ws.on('close', () => {
        this.clients.delete(ws);
      });

      ws.on('error', (error) => {
        console.error('Erro WebSocket:', error);
      });
    });

    console.log('✅ Servidor WebSocket inicializado em /ws');
  }

  /**
   * Processar mensagens do cliente
   */
  private handleMessage(ws: WebSocketClient, message: any) {
    const { type, userId, channels } = message;

    if (type === 'subscribe') {
      ws.userId = userId;
      if (Array.isArray(channels)) {
        channels.forEach((channel: RealtimeChannel) => {
          ws.channels?.add(channel);
        });
      }
      ws.send(JSON.stringify({ type: 'subscribed', channels }));
    } else if (type === 'unsubscribe') {
      if (Array.isArray(channels)) {
        channels.forEach((channel: RealtimeChannel) => {
          ws.channels?.delete(channel);
        });
      }
    }
  }

  /**
   * Notificar clientes sobre mudança de dados
   */
  notifyDataChange(channel: RealtimeChannel, data: any) {
    const message = JSON.stringify({
      type: 'data-change',
      channel,
      data,
      timestamp: new Date().toISOString(),
    });

    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN && client.channels?.has(channel)) {
        client.send(message);
      }
    });
  }

  /**
   * Notificar clientes sobre erro
   */
  notifyError(channel: RealtimeChannel, error: string) {
    const message = JSON.stringify({
      type: 'error',
      channel,
      error,
      timestamp: new Date().toISOString(),
    });

    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN && client.channels?.has(channel)) {
        client.send(message);
      }
    });
  }

  /**
   * Notificar clientes sobre operação bem-sucedida
   */
  notifySuccess(channel: RealtimeChannel, message: string, data?: any) {
    const payload = JSON.stringify({
      type: 'success',
      channel,
      message,
      data,
      timestamp: new Date().toISOString(),
    });

    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN && client.channels?.has(channel)) {
        client.send(payload);
      }
    });
  }

  /**
   * Obter número de clientes conectados
   */
  getConnectedClients(): number {
    return this.clients.size;
  }

  /**
   * Obter clientes por canal
   */
  getClientsByChannel(channel: RealtimeChannel): number {
    let count = 0;
    this.clients.forEach((client) => {
      if (client.channels?.has(channel)) {
        count++;
      }
    });
    return count;
  }
}

export const realtimeService = new RealtimeService();
