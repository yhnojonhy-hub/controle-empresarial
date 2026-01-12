import openpyxl
import subprocess
import json

# Ler planilha
wb = openpyxl.load_workbook('/home/ubuntu/upload/Controle_Empresarial_Nivel_CEO.xlsx')
ws = wb['Empresas']

empresas = []
for row in ws.iter_rows(min_row=2, values_only=True):
    if row[3]:  # Se tem CNPJ
        empresa = {
            'razaoSocial': row[1],
            'nomeFantasia': row[2],
            'cnpj': row[3],
            'capitalSocial': str(row[4]) if row[4] else None,
            'cnae': row[5],
            'regimeTributario': row[6],
            'enderecoCompleto': row[7],
            'cidade': row[8],
            'estado': row[9],
            'responsavelLegal': row[10],
            'telefone': row[11],
            'email': row[12],
            'dataAbertura': str(row[13]) if row[13] else None,
            'status': row[14] if row[14] else 'Aberto'
        }
        empresas.append(empresa)

print(f"✓ Encontradas {len(empresas)} empresas na planilha")
for emp in empresas:
    print(f"  - {emp['nomeFantasia'] or emp['razaoSocial']} ({emp['cnpj']})")

# Salvar JSON para importação via API
with open('/tmp/empresas_import.json', 'w', encoding='utf-8') as f:
    json.dump(empresas, f, ensure_ascii=False, indent=2)

print("\n✓ Dados salvos em /tmp/empresas_import.json")
