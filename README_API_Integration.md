# 🔗 Integração com API - Casos

## 📋 Visão Geral

Esta implementação conecta o frontend React Native ao backend Node.js/Express através da API REST para gerenciar casos.

## 🏗️ Arquitetura

### **📁 Estrutura de Arquivos**

```
├── config/
│   └── api.js                 # Configurações da API
├── services/
│   └── casoService.js         # Serviços para casos
├── screens/
│   ├── CasosScreen.js         # Listagem de casos
│   └── DetalhesCasoScreen.js  # Detalhes do caso
└── contexts/
    └── AuthContext.js         # Contexto de autenticação
```

### **🔧 Componentes Principais**

#### **1. Configuração da API** (`config/api.js`)
```javascript
export const API_BASE_URL = 'https://backend-pi-26cz.onrender.com';
```

#### **2. Serviço de Casos** (`services/casoService.js`)
```javascript
// Funções disponíveis:
- getCasoById(id, token)           // GET /casos/:id
- updateCaso(id, dados, token)     // PUT /casos/:id
- deleteCaso(id, userId, token)    // DELETE /casos/:id
- getCasos(filtros, token)         // GET /casos
- createCaso(dados, token)         // POST /casos
- addEvidenciaToCaso(...)          // POST /casos/:id/evidencias
- removeEvidenciaFromCaso(...)     // DELETE /casos/:id/evidencias
- addRelatorioToCaso(...)          // POST /casos/relatorio
- removeRelatorioFromCaso(...)     // DELETE /casos/relatorio
- addVitimaToCaso(...)             // POST /casos/:id/vitimas
- removeVitimaFromCaso(...)        // DELETE /casos/:id/vitimas
```

## 🔐 Autenticação

### **Token JWT**
- Todas as requisições incluem o header `Authorization: Bearer <token>`
- Token obtido do contexto de autenticação
- Validação automática de permissões no backend

### **Função getAuthToken**
A função `getAuthToken` está disponível no contexto de autenticação e é **assíncrona**:

```javascript
import { useAuth } from '../contexts/AuthContext';

export default function MinhaTela() {
  const { getAuthToken, user } = useAuth();

  const fazerRequisicao = async () => {
    try {
      // ⚠️ IMPORTANTE: getAuthToken é assíncrona, use await
      const token = await getAuthToken();
      
      if (token) {
        const dados = await casoService.getCasoById(casoId, token);
        // ... processar dados
      } else {
        console.log('Usuário não autenticado');
      }
    } catch (error) {
      console.error('Erro:', error);
    }
  };
}
```

### **Permissões por Rota**
```javascript
// GET /casos/:id - admin, perito, assistente
// PUT /casos/:id - admin, perito
// DELETE /casos/:id - admin, perito
```

## 📱 Como Usar

### **1. Importar o Contexto de Autenticação**
```javascript
import { useAuth } from '../contexts/AuthContext';
```

### **2. Obter Token de Autenticação**
```javascript
const { getAuthToken, user } = useAuth();

// Em uma função assíncrona:
const token = await getAuthToken();
```

### **3. Fazer Requisições Autenticadas**
```javascript
// Exemplo de uso na tela de detalhes
const carregarCaso = async () => {
  try {
    const token = await getAuthToken();
    const dadosCaso = await casoService.getCasoById(casoId, token);
    setCaso(dadosCaso);
  } catch (error) {
    console.error('Erro ao carregar caso:', error);
  }
};
```

## 🎯 Funcionalidades Implementadas

### **✅ Carregamento de Dados**
- Busca caso específico por ID
- Popula campos com dados do backend
- Tratamento de dados ausentes
- Formatação de datas

### **✅ Ações do Caso**
- **Exclusão**: Confirmação + chamada à API
- **Edição**: Navegação preparada
- **Compartilhamento**: Placeholder

### **✅ Tratamento de Erros**
- Mensagens específicas por tipo de erro
- Botão de "Tentar Novamente"
- Logs detalhados no console

### **✅ Debug e Logs**
- Logs de requisições HTTP
- Logs de respostas do servidor
- Logs de erros detalhados
- Informações de debug na interface

## 🔄 Fluxo de Dados

```
1. Usuário clica em um caso na listagem
2. Navegação passa o ID do caso
3. Tela carrega dados da API com token
4. Exibe informações organizadas
5. Permite ações (editar, excluir, etc.)
```

## 🛠️ Configuração

### **1. URL da API**
```javascript
// config/api.js
export const API_BASE_URL = 'https://backend-pi-26cz.onrender.com';
```

### **2. Autenticação**
```javascript
// contexts/AuthContext.js
const token = getAuthToken();
```

### **3. Permissões**
Verificar se o usuário tem as permissões necessárias no backend.

## 🐛 Troubleshooting

### **Erro 401 - Não autorizado**
- Verificar se o token está válido
- Verificar permissões do usuário
- Fazer login novamente se necessário

### **Erro 404 - Caso não encontrado**
- Verificar se o ID está correto
- Verificar se o caso existe no banco
- Verificar permissões

### **Erro de Rede**
- Verificar URL da API
- Verificar conectividade
- Verificar CORS no backend

### **Debug**
```javascript
// Logs no console:
🔍 DetalhesCasoScreen - casoId: 123
🔄 Iniciando carregamento do caso: 123
🔑 Token obtido: Sim
🌐 Requisição HTTP: { url: "...", method: "GET" }
📡 Resposta HTTP: { status: 200, ... }
✅ Dados recebidos: { ... }
```

## 📝 Estrutura de Dados

### **Resposta da API GET /casos/:id**
```javascript
{
  _id: "string",
  titulo: "string",
  descricao: "string",
  status: "Em andamento" | "Finalizado" | "Arquivado",
  dataAbertura: "2024-03-15T00:00:00.000Z",
  dataFechamento: "2024-03-15T00:00:00.000Z",
  geolocalizacao: {
    latitude: "string",
    longitude: "string"
  },
  evidencias: ["array"],
  vitimas: ["array"],
  relatorio: "string",
  createdAt: "2024-03-15T00:00:00.000Z",
  updatedAt: "2024-03-15T00:00:00.000Z"
}
```

## 🚀 Próximos Passos

### **1. Implementar Edição**
- Criar tela de edição
- Conectar com PUT /casos/:id
- Validação de formulários

### **2. Adicionar Evidências/Vítimas**
- Telas para adicionar evidências
- Telas para adicionar vítimas
- Upload de arquivos

### **3. Melhorar UX**
- Pull-to-refresh
- Cache de dados
- Offline support

## 🔧 Dependências

```json
{
  "@react-native-async-storage/async-storage": "^1.x.x"
}
```

---

**✅ Implementação completa e funcional para integração com backend Node.js/Express** 