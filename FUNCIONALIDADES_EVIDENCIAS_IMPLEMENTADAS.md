# Funcionalidades de Evidências Implementadas

## Visão Geral

Este documento descreve a implementação completa do sistema de gerenciamento de evidências no frontend da aplicação, integrado com o backend fornecido. **ATUALIZADO** com geolocalização via mapa e input de data nativo.

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
- **Input de data nativo** com DateTimePicker
- **Geolocalização via mapa interativo** (igual à criação de casos)
- Integração com backend via hook
- Callback de retorno para atualização automática

**Validações:**
- Campos obrigatórios marcados com *
- Validação automática de data via DateTimePicker
- Verificação de localização selecionada no mapa
- Permissões de localização

**Geolocalização:**
- **Modal de mapa interativo** com react-native-maps
- **Captura automática** da localização atual do usuário
- **Seleção manual** clicando no mapa
- **Marcador arrastável** para ajuste fino
- **Exibição das coordenadas** selecionadas
- **Botão "Minha Localização"** para centralizar no usuário

**Input de Data:**
- **DateTimePicker nativo** (@react-native-community/datetimepicker)
- **Formato brasileiro** (DD/MM/AAAA)
- **Conversão automática** para formato ISO
- **Interface intuitiva** com ícone de calendário

#### 3.2 Tela de Editar Evidência (`screens/EditarEvidenciaScreen.js`)

**Funcionalidades:**
- Carregamento automático dos dados da evidência
- Formulário pré-preenchido com dados existentes
- Conversão automática de data ISO para formato brasileiro
- **Todas as funcionalidades da tela de adicionar**
- **Geolocalização preservada** ao editar
- Atualização em tempo real
- Callback de retorno para sincronização

**Melhorias na Edição:**
- **Localização existente** carregada no mapa
- **Preservação da localização** se não alterada
- **Carregamento inteligente** da região do mapa

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
  dataColeta: Date,       // Data de coleta (formato ISO)
  status: String,         // 'Em análise' ou 'Concluído'
  coletadaPor: ObjectId,  // Referência ao usuário
  geolocalizacao: {
    latitude: String,     // Latitude como string
    longitude: String     // Longitude como string
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

## Funcionalidades de Geolocalização (ATUALIZADO)

### Modal de Mapa Interativo
- **react-native-maps** para interface de mapa nativa
- **Modal fullscreen** para melhor experiência
- **Captura automática** da localização atual
- **Seleção manual** clicando no mapa
- **Marcador arrastável** para ajuste fino
- **Botão "Minha Localização"** integrado
- **Zoom e pan** para navegação

### Experiência do Usuário
- **Carregamento automático** da localização ao abrir
- **Feedback visual** das coordenadas selecionadas
- **Confirmação** antes de salvar
- **Tratamento de erros** de permissão
- **Interface consistente** com criação de casos

### Funcionalidades Avançadas
- **Preservação da localização** ao editar
- **Carregamento inteligente** da região do mapa
- **Conversão automática** de coordenadas
- **Validação de localização** obrigatória

## Input de Data Nativo (ATUALIZADO)

### DateTimePicker Integrado
- **@react-native-community/datetimepicker** para interface nativa
- **Formato brasileiro** (DD/MM/AAAA) para exibição
- **Conversão automática** para formato ISO para API
- **Interface intuitiva** com ícone de calendário
- **Validação automática** de formato

### Experiência do Usuário
- **Toque no campo** para abrir o picker
- **Seleção visual** da data
- **Fechamento automático** no Android
- **Preservação da data** ao editar
- **Conversão inteligente** entre formatos

## Tratamento de Erros

### Tipos de Erro Tratados
- Erros de rede/conexão
- Erros de permissão de localização
- Erros de validação de formulário
- Erros de autenticação
- Erros do servidor
- **Erros de carregamento do mapa**
- **Erros de DateTimePicker**

### Feedback ao Usuário
- Alertas informativos
- Mensagens de erro específicas
- Indicadores visuais de loading
- Confirmações para ações destrutivas
- **Feedback de localização confirmada**
- **Indicadores de carregamento do mapa**

## Performance e Otimização

### Cache Inteligente
- Cache local com expiração de 5 minutos
- Limpeza automática após operações de escrita
- Redução de requisições desnecessárias

### Sincronização Eficiente
- Atualização seletiva de dados
- Callbacks de retorno para atualização local
- Recarregamento apenas quando necessário

### Otimizações de Mapa
- **Carregamento lazy** do mapa
- **Região otimizada** para performance
- **Marcadores eficientes**
- **Gestão de memória** do modal

## Dependências Utilizadas

### Geolocalização
- `expo-location` - Permissões e captura de localização
- `react-native-maps` - Interface de mapa interativo

### Input de Data
- `@react-native-community/datetimepicker` - Picker nativo de data

### Outras Dependências
- `@react-native-picker/picker` - Seletores de tipo e status
- `@expo/vector-icons` - Ícones da interface
- `axios` - Requisições HTTP
- `@react-native-async-storage/async-storage` - Armazenamento local

## Próximos Passos

### Funcionalidades Futuras
1. **Upload de Imagens**: Integração com câmera/galeria
2. **Gestão de Textos**: Editor de texto para descrições
3. **Gestão de Laudos**: Criação e edição de laudos
4. **Filtros e Busca**: Filtros por tipo, status, data
5. **Visualização de Mapa**: Exibição das evidências em mapa na tela de casos
6. **Relatórios de Evidências**: Relatórios específicos
7. **Geocodificação**: Conversão de coordenadas para endereços
8. **Rota para Evidência**: Navegação GPS até a localização

### Melhorias Técnicas
1. **Offline Support**: Funcionalidade offline com sincronização
2. **Notificações**: Notificações push para atualizações
3. **Exportação**: Exportação de dados de evidências
4. **Backup**: Backup automático de dados
5. **Cache de Mapa**: Cache de tiles do mapa para offline
6. **Compressão de Imagens**: Otimização automática de imagens

## Conclusão

O sistema de evidências foi implementado de forma completa e robusta, seguindo as melhores práticas de desenvolvimento React Native e integração com APIs REST. **A implementação agora inclui geolocalização via mapa interativo e input de data nativo**, proporcionando uma experiência de usuário superior e consistente com o resto da aplicação.

### Principais Melhorias Implementadas:
- ✅ **Geolocalização via mapa** (igual à criação de casos)
- ✅ **Input de data nativo** com DateTimePicker
- ✅ **Interface consistente** com o padrão da aplicação
- ✅ **Experiência de usuário otimizada**
- ✅ **Validações robustas**
- ✅ **Tratamento de erros abrangente**

A arquitetura permite fácil manutenção e extensão das funcionalidades, com foco na experiência do usuário e performance da aplicação. 