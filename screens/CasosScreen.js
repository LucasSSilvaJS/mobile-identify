import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  useWindowDimensions,
  SafeAreaView,
  Platform,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  FlatList,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { casosService } from '../services/api';

export default function CasosScreen() {
  const { width, height } = useWindowDimensions();
  const [isLandscape, setIsLandscape] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const navigation = useNavigation();
  const { logout, user } = useAuth();

  // Estados para dados dos casos
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [casos, setCasos] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Estados para filtros
  const [searchText, setSearchText] = useState('');
  const [searchField, setSearchField] = useState('titulo'); // 'titulo' ou 'descricao'
  const [statusFilter, setStatusFilter] = useState('');
  const [showFiltros, setShowFiltros] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const statusOptions = [
    { label: 'Todos os status', value: '' },
    { label: 'Em andamento', value: 'Em andamento' },
    { label: 'Finalizado', value: 'Finalizado' },
    { label: 'Arquivado', value: 'Arquivado' },
  ];

  const getStatusLabel = (value) => {
    const option = statusOptions.find(opt => opt.value === value);
    return option ? option.label : 'Selecionar status';
  };

  // Detectar mudanças de orientação e tamanho de tela
  useEffect(() => {
    const checkOrientation = () => {
      setIsLandscape(width > height);
      setIsTablet(width >= 768);
    };

    checkOrientation();
  }, [width, height]);

  // Buscar casos
  const fetchCasos = useCallback(async (page = 1, isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const params = {
        page,
        limit: 10,
      };

      // Adicionar filtros específicos
      if (searchText.trim()) {
        params[searchField] = searchText.trim();
      }
      
      if (statusFilter) {
        params.status = statusFilter;
      }

      const data = await casosService.getCasos(params);
      
      if (page === 1) {
        setCasos(data.casos || data.data || []);
      } else {
        setCasos(prev => [...prev, ...(data.casos || data.data || [])]);
      }
      
      setPagination(data.pagination || {
        currentPage: page,
        hasNextPage: (data.casos || data.data || []).length === 10,
      });

    } catch (error) {
      console.error('Erro ao buscar casos:', error);
      Alert.alert('Erro', 'Não foi possível carregar os casos. Tente novamente.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchText, searchField, statusFilter]);

  useEffect(() => {
    fetchCasos(1, true);
  }, [fetchCasos]);

  const handleRefresh = () => {
    fetchCasos(1, true);
  };

  const handleLoadMore = () => {
    if (pagination.hasNextPage && !loading) {
      fetchCasos(pagination.currentPage + 1);
    }
  };

  const handleCreateCase = () => {
    navigation.navigate('CriarCaso');
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair da aplicação?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  const handleCasoPress = (caso) => {
    navigation.navigate('DetalhesCaso', { caso });
  };

  const handleSearch = () => {
    fetchCasos(1, true);
  };

  const limparFiltros = () => {
    setSearchText('');
    setSearchField('titulo');
    setStatusFilter('');
    fetchCasos(1, true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Em andamento':
        return '#FFA500';
      case 'Finalizado':
        return '#4CAF50';
      case 'Arquivado':
        return '#9E9E9E';
      default:
        return '#2196F3';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const renderCasoItem = ({ item }) => (
    <TouchableOpacity
      style={styles.casoCard}
      onPress={() => handleCasoPress(item)}
    >
      <View style={styles.casoHeader}>
        <View style={styles.casoInfo}>
          <Text style={styles.casoNumero}>{item.numero || `CASE-${item._id?.slice(-6) || item.id?.slice(-6)}`}</Text>
          <Text style={styles.casoTitulo}>{item.titulo}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      
      <Text style={styles.casoDescricao} numberOfLines={2}>
        {item.descricao}
      </Text>
      
      <View style={styles.casoFooter}>
        <View style={styles.casoMeta}>
          {item.evidencias && item.evidencias.length > 0 && (
            <View style={styles.metaItem}>
              <Ionicons name="document-text-outline" size={16} color="#666" />
              <Text style={styles.metaText}>
                {item.evidencias.length} evidência{item.evidencias.length > 1 ? 's' : ''}
              </Text>
            </View>
          )}
          
          {item.vitimas && item.vitimas.length > 0 && (
            <View style={styles.metaItem}>
              <Ionicons name="person-outline" size={16} color="#666" />
              <Text style={styles.metaText}>
                {item.vitimas.length} vítima{item.vitimas.length > 1 ? 's' : ''}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.casoDateContainer}>
          <Ionicons name="calendar-outline" size={14} color="#999" />
          <Text style={styles.casoDate}>
            Criado em: {formatDate(item.createdAt)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchRow}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar casos..."
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFiltros(!showFiltros)}
        >
          <Ionicons name="filter" size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Filtros */}
      {showFiltros && (
        <View style={styles.filtersContainer}>
          <Text style={styles.filterLabel}>Opções de pesquisa:</Text>
          
          <View style={styles.searchOptionsRow}>
            <TouchableOpacity
              style={[
                styles.searchOption,
                searchField === 'titulo' && styles.searchOptionActive
              ]}
              onPress={() => setSearchField('titulo')}
            >
              <Text style={[
                styles.searchOptionText,
                searchField === 'titulo' && styles.searchOptionTextActive
              ]}>
                Título
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.searchOption,
                searchField === 'descricao' && styles.searchOptionActive
              ]}
              onPress={() => setSearchField('descricao')}
            >
              <Text style={[
                styles.searchOptionText,
                searchField === 'descricao' && styles.searchOptionTextActive
              ]}>
                Descrição
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.filterSeparator} />

          <Text style={styles.filterLabel}>Filtrar por status:</Text>
          
          <TouchableOpacity
            style={styles.statusSelector}
            onPress={() => setShowStatusModal(true)}
          >
            <Text style={styles.statusSelectorText}>
              {getStatusLabel(statusFilter)}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
          
          {(searchText || statusFilter) && (
            <TouchableOpacity style={styles.clearFilterButton} onPress={limparFiltros}>
              <Text style={styles.clearFilterButtonText}>Limpar filtros</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Modal para seleção de status */}
      <Modal
        visible={showStatusModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowStatusModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecionar Status</Text>
              <TouchableOpacity onPress={() => setShowStatusModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              {statusOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.statusOption,
                    statusFilter === option.value && styles.statusOptionSelected
                  ]}
                  onPress={() => {
                    setStatusFilter(option.value);
                    setShowStatusModal(false);
                  }}
                >
                  <Text style={[
                    styles.statusOptionText,
                    statusFilter === option.value && styles.statusOptionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                  {statusFilter === option.value && (
                    <Ionicons name="checkmark" size={20} color="#007AFF" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-outline" size={64} color="#ccc" />
      <Text style={styles.emptyText}>
        {searchText || statusFilter 
          ? 'Nenhum caso encontrado com os filtros aplicados'
          : 'Nenhum caso encontrado'
        }
      </Text>
      {(searchText || statusFilter) && (
        <TouchableOpacity style={styles.clearButton} onPress={limparFiltros}>
          <Text style={styles.clearButtonText}>Limpar filtros</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderFooter = () => {
    if (!pagination.hasNextPage) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#007AFF" />
        <Text style={styles.footerText}>Carregando mais casos...</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderSearchBar()}
      
      <FlatList
        data={casos}
        renderItem={renderCasoItem}
        keyExtractor={(item) => item._id?.toString() || item.id?.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#333',
  },
  filterButton: {
    padding: 8,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
  },
  searchOptionsContainer: {
    marginBottom: 12,
  },
  searchOptionsLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  searchOptionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  searchOption: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  searchOptionActive: {
    backgroundColor: '#007AFF',
  },
  searchOptionText: {
    fontSize: 14,
    color: '#666',
  },
  searchOptionTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  filtersContainer: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
  },
  filterLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  statusSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    marginBottom: 12,
  },
  statusSelectorText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  filterActions: {
    flexDirection: 'row',
    gap: 8,
  },
  applyFilterButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  applyFilterButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  clearFilterButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  clearFilterButtonText: {
    color: '#666',
    fontSize: 14,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100, // Espaço para a tab bar
  },
  casoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  casoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  casoInfo: {
    flex: 1,
    marginRight: 8,
  },
  casoNumero: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  casoTitulo: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  casoDescricao: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  casoFooter: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  casoMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  metaText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  clearButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '90%',
    maxHeight: '70%',
    margin: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalBody: {
    padding: 20,
  },
  statusOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statusOptionSelected: {
    backgroundColor: '#f8f9ff',
  },
  statusOptionText: {
    fontSize: 16,
    color: '#333',
  },
  statusOptionTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  casoDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  casoDate: {
    fontSize: 12,
    color: '#999',
    marginLeft: 8,
  },
  filterSeparator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
}); 