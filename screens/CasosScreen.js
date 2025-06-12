import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  useWindowDimensions,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function CasosScreen() {
  const { width, height } = useWindowDimensions();
  const [isLandscape, setIsLandscape] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const navigation = useNavigation();

  // Detectar mudanças de orientação e tamanho de tela
  useEffect(() => {
    const checkOrientation = () => {
      setIsLandscape(width > height);
      setIsTablet(width >= 768); // Considera tablet a partir de 768px
    };

    checkOrientation();
  }, [width, height]);

  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('Todos');

  const [casos] = useState([
    {
      id: '1',
      numero: 'CASE-001',
      titulo: 'Roubo em Residência',
      status: 'Em Andamento',
      descricao: 'Roubo ocorrido em residência localizada na Rua das Flores, 123. O suspeito invadiu a propriedade durante a madrugada e levou objetos de valor.',
      dataAbertura: '15/11/2024',
      dataConclusao: '',
      localizacao: 'Rua das Flores, 123 - Centro',
      latitude: -23.5505,
      longitude: -46.6333,
      evidencia: 'Fotos do local, impressões digitais, câmeras de segurança',
      vitimas: 'João Silva, Maria Santos',
    },
    {
      id: '2',
      numero: 'CASE-002',
      titulo: 'Assalto a Banco',
      status: 'Finalizado',
      descricao: 'Assalto ocorrido no Banco Central da cidade. Suspeitos armados invadiram o estabelecimento e levaram uma quantia significativa.',
      dataAbertura: '10/11/2024',
      dataConclusao: '20/11/2024',
      localizacao: 'Av. Principal, 456 - Centro',
      latitude: -23.5600,
      longitude: -46.6400,
      evidencia: 'Vídeos de segurança, armas apreendidas, testemunhos',
      vitimas: 'Funcionários do banco e clientes',
    },
    {
      id: '3',
      numero: 'CASE-003',
      titulo: 'Fraude Eletrônica',
      status: 'Arquivado',
      descricao: 'Fraude eletrônica envolvendo transferências bancárias não autorizadas através de phishing.',
      dataAbertura: '05/11/2024',
      dataConclusao: '15/11/2024',
      localizacao: 'Online - Múltiplas localizações',
      latitude: -23.5400,
      longitude: -46.6200,
      evidencia: 'Logs de transações, emails fraudulentos, registros bancários',
      vitimas: 'Carlos Oliveira',
    },
    {
      id: '4',
      numero: 'CASE-004',
      titulo: 'Homicídio',
      status: 'Em Andamento',
      descricao: 'Homicídio ocorrido em área residencial. Vítima encontrada sem vida em sua residência.',
      dataAbertura: '12/11/2024',
      dataConclusao: '',
      localizacao: 'Rua das Palmeiras, 789 - Bairro Norte',
      latitude: -23.5700,
      longitude: -46.6500,
      evidencia: 'Laudo pericial, testemunhos, objetos do local',
      vitimas: 'Ana Costa',
    },
    {
      id: '5',
      numero: 'CASE-005',
      titulo: 'Tráfico de Drogas',
      status: 'Em Andamento',
      descricao: 'Operação de combate ao tráfico de drogas em área urbana. Apreensão de substâncias ilícitas.',
      dataAbertura: '08/11/2024',
      dataConclusao: '',
      localizacao: 'Rua do Comércio, 321 - Zona Sul',
      latitude: -23.5800,
      longitude: -46.6600,
      evidencia: 'Substâncias apreendidas, equipamentos, documentos',
      vitimas: 'Suspeitos em investigação',
    },
  ]);

  const filtros = ['Todos', 'Em Andamento', 'Finalizados', 'Arquivados'];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Em Andamento':
        return '#FF6B6B';
      case 'Finalizado':
        return '#51CF66';
      case 'Arquivado':
        return '#845EF7';
      default:
        return '#999';
    }
  };

  const casosFiltrados = casos.filter(caso => {
    const matchSearch = caso.titulo.toLowerCase().includes(searchText.toLowerCase()) ||
                       caso.numero.toLowerCase().includes(searchText.toLowerCase());
    const matchFilter = selectedFilter === 'Todos' || caso.status === selectedFilter;
    return matchSearch && matchFilter;
  });

  const handleCasePress = (caso) => {
    navigation.navigate('DetalhesCaso', { caso });
  };

  const handleCreateCase = () => {
    navigation.navigate('CriarCaso');
  };

  const renderCaso = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.casoCard,
        isTablet && styles.casoCardTablet
      ]}
      onPress={() => handleCasePress(item)}
    >
      <View style={styles.casoHeader}>
        <View style={styles.casoInfo}>
          <Text style={[
            styles.casoNumero,
            isTablet && styles.casoNumeroTablet
          ]}>{item.numero}</Text>
          <Text style={[
            styles.casoTitulo,
            isTablet && styles.casoTituloTablet
          ]}>{item.titulo}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={[
            styles.statusText,
            isTablet && styles.statusTextTablet
          ]}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.casoDescription}>
        <Text style={[
          styles.descriptionText,
          isTablet && styles.descriptionTextTablet
        ]} numberOfLines={3}>
          {item.descricao}
        </Text>
      </View>

      <View style={styles.casoFooter}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chevron-forward" size={isTablet ? 24 : 20} color="#007AFF" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderFiltro = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.filtroButton,
        selectedFilter === item && styles.filtroButtonActive,
        isTablet && styles.filtroButtonTablet
      ]}
      onPress={() => setSelectedFilter(item)}
    >
      <Text style={[
        styles.filtroText,
        selectedFilter === item && styles.filtroTextActive,
        isTablet && styles.filtroTextTablet
      ]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[
        styles.header,
        isTablet && styles.headerTablet
      ]}>
        <Text style={[
          styles.headerTitle,
          isTablet && styles.headerTitleTablet
        ]}>Casos</Text>
        <Text style={[
          styles.headerSubtitle,
          isTablet && styles.headerSubtitleTablet
        ]}>{casosFiltrados.length} casos encontrados</Text>
      </View>

      {/* Barra de Busca */}
      <View style={[
        styles.searchContainer,
        isTablet && styles.searchContainerTablet
      ]}>
        <Ionicons name="search" size={isTablet ? 24 : 20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={[
            styles.searchInput,
            isTablet && styles.searchInputTablet
          ]}
          placeholder="Buscar casos..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#999"
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <Ionicons name="close-circle" size={isTablet ? 24 : 20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filtros */}
      <View style={styles.filtrosContainer}>
        <FlatList
          data={filtros}
          renderItem={renderFiltro}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.filtrosList,
            isTablet && styles.filtrosListTablet
          ]}
        />
      </View>

      {/* Lista de Casos */}
      <FlatList
        data={casosFiltrados}
        renderItem={renderCaso}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.casosList,
          isTablet && styles.casosListTablet
        ]}
        showsVerticalScrollIndicator={false}
        numColumns={isTablet && isLandscape ? 2 : 1}
      />

      {/* Botão Flutuante */}
      <TouchableOpacity
        style={[
          styles.fab,
          isTablet && styles.fabTablet
        ]}
        onPress={handleCreateCase}
      >
        <Ionicons name="add" size={isTablet ? 36 : 30} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 20 : 30,
    backgroundColor: '#fff',
  },
  headerTablet: {
    paddingHorizontal: 40,
    paddingTop: Platform.OS === 'ios' ? 30 : 50,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  headerTitleTablet: {
    fontSize: 36,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  headerSubtitleTablet: {
    fontSize: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 20,
    marginTop: 10,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchContainerTablet: {
    marginHorizontal: 40,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  searchInputTablet: {
    fontSize: 18,
  },
  filtrosContainer: {
    marginBottom: 10,
  },
  filtrosList: {
    paddingHorizontal: 20,
  },
  filtrosListTablet: {
    paddingHorizontal: 40,
  },
  filtroButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filtroButtonTablet: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginRight: 15,
  },
  filtroButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filtroText: {
    fontSize: 14,
    color: '#666',
  },
  filtroTextTablet: {
    fontSize: 16,
  },
  filtroTextActive: {
    color: '#fff',
  },
  casosList: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: Platform.OS === 'ios' ? 140 : 120,
  },
  casosListTablet: {
    paddingHorizontal: 40,
    paddingBottom: Platform.OS === 'ios' ? 160 : 140,
  },
  casoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  casoCardTablet: {
    padding: 30,
    marginBottom: 20,
    marginHorizontal: 10,
    flex: 1,
  },
  casoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  casoInfo: {
    flex: 1,
  },
  casoNumero: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  casoNumeroTablet: {
    fontSize: 16,
  },
  casoTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  casoTituloTablet: {
    fontSize: 22,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusTextTablet: {
    fontSize: 14,
  },
  casoDescription: {
    marginBottom: 15,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  descriptionTextTablet: {
    fontSize: 16,
    lineHeight: 24,
  },
  casoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    padding: 5,
  },
  fab: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 120 : 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  fabTablet: {
    width: 70,
    height: 70,
    borderRadius: 35,
    bottom: Platform.OS === 'ios' ? 140 : 120,
    right: 30,
  },
}); 