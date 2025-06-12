# Solução para Edição de Casos

## Problema Identificado

O usuário reportou que ao tentar editar um caso, havia problema com o payload da navegação. O erro ocorria porque:

1. A tela `EditarCaso` não estava definida na configuração de navegação
2. A tela de criar caso não suportava edição
3. Não havia função para atualizar casos no serviço

## Solução Implementada

### 1. Modificação da Tela CriarCasoScreen

A tela `CriarCasoScreen` foi modificada para suportar tanto criação quanto edição:

#### Novos Estados Adicionados:
```javascript
const [isEditing, setIsEditing] = useState(false);
const [casoId, setCasoId] = useState(null);
```

#### Verificação de Parâmetros de Rota:
```javascript
useEffect(() => {
  if (route.params?.caso) {
    const caso = route.params.caso;
    setIsEditing(true);
    setCasoId(caso._id);
    
    // Preencher formulário com dados do caso
    setFormData({
      titulo: caso.titulo || '',
      status: caso.status || 'Em andamento',
      descricao: caso.descricao || '',
      dataAbertura: caso.dataAbertura ? formatarDataParaExibicao(caso.dataAbertura) : '',
      dataConclusao: caso.dataFechamento ? formatarDataParaExibicao(caso.dataFechamento) : '',
      localizacao: caso.geolocalizacao ? 
        `Latitude: ${caso.geolocalizacao.latitude}, Longitude: ${caso.geolocalizacao.longitude}` : '',
    });

    // Configurar localização do mapa
    if (caso.geolocalizacao) {
      const lat = parseFloat(caso.geolocalizacao.latitude);
      const lng = parseFloat(caso.geolocalizacao.longitude);
      
      setMapRegion({
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
      setSelectedLocation({ latitude: lat, longitude: lng });
    }
  }
}, [route.params]);
```

#### Função de Submit Atualizada:
```javascript
const handleSubmit = async () => {
  // ... validações ...

  let response;
  if (isEditing && casoId) {
    // Atualizar caso existente
    response = await casosService.updateCaso(casoId, casoData);
    Alert.alert('Sucesso', 'Caso atualizado com sucesso!');
  } else {
    // Criar novo caso
    response = await casosService.createCaso(casoData);
    Alert.alert('Sucesso', 'Caso criado com sucesso!');
  }
};
```

#### Interface Atualizada:
- Título do header muda dinamicamente: "Criar Novo Caso" ou "Editar Caso"
- Texto do botão muda: "Criar Caso" ou "Atualizar Caso"
- Loading states específicos para cada ação

### 2. Configuração de Navegação

Adicionada a rota `EditarCaso` nos stacks de navegação:

```javascript
// Stack Navigator para a tela Home
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="CriarCaso" component={CriarCasoScreen} />
      <Stack.Screen name="EditarCaso" component={CriarCasoScreen} /> // Nova rota
      <Stack.Screen name="DetalhesCaso" component={DetalhesCasoScreen} />
      <Stack.Screen name="AdicionarEvidencia" component={AdicionarEvidenciaScreen} />
      <Stack.Screen name="AdicionarVitima" component={AdicionarVitimaScreen} />
    </Stack.Navigator>
  );
}
```

### 3. Serviço de API

O serviço `casosService.updateCaso` já existia e foi utilizado:

```javascript
// Atualizar caso
updateCaso: async (id, casoData) => {
  try {
    const response = await api.put(`/casos/${id}`, casoData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Erro ao atualizar caso' };
  }
},
```

## Como Usar

### Para Editar um Caso:

1. Na tela de detalhes do caso, toque no botão "Editar"
2. A navegação será feita para `EditarCaso` com o payload do caso
3. O formulário será preenchido automaticamente com os dados do caso
4. Faça as alterações necessárias
5. Toque em "Atualizar Caso" para salvar

### Navegação:

```javascript
// Na tela de detalhes
const handleEditarCaso = () => {
  if (caso) {
    navigation.navigate('EditarCaso', { caso });
  }
};
```

## Benefícios da Solução

1. **Reutilização de Código**: A mesma tela serve para criar e editar
2. **Consistência**: Interface uniforme para ambas as operações
3. **Manutenibilidade**: Menos código duplicado
4. **Experiência do Usuário**: Fluxo intuitivo e consistente

## Tratamento de Erros

- Validação de campos obrigatórios
- Tratamento de erros de API
- Feedback visual para o usuário
- Logs detalhados para debug

## Compatibilidade

- Funciona com a API existente
- Mantém compatibilidade com dados existentes
- Suporta todos os tipos de caso
- Funciona em ambas as tabs (Dashboard e Casos) 