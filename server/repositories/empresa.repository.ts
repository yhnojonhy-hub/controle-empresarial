/**
 * Empresa Repository
 * 
 * Responsabilidade: Acesso a dados de empresas no banco
 * Princípios SOLID aplicados:
 * - SRP: Única responsabilidade de acesso a dados
 * - DIP: Implementa interface Repository (inversão de dependência)
 * - ISP: Interface segregada apenas com métodos necessários
 */

import type { Repository } from "../services/base.service";
import * as db from "../db";
import type { Empresa, InsertEmpresa } from "../../drizzle/schema";

export class EmpresaRepository implements Repository<Empresa> {
  async findAll(): Promise<Empresa[]> {
    return await db.getEmpresas();
  }

  async findById(id: number): Promise<Empresa | undefined> {
    return await db.getEmpresaById(id);
  }

  async create(data: Partial<Empresa>): Promise<Empresa> {
    const insertData = data as InsertEmpresa;
    await db.createEmpresa(insertData);
    
    // Retornar empresa criada
    const empresas = await db.getEmpresas();
    const created = empresas.find(e => e.cnpj === insertData.cnpj);
    if (!created) {
      throw new Error("Erro ao criar empresa");
    }
    return created;
  }

  async update(id: number, data: Partial<Empresa>): Promise<Empresa> {
    await db.updateEmpresa(id, data);
    const updated = await db.getEmpresaById(id);
    if (!updated) {
      throw new Error("Empresa não encontrada após atualização");
    }
    return updated;
  }

  async delete(id: number): Promise<void> {
    await db.deleteEmpresa(id);
  }

  // Métodos específicos do domínio
  async findByCNPJ(cnpj: string): Promise<Empresa | undefined> {
    const empresas = await this.findAll();
    return empresas.find(e => e.cnpj === cnpj);
  }

  async findByStatus(status: string): Promise<Empresa[]> {
    const empresas = await this.findAll();
    return empresas.filter(e => e.status === status);
  }
}

export const empresaRepository = new EmpresaRepository();
