/**
 * Base Service
 * 
 * Responsabilidade: Fornecer operações CRUD genéricas reutilizáveis
 * Princípios SOLID aplicados:
 * - SRP: Responsabilidade única de operações CRUD
 * - OCP: Classes podem estender e adicionar comportamento específico
 * - LSP: Subclasses podem substituir a classe base
 * - DRY: Elimina repetição de código CRUD em múltiplos serviços
 */

export interface Repository<T> {
  findAll(): Promise<T[]>;
  findById(id: number): Promise<T | undefined>;
  create(data: Partial<T>): Promise<T>;
  update(id: number, data: Partial<T>): Promise<T>;
  delete(id: number): Promise<void>;
}

export abstract class BaseService<T> {
  constructor(protected repository: Repository<T>) {}

  async getAll(): Promise<T[]> {
    return await this.repository.findAll();
  }

  async getById(id: number): Promise<T | undefined> {
    if (id <= 0) {
      throw new Error("ID inválido");
    }
    return await this.repository.findById(id);
  }

  async create(data: Partial<T>): Promise<T> {
    this.validateCreate(data);
    return await this.repository.create(data);
  }

  async update(id: number, data: Partial<T>): Promise<T> {
    if (id <= 0) {
      throw new Error("ID inválido");
    }
    this.validateUpdate(data);
    return await this.repository.update(id, data);
  }

  async delete(id: number): Promise<void> {
    if (id <= 0) {
      throw new Error("ID inválido");
    }
    await this.repository.delete(id);
  }

  // Template Method Pattern: Subclasses podem sobrescrever validações
  protected validateCreate(data: Partial<T>): void {
    // Validação padrão (pode ser sobrescrita)
  }

  protected validateUpdate(data: Partial<T>): void {
    // Validação padrão (pode ser sobrescrita)
  }
}

/**
 * Factory genérico para criar procedures tRPC (DRY)
 * Elimina repetição de código de procedures CRUD
 */
export function createCRUDProcedures<T>(
  service: BaseService<T>,
  schemas: {
    create: any;
    update: any;
    idSchema: any;
  }
) {
  return {
    list: async () => service.getAll(),
    
    getById: async (input: { id: number }) => service.getById(input.id),
    
    create: async (input: any) => service.create(input),
    
    update: async (input: any) => {
      const { id, ...data } = input;
      return service.update(id, data);
    },
    
    delete: async (input: { id: number }) => service.delete(input.id),
  };
}
