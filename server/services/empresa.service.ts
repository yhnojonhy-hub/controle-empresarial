/**
 * Empresa Service
 * 
 * Responsabilidade: Lógica de negócio para empresas
 * Princípios SOLID aplicados:
 * - SRP: Lógica de negócio de empresas
 * - OCP: Estende BaseService, adiciona comportamento específico
 * - LSP: Pode substituir BaseService
 * - DIP: Depende de Repository (abstração)
 */

import { BaseService } from "./base.service";
import { EmpresaRepository } from "../repositories/empresa.repository";
import { cnpjService, CNPJService } from "./cnpj.service";
import type { Empresa, InsertEmpresa } from "../../drizzle/schema";
import { notifyOwner } from "../_core/notification";

export class EmpresaService extends BaseService<Empresa> {
  constructor(
    repository: EmpresaRepository,
    private cnpjService: CNPJService
  ) {
    super(repository);
  }

  /**
   * Consulta dados de CNPJ em APIs externas
   */
  async consultarCNPJ(cnpj: string) {
    return await this.cnpjService.consultar(cnpj);
  }

  /**
   * Cria empresa e notifica CEO
   * SRP: Orquestra operações mas delega execução
   */
  async createWithNotification(data: InsertEmpresa): Promise<Empresa> {
    const empresa = await this.create(data);
    
    // Notificar CEO sobre nova empresa (fire and forget)
    notifyOwner({
      title: "Nova Empresa Cadastrada",
      content: `${empresa.nomeFantasia || empresa.razaoSocial} (${empresa.cnpj}) foi adicionada ao sistema.`,
    }).catch(console.error);

    return empresa;
  }

  /**
   * Busca empresa por CNPJ
   */
  async getByCNPJ(cnpj: string): Promise<Empresa | undefined> {
    const repo = this.repository as EmpresaRepository;
    return await repo.findByCNPJ(cnpj);
  }

  /**
   * Lista empresas ativas
   */
  async getActive(): Promise<Empresa[]> {
    const repo = this.repository as EmpresaRepository;
    return await repo.findByStatus("Aberto");
  }

  /**
   * Validação específica de empresas
   */
  protected validateCreate(data: Partial<Empresa>): void {
    if (!data.cnpj) {
      throw new Error("CNPJ é obrigatório");
    }

    const cnpjLimpo = data.cnpj.replace(/[^\d]/g, "");
    if (cnpjLimpo.length !== 14) {
      throw new Error("CNPJ inválido");
    }
  }

  protected validateUpdate(data: Partial<Empresa>): void {
    if (data.cnpj) {
      const cnpjLimpo = data.cnpj.replace(/[^\d]/g, "");
      if (cnpjLimpo.length !== 14) {
        throw new Error("CNPJ inválido");
      }
    }
  }
}

// Singleton com injeção de dependências
export const empresaService = new EmpresaService(
  new EmpresaRepository(),
  cnpjService
);
