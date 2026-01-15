import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from './useAuth';

export type RealtimeChannel = 
  | 'contas'
  | 'empresas'
  | 'kpis'
  | 'fluxoCaixa'
  | 'impostos'
  | 'funcionarios'
  | 'alertas'
  | 'dashboard';

interface RealtimeMessage {
  type: 'data-change' | 'error' | 'success' | 'subscribed';
  channel: RealtimeChannel;
  data?: any;
  message?: string;
  error?: string;
  timestamp: string;
}

export function useRealtime(
  channels: RealtimeChannel[],
  onDataChange?: (channel: RealtimeChannel, data: any) => void,
  onError?: (channel: RealtimeChannel, error: string) => void,
  onSuccess?: (channel: RealtimeChannel, message: string, data?: any) => void
) {
  const { user } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('✅ WebSocket conectado');
        reconnectAttemptsRef.current = 0;

        // Subscribe aos canais
        if (user?.id) {
          wsRef.current?.send(
            JSON.stringify({
              type: 'subscribe',
              userId: user.id,
              channels,
            })
          );
        }
      };

      wsRef.current.onmessage = (event: MessageEvent) => {
        try {
          const message: RealtimeMessage = JSON.parse(event.data);

          if (message.type === 'data-change') {
            onDataChange?.(message.channel, message.data);
          } else if (message.type === 'error') {
            onError?.(message.channel, message.error || 'Erro desconhecido');
          } else if (message.type === 'success') {
            onSuccess?.(message.channel, message.message || 'Operação bem-sucedida', message.data);
          }
        } catch (error) {
          console.error('Erro ao processar mensagem WebSocket:', error);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('Erro WebSocket:', error);
      };

      wsRef.current.onclose = () => {
        console.log('❌ WebSocket desconectado');
        
        // Tentar reconectar com backoff exponencial
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.pow(2, reconnectAttemptsRef.current) * 1000;
          reconnectAttemptsRef.current++;
          console.log(`Tentando reconectar em ${delay}ms...`);
          setTimeout(connect, delay);
        }
      };
    } catch (error) {
      console.error('Erro ao conectar WebSocket:', error);
    }
  }, [user?.id, channels, onDataChange, onError, onSuccess]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const subscribe = useCallback((newChannels: RealtimeChannel[]) => {
    if (wsRef.current?.readyState === WebSocket.OPEN && user?.id) {
      wsRef.current.send(
        JSON.stringify({
          type: 'subscribe',
          userId: user.id,
          channels: newChannels,
        })
      );
    }
  }, [user?.id]);

  const unsubscribe = useCallback((channelsToRemove: RealtimeChannel[]) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'unsubscribe',
          channels: channelsToRemove,
        })
      );
    }
  }, []);

  useEffect(() => {
    if (user?.id && channels.length > 0) {
      connect();
    }

    return () => {
      // Não desconectar ao desmontar, apenas ao mudar de página
    };
  }, [user?.id, channels, connect]);

  return {
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
  };
}
