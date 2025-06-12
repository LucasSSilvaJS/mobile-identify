# Solução para Botões "Adicionar" nas Seções

## Problema Identificado

O usuário solicitou que as seções de evidências, vítimas e relatórios sempre tenham o botão "Adicionar", com as seguintes regras:

1. **Evidências**: Sempre mostrar botão "Adicionar" (vazio ou preenchido)
2. **Vítimas**: Sempre mostrar botão "Adicionar" (vazio ou preenchido)
3. **Relatórios**: Mostrar botão "Adicionar" apenas quando não há relatório (máximo 1 por caso)

## Solução Implementada

### 1. Modificação da Tela de Detalhes

#### Funções de Navegação Adicionadas:
```javascript
const handleAdicionarEvidencia = () => {
  if (caso) {
    navigation.navigate('AdicionarEvidencia', { casoId: caso._id });
  }
};

const handleAdicionarVitima = () => {
  if (caso) {
    navigation.navigate('AdicionarVitima', { casoId: caso._id });
  }
};

const handleAdicionarRelatorio = () => {
  if (caso) {
    navigation.navigate('AdicionarRelatorio', { casoId: caso._id });
  }
};
```

#### Seção de Evidências - Sempre com Botão:
```javascript
<View style={styles.sectionCard}>
  <View style={styles.sectionHeader}>
    <Ionicons name="camera-outline" size={24} color="#8B5CF6" />
    <Text style={styles.sectionTitle}>
      Evidências {caso.evidencias && caso.evidencias.length > 0 ? `(${caso.evidencias.length})` : ''}
    </Text>
    <TouchableOpacity style={styles.addButton} onPress={handleAdicionarEvidencia}>
      <Ionicons name="add" size={20} color="#8B5CF6" />
      <Text style={styles.addButtonText}>Adicionar</Text>
    </TouchableOpacity>
  </View>
  
  {/* Conteúdo da seção */}
</View>
```

#### Seção de Vítimas - Sempre com Botão:
```javascript
<View style={styles.sectionCard}>
  <View style={styles.sectionHeader}>
    <Ionicons name="person-outline" size={24} color="#10B981" />
    <Text style={styles.sectionTitle}>
      Vítimas {caso.vitimas && caso.vitimas.length > 0 ? `(${caso.vitimas.length})` : ''}
    </Text>
    <TouchableOpacity style={[styles.addButton, { backgroundColor: '#10B981' }]} onPress={handleAdicionarVitima}>
      <Ionicons name="add" size={20} color="white" />
      <Text style={styles.addButtonText}>Adicionar</Text>
    </TouchableOpacity>
  </View>
  
  {/* Conteúdo da seção */}
</View>
```

#### Seção de Relatório - Botão Condicional:
```javascript
<View style={styles.sectionCard}>
  <View style={styles.sectionHeader}>
    <Ionicons name="document-text-outline" size={24} color="#3B82F6" />
    <Text style={styles.sectionTitle}>Relatório</Text>
    {!caso.relatorio && (
      <TouchableOpacity style={[styles.addButton, { backgroundColor: '#3B82F6' }]} onPress={handleAdicionarRelatorio}>
        <Ionicons name="add" size={20} color="white" />
        <Text style={styles.addButtonText}>Adicionar</Text>
      </TouchableOpacity>
    )}
  </View>
  
  {/* Conteúdo da seção */}
</View>
```

### 2. Criação da Tela AdicionarRelatorioScreen

Nova tela criada para adicionar relatórios:

#### Funcionalidades:
- Formulário com título e conteúdo
- Validação de campos obrigatórios
- Integração com API
- Navegação com ID do caso
- Interface consistente com outras telas

#### Estrutura:
```javascript
export default function AdicionarRelatorioScreen({ navigation, route }) {
  const [formData, setFormData] = useState({
    titulo: '',
    conteudo: '',
  });
  
  const handleSubmit = async () => {
    // Validação e envio para API
  };
}
```

### 3. Serviço de Relatórios

Adicionado ao arquivo `services/api.js`:

```javascript
export const relatoriosService = {
  // Listar relatórios
  getRelatorios: async () => { /* ... */ },
  
  // Obter relatório por ID
  getRelatorioById: async (id) => { /* ... */ },
  
  // Criar relatório
  createRelatorio: async (relatorioData) => { /* ... */ },
  
  // Atualizar relatório
  updateRelatorio: async (id, relatorioData) => { /* ... */ },
  
  // Excluir relatório
  deleteRelatorio: async (id) => { /* ... */ },
};
```

### 4. Configuração de Navegação

Adicionada rota nos stacks de navegação:

```javascript
// Stack Navigator para a tela Home
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="CriarCaso" component={CriarCasoScreen} />
      <Stack.Screen name="EditarCaso" component={CriarCasoScreen} />
      <Stack.Screen name="DetalhesCaso" component={DetalhesCasoScreen} />
      <Stack.Screen name="AdicionarEvidencia" component={AdicionarEvidenciaScreen} />
      <Stack.Screen name="AdicionarVitima" component={AdicionarVitimaScreen} />
      <Stack.Screen name="AdicionarRelatorio" component={AdicionarRelatorioScreen} />
    </Stack.Navigator>
  );
}
```

### 5. Estilos dos Botões

```javascript
addButton: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#8B5CF6',
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderRadius: 8,
  marginLeft: 'auto',
},
addButtonText: {
  fontSize: 14,
  fontWeight: '600',
  color: 'white',
  marginLeft: 4,
},
```

## Comportamento Implementado

### ✅ **Evidências**
- **Sempre mostra botão "Adicionar"**
- Contador dinâmico no título: "Evidências (3)" ou "Evidências"
- Cor roxa (#8B5CF6) para consistência visual

### ✅ **Vítimas**
- **Sempre mostra botão "Adicionar"**
- Contador dinâmico no título: "Vítimas (2)" ou "Vítimas"
- Cor verde (#10B981) para consistência visual

### ✅ **Relatórios**
- **Mostra botão "Adicionar" apenas quando não há relatório**
- Máximo 1 relatório por caso
- Cor azul (#3B82F6) para consistência visual
- Botão desaparece quando relatório existe

## Fluxo de Navegação

1. **Usuário toca "Adicionar"** → Navega para tela específica
2. **Passa ID do caso** → Via `route.params.casoId`
3. **Cria item** → Integração com API
4. **Volta para detalhes** → `useFocusEffect` recarrega dados
5. **Dados atualizados** → Interface reflete mudanças

## Benefícios da Solução

### 🎯 **Experiência do Usuário**
- Acesso rápido para adicionar itens
- Interface intuitiva e consistente
- Feedback visual claro sobre estado das seções

### 🔧 **Manutenibilidade**
- Código reutilizável
- Estrutura consistente
- Fácil extensão para novos tipos

### 📱 **Funcionalidade**
- Navegação fluida
- Validação adequada
- Integração completa com API

## Compatibilidade

- ✅ Funciona com API existente
- ✅ Compatível com React Navigation
- ✅ Suporta iOS e Android
- ✅ Mantém performance otimizada
- ✅ Integração com sistema de autenticação

## Resultado

Agora todas as seções têm botões "Adicionar" conforme solicitado:

- **Evidências**: Sempre disponível para adicionar
- **Vítimas**: Sempre disponível para adicionar  
- **Relatórios**: Disponível apenas quando não há relatório existente

A interface é consistente, intuitiva e permite fácil gerenciamento dos dados do caso! 🎉 