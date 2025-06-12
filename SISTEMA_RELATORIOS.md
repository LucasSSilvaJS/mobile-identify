# Sistema de Relatórios - Mobile Identify

## Visão Geral

O sistema de relatórios foi implementado seguindo a estrutura do backend fornecido, oferecendo funcionalidades completas para criação, visualização, edição e geração automática de relatórios usando inteligência artificial.

## Funcionalidades Implementadas

### 1. Listagem de Relatórios
- **Tela**: `RelatoriosScreen.js`
- **Funcionalidade**: Lista todos os relatórios do sistema
- **Recursos**:
  - Pull-to-refresh para atualizar a lista
  - Exibição de título, data de criação e perito responsável
  - Preview do conteúdo (truncado)
  - Botões de ação para editar e excluir
  - Estados de loading e erro

### 2. Visualização de Detalhes
- **Tela**: `DetalhesRelatorioScreen.js`
- **Funcionalidade**: Exibe detalhes completos de um relatório
- **Recursos**:
  - Informações completas do relatório
  - Conteúdo formatado
  - Botões para editar e compartilhar
  - Formatação de datas
  - Estados de loading e erro

### 3. Criação Manual de Relatórios
- **Tela**: `AdicionarRelatorioScreen.js`
- **Funcionalidade**: Permite criar relatórios manualmente
- **Recursos**:
  - Formulário com título e conteúdo
  - Validação de campos obrigatórios
  - Integração com o caso específico
  - Estados de loading durante criação

### 4. Edição de Relatórios
- **Tela**: `EditarRelatorioScreen.js`
- **Funcionalidade**: Permite editar relatórios existentes
- **Recursos**:
  - Carregamento automático dos dados existentes
  - Formulário pré-preenchido
  - Validação de campos
  - Atualização em tempo real

### 5. Geração Automática com IA
- **Funcionalidade**: Gera relatórios automaticamente usando Gemini
- **Recursos**:
  - Análise automática dos dados do caso
  - Geração de relatório estruturado
  - Integração com vítimas, evidências e odontogramas
  - Prompt especializado para perícia odontolegal

### 6. Integração com Casos
- **Localização**: `DetalhesCasoScreen.js`
- **Funcionalidade**: Interface para gerenciar relatórios de casos
- **Recursos**:
  - Botões para criar manualmente ou com IA
  - Visualização do relatório existente
  - Botão para editar relatório existente
  - Estados diferentes baseados na existência do relatório

## Estrutura de Navegação

### Aba de Relatórios
- Nova aba "Relatórios" na navegação principal
- Stack dedicado para telas de relatórios
- Navegação entre listagem, detalhes e edição

### Integração com Casos
- Navegação a partir dos detalhes do caso
- Botões contextuais baseados no estado do relatório
- Retorno automático após operações

## Serviços de API

### relatoriosService
```javascript
// Listar todos os relatórios
getRelatorios()

// Obter relatório por ID
getRelatorioById(id)

// Criar novo relatório
createRelatorio(relatorioData)

// Atualizar relatório
updateRelatorio(id, relatorioData)

// Excluir relatório
deleteRelatorio(id, userId, casoId)

// Gerar relatório com IA
generateRelatorioWithGemini(casoId, userId)
```

## Estrutura de Dados

### Relatório
```javascript
{
  _id: String,
  titulo: String,
  conteudo: String,
  peritoResponsavel: {
    _id: String,
    username: String,
    email: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Payload para Criação
```javascript
{
  casoId: String,
  userId: String,
  titulo: String,
  conteudo: String,
  peritoResponsavel: String
}
```

## Fluxo de Geração com IA

1. **Seleção**: Usuário clica em "IA" na seção de relatórios
2. **Confirmação**: Alert de confirmação é exibido
3. **Processamento**: Loading é mostrado durante a geração
4. **Análise**: Backend analisa dados do caso (vítimas, evidências, etc.)
5. **Geração**: Gemini cria relatório estruturado
6. **Salvamento**: Relatório é salvo e associado ao caso
7. **Atualização**: Tela é recarregada para mostrar o novo relatório

## Permissões e Controle de Acesso

### Baseado no Backend
- **Admin e Perito**: Podem criar, editar e excluir relatórios
- **Assistente**: Pode visualizar relatórios
- **Autenticação**: Token JWT obrigatório para todas as operações

## Tratamento de Erros

### Estados de Erro
- **Loading**: Indicador de carregamento
- **Error**: Mensagem de erro com opção de retry
- **Empty**: Estado vazio com mensagem explicativa
- **Network**: Tratamento de erros de conexão

### Validações
- Campos obrigatórios
- IDs válidos
- Permissões de usuário
- Estados de caso (relatório já existe)

## Estilos e UI/UX

### Design System
- Cores consistentes com o resto do app
- Ícones do Ionicons
- Cards com sombras e bordas arredondadas
- Botões com estados de loading
- Feedback visual para ações

### Responsividade
- Adaptação para diferentes tamanhos de tela
- Keyboard avoiding view
- Scroll views com pull-to-refresh
- Safe area handling

## Integração com Backend

### Endpoints Utilizados
- `POST /relatorios` - Criar relatório
- `GET /relatorios` - Listar relatórios
- `GET /relatorios/:id` - Obter relatório
- `PUT /relatorios/:id` - Atualizar relatório
- `DELETE /relatorios/:id` - Excluir relatório
- `POST /relatorios/generate` - Gerar com IA

### Autenticação
- Token JWT incluído automaticamente
- Interceptors para refresh de token
- Tratamento de erros 401

## Melhorias Futuras

### Funcionalidades Sugeridas
1. **Filtros e Busca**: Filtrar relatórios por data, perito, caso
2. **Exportação**: Exportar relatórios em PDF
3. **Templates**: Templates predefinidos para diferentes tipos
4. **Versões**: Histórico de versões dos relatórios
5. **Comentários**: Sistema de comentários e revisões
6. **Notificações**: Alertas para relatórios pendentes

### Otimizações Técnicas
1. **Cache**: Cache local para relatórios frequentes
2. **Offline**: Funcionalidade offline para visualização
3. **Performance**: Lazy loading para listas grandes
4. **Acessibilidade**: Melhorias de acessibilidade

## Como Usar

### Criar Relatório Manualmente
1. Acesse os detalhes de um caso
2. Na seção "Relatório", clique em "Manual"
3. Preencha título e conteúdo
4. Clique em "Criar Relatório"

### Gerar Relatório com IA
1. Acesse os detalhes de um caso
2. Na seção "Relatório", clique em "IA"
3. Confirme a geração
4. Aguarde o processamento
5. Visualize o relatório gerado

### Editar Relatório
1. Acesse os detalhes de um caso com relatório
2. Clique em "Editar" na seção de relatório
3. Modifique título e/ou conteúdo
4. Clique em "Atualizar Relatório"

### Visualizar Todos os Relatórios
1. Acesse a aba "Relatórios"
2. Visualize a lista de todos os relatórios
3. Clique em um relatório para ver detalhes
4. Use pull-to-refresh para atualizar

## Troubleshooting

### Problemas Comuns
1. **Erro 401**: Token expirado - faça login novamente
2. **Erro 404**: Relatório não encontrado - verifique o ID
3. **Erro 400**: Dados inválidos - verifique os campos obrigatórios
4. **Erro de IA**: Problema no serviço Gemini - tente novamente

### Logs e Debug
- Console logs para operações importantes
- Tratamento de erros detalhado
- Estados de loading visíveis
- Feedback de sucesso/erro para o usuário 