import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  TextInput,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import RelatoriosStats from '../components/RelatoriosStats';
import NotificationBanner from '../components/NotificationBanner';
import { useRelatorios } from '../hooks/useRelatorios';
import { formatarData, formatarDataHora } from '../utils/dateUtils';

export default function RelatoriosScreen({ navigation }) {
  const [filteredRelatorios, setFilteredRelatorios] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [sortBy, setSortBy] = useState('date'); // 'date', 'title', 'perito'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'
  const [lastUpdate, setLastUpdate] = useState(null);
  const [notification, setNotification] = useState({
    visible: false,
    message: '',
    type: 'success'
  });
  const { user } = useAuth();
  
  // Usar o hook personalizado
  const { 
    relatorios, 
    loading, 
    error, 
    lastSync,
    carregarRelatorios, 
    excluirRelatorio 
  } = useRelatorios();

  // Atualizar timestamp quando relatórios mudarem
  useEffect(() => {
    if (relatorios.length > 0) {
      setLastUpdate(new Date());
    }
  }, [relatorios]);

  // Mostrar notificação quando a lista for atualizada
  useEffect(() => {
    if (lastUpdate && relatorios.length > 0) {
      showNotification('Lista de relatórios atualizada', 'info');
    }
  }, [lastUpdate]);

  const showNotification = (message, type = 'success') => {
    setNotification({
      visible: true,
      message,
      type
    });
  };

  const hideNotification = () => {
    setNotification(prev => ({
      ...prev,
      visible: false
    }));
  };

  useEffect(() => {
    // Filtrar e ordenar relatórios
    let filtered = relatorios;
    
    // Aplicar filtro de busca
    if (searchTerm.trim() !== '') {
      filtered = relatorios.filter(relatorio => 
        relatorio.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        relatorio.conteudo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (relatorio.peritoResponsavel?.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (relatorio.peritoResponsavel?.email || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Aplicar ordenação
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'title':
          comparison = a.titulo.localeCompare(b.titulo);
          break;
        case 'perito':
          const peritoA = a.peritoResponsavel?.username || a.peritoResponsavel?.email || '';
          const peritoB = b.peritoResponsavel?.username || b.peritoResponsavel?.email || '';
          comparison = peritoA.localeCompare(peritoB);
          break;
        case 'date':
        default:
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          comparison = dateA - dateB;
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    setFilteredRelatorios(filtered);
  }, [searchTerm, relatorios, sortBy, sortOrder]);

  const onRefresh = async () => {
    setRefreshing(true);
    await carregarRelatorios(true); // Forçar refresh
    setRefreshing(false);
  };

  const handleRelatorioPress = (relatorio) => {
    navigation.navigate('DetalhesRelatorio', { relatorioId: relatorio._id });
  };

  const handleEditarRelatorio = (relatorio) => {
    navigation.navigate('EditarRelatorio', { 
      relatorioId: relatorio._id,
      relatorio: relatorio 
    });
  };

  const handleExcluirRelatorio = (relatorio) => {
    Alert.alert(
      'Excluir Relatório',
      'Tem certeza que deseja excluir este relatório? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => confirmarExclusao(relatorio),
        },
      ]
    );
  };

  const confirmarExclusao = async (relatorio) => {
    try {
      // Nota: Para excluir um relatório, precisamos do userId e casoId
      // Como não temos essas informações na listagem, vamos mostrar uma mensagem
      Alert.alert(
        'Ação Necessária',
        'Para excluir um relatório, acesse os detalhes do caso associado.',
        [{ text: 'OK' }]
      );
    } catch (err) {
      console.error('Erro ao excluir relatório:', err);
      Alert.alert('Erro', 'Erro ao excluir o relatório. Tente novamente.');
    }
  };

  const formatarHora = (data) => {
    if (!data) return '';
    try {
      return data.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return '';
    }
  };

  const truncarTexto = (texto, maxLength = 100) => {
    if (!texto) return 'Sem conteúdo';
    if (texto.length <= maxLength) return texto;
    return texto.substring(0, maxLength) + '...';
  };

  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (showSearch) {
      setSearchTerm('');
    }
  };

  const toggleSort = () => {
    const sortOptions = [
      { value: 'date', label: 'Data' },
      { value: 'title', label: 'Título' },
      { value: 'perito', label: 'Perito' }
    ];
    
    const currentIndex = sortOptions.findIndex(option => option.value === sortBy);
    const nextIndex = (currentIndex + 1) % sortOptions.length;
    setSortBy(sortOptions[nextIndex].value);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const getSortLabel = () => {
    const labels = {
      date: 'Data',
      title: 'Título',
      perito: 'Perito'
    };
    return labels[sortBy] || 'Data';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Carregando relatórios...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#FF6B6B" />
          <Text style={styles.errorTitle}>Erro ao carregar relatórios</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => carregarRelatorios(true)}>
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <NotificationBanner
        visible={notification.visible}
        message={notification.message}
        type={notification.type}
        onClose={hideNotification}
        autoHide={true}
        duration={3000}
      />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Relatórios</Text>
        <TouchableOpacity style={styles.searchButton} onPress={toggleSearch}>
          <Ionicons name={showSearch ? "close" : "search"} size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {showSearch && (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar relatórios..."
            placeholderTextColor="#999"
            value={searchTerm}
            onChangeText={setSearchTerm}
            autoFocus={true}
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={() => setSearchTerm('')}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      )}

      <View style={styles.headerSubtitle}>
        <View style={styles.subtitleRow}>
          <Text style={styles.subtitleText}>
            {filteredRelatorios.length} relatório{filteredRelatorios.length !== 1 ? 's' : ''} encontrado{filteredRelatorios.length !== 1 ? 's' : ''}
            {searchTerm && ` para "${searchTerm}"`}
          </Text>
          <View style={styles.sortContainer}>
            <TouchableOpacity style={styles.sortButton} onPress={toggleSort}>
              <Ionicons name="funnel-outline" size={16} color="#007AFF" />
              <Text style={styles.sortButtonText}>{getSortLabel()}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sortButton} onPress={toggleSortOrder}>
              <Ionicons 
                name={sortOrder === 'asc' ? "arrow-up" : "arrow-down"} 
                size={16} 
                color="#007AFF" 
              />
            </TouchableOpacity>
          </View>
        </View>
        {lastUpdate && (
          <Text style={styles.lastUpdateText}>
            Última atualização: {formatarHora(lastUpdate)}
            {lastSync && (
              <Text style={styles.syncText}>
                {' • Sincronizado: '}{formatarDataHora(lastSync)}
              </Text>
            )}
          </Text>
        )}
      </View>

      {!showSearch && !searchTerm && (
        <RelatoriosStats relatorios={relatorios} />
      )}

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredRelatorios.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>
              {searchTerm ? 'Nenhum relatório encontrado' : 'Nenhum relatório encontrado'}
            </Text>
            <Text style={styles.emptyMessage}>
              {searchTerm 
                ? `Nenhum relatório corresponde à busca "${searchTerm}"`
                : 'Os relatórios aparecerão aqui quando forem criados.'
              }
            </Text>
          </View>
        ) : (
          filteredRelatorios.map((relatorio) => (
            <TouchableOpacity
              key={relatorio._id}
              style={styles.relatorioCard}
              onPress={() => handleRelatorioPress(relatorio)}
            >
              <View style={styles.relatorioHeader}>
                <View style={styles.relatorioInfo}>
                  <Text style={styles.relatorioTitle}>{relatorio.titulo}</Text>
                  <Text style={styles.relatorioDate}>
                    Criado em: {formatarData(relatorio.createdAt)}
                  </Text>
                </View>
                <View style={styles.relatorioActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleEditarRelatorio(relatorio)}
                  >
                    <Ionicons name="create-outline" size={20} color="#007AFF" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleExcluirRelatorio(relatorio)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.relatorioContent}>
                {truncarTexto(relatorio.conteudo)}
              </Text>

              <View style={styles.relatorioFooter}>
                <View style={styles.peritoInfo}>
                  <Ionicons name="person-outline" size={16} color="#666" />
                  <Text style={styles.peritoText}>
                    {relatorio.peritoResponsavel?.username || 
                     relatorio.peritoResponsavel?.email || 
                     'Perito não informado'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  subtitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subtitleText: {
    fontSize: 16,
    color: '#666',
  },
  searchButton: {
    padding: 8,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 8,
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  relatorioCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  relatorioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  relatorioInfo: {
    flex: 1,
  },
  relatorioTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  relatorioDate: {
    fontSize: 14,
    color: '#666',
  },
  relatorioActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  deleteButton: {
    marginLeft: 4,
  },
  relatorioContent: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    marginBottom: 12,
  },
  relatorioFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  peritoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  peritoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortButton: {
    padding: 8,
    marginLeft: 8,
  },
  sortButtonText: {
    fontSize: 16,
    color: '#007AFF',
    marginLeft: 4,
  },
  lastUpdateText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  syncText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
}); 