/**
 * CNPJ Service
 * 
 * Responsabilidade: Consultar dados de CNPJ em APIs externas
 * Princípios SOLID aplicados:
 * - SRP: Única responsabilidade de consultar CNPJ
 * - OCP: Aberto para extensão (novos providers) fechado para modificação
 * - DIP: Depende de abstrações (CNPJProvider interface)
 */

export interface CNPJData {
  razaoSocial?: string;
  nomeFantasia?: string;
  cnpj: string;
  capitalSocial?: number | null;
  cnae?: string;
  enderecoCompleto?: string;
  cidade?: string;
  estado?: string;
  telefone?: string;
  email?: string;
  dataAbertura?: string;
  status?: string;
}

export interface CNPJProvider {
  name: string;
  consultar(cnpj: string): Promise<CNPJData>;
}

class BrasilAPIProvider implements CNPJProvider {
  name = "BrasilAPI";

  async consultar(cnpj: string): Promise<CNPJData> {
    const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
    if (!response.ok) {
      throw new Error(`${this.name} retornou status ${response.status}`);
    }

    const data = await response.json();
    return {
      razaoSocial: data.razao_social || data.nome_fantasia,
      nomeFantasia: data.nome_fantasia,
      cnpj: data.cnpj,
      capitalSocial: data.capital_social ? parseFloat(data.capital_social) : null,
      cnae: data.cnae_fiscal_descricao,
      enderecoCompleto: `${data.logradouro}, ${data.numero} - ${data.bairro}`,
      cidade: data.municipio,
      estado: data.uf,
      telefone: data.ddd_telefone_1,
      email: data.email,
      dataAbertura: data.data_inicio_atividade,
      status: data.situacao_cadastral === "ATIVA" ? "Aberto" : "Fechado",
    };
  }
}

class ReceitaWSProvider implements CNPJProvider {
  name = "ReceitaWS";

  async consultar(cnpj: string): Promise<CNPJData> {
    const response = await fetch(`https://www.receitaws.com.br/v1/cnpj/${cnpj}`);
    if (!response.ok) {
      throw new Error(`${this.name} retornou status ${response.status}`);
    }

    const data = await response.json();
    return {
      razaoSocial: data.nome,
      nomeFantasia: data.fantasia,
      cnpj: data.cnpj,
      capitalSocial: data.capital_social
        ? parseFloat(data.capital_social.replace(/[^\d,]/g, "").replace(",", "."))
        : null,
      cnae: data.atividade_principal?.[0]?.text,
      enderecoCompleto: `${data.logradouro}, ${data.numero} - ${data.bairro}`,
      cidade: data.municipio,
      estado: data.uf,
      telefone: data.telefone,
      email: data.email,
      dataAbertura: data.abertura,
      status: data.situacao === "ATIVA" ? "Aberto" : "Fechado",
    };
  }
}

export class CNPJService {
  private providers: CNPJProvider[];

  constructor(providers?: CNPJProvider[]) {
    // DIP: Injeção de dependências permite trocar providers facilmente
    this.providers = providers || [new BrasilAPIProvider(), new ReceitaWSProvider()];
  }

  /**
   * Consulta CNPJ tentando múltiplos providers em sequência
   * DRY: Loop elimina repetição de try/catch para cada provider
   */
  async consultar(cnpj: string): Promise<CNPJData> {
    const cnpjLimpo = cnpj.replace(/[^\d]/g, "");

    // DRY: Loop através dos providers ao invés de código duplicado
    for (const provider of this.providers) {
      try {
        const result = await provider.consultar(cnpjLimpo);
        console.log(`✓ CNPJ consultado com sucesso via ${provider.name}`);
        return result;
      } catch (error) {
        console.warn(`✗ ${provider.name} falhou:`, error);
        // Continua para o próximo provider
      }
    }

    throw new Error("Não foi possível consultar o CNPJ em nenhum provider");
  }

  /**
   * Adiciona novo provider (OCP: Aberto para extensão)
   */
  addProvider(provider: CNPJProvider): void {
    this.providers.push(provider);
  }
}

// Singleton instance para reutilização
export const cnpjService = new CNPJService();
