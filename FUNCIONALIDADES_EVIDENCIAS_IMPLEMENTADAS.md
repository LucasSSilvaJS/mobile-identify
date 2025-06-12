# Funcionalidades de Evidências Implementadas

## Visão Geral

Este documento descreve a implementação completa do sistema de gerenciamento de evidências no frontend da aplicação, integrado com o backend fornecido.

## Funcionalidades Implementadas

### 1. Serviço de API (`services/api.js`)

#### Funções CRUD Básicas:
- `getEvidencias()` - Listar todas as evidências
- `getEvidenciaById(id)` - Buscar evidência por ID
- `createEvidencia(evidenciaData)` - Criar nova evidência
- `updateEvidencia(id, evidenciaData)` - Atualizar evidência
- `deleteEvidencia(id, userId, casoId)` - Excluir evidência

#### Funções de Relacionamentos:
- `addImagemToEvidencia(id, idImagem)` - Adicionar imagem à evidência
- `removeImagemFromEvidencia(id, idImagem)` - Remover imagem da evidência
- `addTextoToEvidencia(id, idTexto)` - Adicionar texto à evidência
- `removeTextoFromEvidencia(id, idTexto)` - Remover texto da evidência
- `addLaudoToEvidencia(id, idLaudo)` - Adicionar laudo à evidência
- `removeLaudoFromEvidencia(id)` - Remover laudo da evidência

### 2. Hook Personalizado (`hooks/useEvidencias.js`)

#### Características:
- **Cache Inteligente**: Cache local com expiração de 5 minutos
- **Sincronização Automática**: Atualização automática da lista após operações CRUD
- **Gerenciamento de Estado**: Estados de loading, erro e dados
- **Funções Otimizadas**: Todas as operações com tratamento de erro

#### Funções Disponíveis:
```javascript
const {
  evidencias,           // Lista de evidências
  loading,             // Estado de carregamento
  error,               // Estado de erro
  getEvidencias,       // Buscar evidências
  getEvidenciaById,    // Buscar por ID
  criarEvidencia,      // Criar evidência
  atualizarEvidencia,  // Atualizar evidência
  excluirEvidencia,    // Excluir evidência
  adicionarImagem,     // Adicionar imagem
  removerImagem,       // Remover imagem
  adicionarTexto,      // Adicionar texto
  removerTexto,        // Remover texto
  adicionarLaudo,      // Adicionar laudo
  removerLaudo,        // Remover laudo
  limparCache,         // Limpar cache
  limparErro           // Limpar erro
} = useEvidencias();
```

### 3. Telas Implementadas

#### 3.1 Tela de Adicionar Evidência (`screens/AdicionarEvidenciaScreen.js`)

**Funcionalidades:**
- Formulário completo com validações
- Seleção de tipo de evidência (13 opções)
- Seleção de status (Em análise/Concluído)
- Campo de data de coleta com validação de formato
- Geolocalização automática com GPS
- Campos manuais para latitude/longitude
- Integração com backend via hook
- Callback de retorno para atualização automática

**Validações:**
- Campos obrigatórios marcados com *
- Validação de formato de data (DD/MM/AAAA)
- Verificação de coordenadas geográficas
- Permissões de localização

#### 3.2 Tela de Editar Evidência (`screens/EditarEvidenciaScreen.js`)

**Funcionalidades:**
- Carregamento automático dos dados da evidência
- Formulário pré-preenchido com dados existentes
- Conversão automática de data ISO para formato brasileiro
- Todas as funcionalidades da tela de adicionar
- Atualização em tempo real
- Callback de retorno para sincronização

### 4. Integração na Tela de Detalhes do Caso

#### 4.1 Seção de Evidências Atualizada

**Funcionalidades:**
- Lista de evidências com informações detalhadas
- Botão "Adicionar Evidência" com callback de retorno
- Botões de ação para cada evidência:
  - **Editar**: Navega para tela de edição
  - **Excluir**: Confirmação e exclusão com atualização automática
- Exibição de informações:
  - Tipo da evidência com badge colorido
  - Data de coleta formatada
  - Status atual
  - Coordenadas geográficas
  - Responsável pela coleta

#### 4.2 Sincronização Automática

**Mecanismos:**
- `useFocusEffect` para recarregar dados ao receber foco
- Callbacks `onReturn` nas navegações
- Atualização automática após operações CRUD
- Cache inteligente para performance

### 5. Navegação Atualizada

#### 5.1 Rotas Adicionadas (`App.js`)

```javascript
// Stack de navegação atualizado
<Stack.Screen name="AdicionarEvidencia" component={AdicionarEvidenciaScreen} />
<Stack.Screen name="EditarEvidencia" component={EditarEvidenciaScreen} />
```

#### 5.2 Fluxo de Navegação

1. **Tela de Casos** → **Detalhes do Caso** → **Adicionar Evidência**
2. **Tela de Casos** → **Detalhes do Caso** → **Editar Evidência**
3. **Tela de Casos** → **Detalhes do Caso** → **Excluir Evidência**

## Estrutura de Dados

### Modelo de Evidência
```javascript
{
  _id: String,
  tipo: String,           // Tipo da evidência
  dataColeta: Date,       // Data de coleta
  status: String,         // 'Em análise' ou 'Concluído'
  coletadaPor: ObjectId,  // Referência ao usuário
  geolocalizacao: {
    latitude: String,
    longitude: String
  },
  imagens: [ObjectId],    // Array de imagens
  textos: [ObjectId],     // Array de textos
  laudo: ObjectId,        // Referência ao laudo
  createdAt: Date,
  updatedAt: Date
}
```

## Tipos de Evidência Suportados

1. Foto
2. Documento
3. Impressão Digital
4. Amostra Biológica
5. Arma Vestígio
6. Vídeo
7. Áudio
8. Objeto
9. Local
10. Testemunho
11. Laudo Técnico
12. Relatório
13. Outros

## Funcionalidades de Geolocalização

### Obtenção Automática
- Solicitação de permissões de localização
- Captura de coordenadas GPS de alta precisão
- Feedback visual durante o processo
- Tratamento de erros de permissão/GPS

### Entrada Manual
- Campos para latitude e longitude
- Validação de formato
- Exemplos de coordenadas brasileiras

## Tratamento de Erros

### Tipos de Erro Tratados
- Erros de rede/conexão
- Erros de permissão de localização
- Erros de validação de formulário
- Erros de autenticação
- Erros do servidor

### Feedback ao Usuário
- Alertas informativos
- Mensagens de erro específicas
- Indicadores visuais de loading
- Confirmações para ações destrutivas

## Performance e Otimização

### Cache Inteligente
- Cache local com expiração de 5 minutos
- Limpeza automática após operações de escrita
- Redução de requisições desnecessárias

### Sincronização Eficiente
- Atualização seletiva de dados
- Callbacks de retorno para atualização local
- Recarregamento apenas quando necessário

## Próximos Passos

### Funcionalidades Futuras
1. **Upload de Imagens**: Integração com câmera/galeria
2. **Gestão de Textos**: Editor de texto para descrições
3. **Gestão de Laudos**: Criação e edição de laudos
4. **Filtros e Busca**: Filtros por tipo, status, data
5. **Visualização de Mapa**: Exibição das evidências em mapa
6. **Relatórios de Evidências**: Relatórios específicos

### Melhorias Técnicas
1. **Offline Support**: Funcionalidade offline com sincronização
2. **Notificações**: Notificações push para atualizações
3. **Exportação**: Exportação de dados de evidências
4. **Backup**: Backup automático de dados

## Conclusão

O sistema de evidências foi implementado de forma completa e robusta, seguindo as melhores práticas de desenvolvimento React Native e integração com APIs REST. A arquitetura permite fácil manutenção e extensão das funcionalidades, com foco na experiência do usuário e performance da aplicação. 