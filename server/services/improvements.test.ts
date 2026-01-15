import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RealtimeService, RealtimeChannel } from './realtime.service';
import { AuditService, AuditAction, AuditEntity } from './audit.service';
import { createServer } from 'http';

describe('Melhorias Críticas', () => {
  describe('RealtimeService', () => {
    let realtimeService: RealtimeService;
    let server: any;

    beforeEach(() => {
      realtimeService = new RealtimeService();
      server = createServer();
    });

    it('deve inicializar servidor WebSocket', () => {
      expect(() => {
        realtimeService.initialize(server);
      }).not.toThrow();
    });

    it('deve notificar mudança de dados em canal', () => {
      const testData = { id: 1, nome: 'Teste' };
      const channel: RealtimeChannel = 'contas';

      expect(() => {
        realtimeService.notifyDataChange(channel, testData);
      }).not.toThrow();
    });

    it('deve notificar erro em canal', () => {
      const channel: RealtimeChannel = 'empresas';
      const errorMessage = 'Erro ao processar dados';

      expect(() => {
        realtimeService.notifyError(channel, errorMessage);
      }).not.toThrow();
    });

    it('deve notificar sucesso em canal', () => {
      const channel: RealtimeChannel = 'kpis';
      const message = 'Operação realizada com sucesso';

      expect(() => {
        realtimeService.notifySuccess(channel, message, { id: 1 });
      }).not.toThrow();
    });

    it('deve retornar número de clientes conectados', async () => {
      const connectedClients = realtimeService.getConnectedClients();
      expect(typeof connectedClients).toBe('number');
      expect(connectedClients).toBeGreaterThanOrEqual(0);
    });

    it('deve retornar número de clientes por canal', async () => {
      const clientsByChannel = realtimeService.getClientsByChannel('contas');
      expect(typeof clientsByChannel).toBe('number');
      expect(clientsByChannel).toBeGreaterThanOrEqual(0);
    });
  });

  describe('AuditService', () => {
    let auditService: AuditService;

    beforeEach(() => {
      auditService = new AuditService();
    });

    it('deve registrar criação de entidade', async () => {
      await expect(
        auditService.logCreate(
          1,
          'empresa',
          1,
          { nome: 'Empresa Teste', cnpj: '12345678000190' },
          '192.168.1.1',
          'Mozilla/5.0'
        )
      ).resolves.not.toThrow();
    });

    it('deve registrar atualização de entidade', async () => {
      await expect(
        auditService.logUpdate(
          1,
          'conta',
          1,
          { valor: 1000, status: 'Pago' },
          '192.168.1.1',
          'Mozilla/5.0'
        )
      ).resolves.not.toThrow();
    });

    it('deve registrar exclusão de entidade', async () => {
      await expect(
        auditService.logDelete(
          1,
          'kpi',
          1,
          '192.168.1.1',
          'Mozilla/5.0'
        )
      ).resolves.not.toThrow();
    });

    it('deve registrar login', async () => {
      await expect(
        auditService.logLogin(1, '192.168.1.1', 'Mozilla/5.0')
      ).resolves.not.toThrow();
    });

    it('deve registrar logout', async () => {
      await expect(
        auditService.logLogout(1, '192.168.1.1', 'Mozilla/5.0')
      ).resolves.not.toThrow();
    });

    it('deve registrar erro', async () => {
      await expect(
        auditService.logError(
          1,
          'CREATE',
          'empresa',
          'Erro ao criar empresa',
          '192.168.1.1',
          'Mozilla/5.0'
        )
      ).resolves.not.toThrow();
    });

    it('deve retornar logs vazios por padrão', async () => {
      const logs = await auditService.getLogs();
      expect(Array.isArray(logs)).toBe(true);
      expect(logs.length).toBe(0);
    });

    it('deve retornar logs por entidade vazios por padrão', async () => {
      const logs = await auditService.getLogsByEntity('empresa', 1);
      expect(Array.isArray(logs)).toBe(true);
      expect(logs.length).toBe(0);
    });

    it('deve retornar logs por usuário vazios por padrão', async () => {
      const logs = await auditService.getLogsByUser(1);
      expect(Array.isArray(logs)).toBe(true);
      expect(logs.length).toBe(0);
    });}
  });

  describe('Rate Limiting', () => {
    it('deve existir arquivo de rate limiting', async () => {
      const fs = await import('fs');
      const path = '/home/ubuntu/controle-empresarial/server/middleware/rateLimit.ts';
      expect(fs.existsSync(path)).toBe(true);
    });
  });

  describe('LoadingButton Component', () => {
    it('deve existir componente LoadingButton', async () => {
      const fs = await import('fs');
      const path = '/home/ubuntu/controle-empresarial/client/src/components/LoadingButton.tsx';
      expect(fs.existsSync(path)).toBe(true);
    });
  });

  describe('useRealtime Hook', () => {
    it('deve existir hook useRealtime', async () => {
      const fs = await import('fs');
      const path = '/home/ubuntu/controle-empresarial/client/src/hooks/useRealtime.ts';
      expect(fs.existsSync(path)).toBe(true);
    });
  });
});
