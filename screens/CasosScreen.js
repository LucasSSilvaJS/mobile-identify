import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CasosScreen() {
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('Todos');

  const [casos] = useState([
    {
      id: '1',
      numero: 'CASE-001',
      titulo: 'Roubo em Residência',
      status: 'Em Andamento',
      data: '15/11/2024',
      vitimas: 2,
      evidencias: 8,
      prioridade: 'Alta',
    },
    {
      id: '2',
      numero: 'CASE-002',
      titulo: 'Assalto a Banco',
      status: 'Finalizado',
      data: '10/11/2024',
      vitimas: 5,
      evidencias: 15,
      prioridade: 'Crítica',
    },
    {
      id: '3',
      numero: 'CASE-003',
      titulo: 'Fraude Eletrônica',
      status: 'Arquivado',
      data: '05/11/2024',
      vitimas: 1,
      evidencias: 12,
      prioridade: 'Média',
    },
    {
      id: '4',
      numero: 'CASE-004',
      titulo: 'Homicídio',
      status: 'Em Andamento',
      data: '12/11/2024',
      vitimas: 1,
      evidencias: 25,
      prioridade: 'Crítica',
    },
    {
      id: '5',
      numero: 'CASE-005',
      titulo: 'Tráfico de Drogas',
      status: 'Em Andamento',
      data: '08/11/2024',
      vitimas: 3,
      evidencias: 18,
      prioridade: 'Alta',
    },
  ]);

  const filtros = ['Todos', 'Em Andamento', 'Finalizados', 'Arquivados'];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Em Andamento':
        return '#FF6B6B';
      case 'Finalizado':
        return '#4ECDC4';
      case 'Arquivado':
        return '#45B7D1';
      default:
        return '#999';
    }
  };

  const getPrioridadeColor = (prioridade) => {
    switch (prioridade) {
      case 'Crítica':
        return '#FF3B30';
      case 'Alta':
        return '#FF9500';
      case 'Média':
        return '#FFCC00';
      case 'Baixa':
        return '#34C759';
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
    Alert.alert(
      caso.titulo,
      `Detalhes do caso ${caso.numero} serão exibidos em breve!`,
      [{ text: 'OK' }]
    );
  };

  const handleCreateCase = () => {
    Alert.alert(
      'Criar Novo Caso',
      'Funcionalidade de criação de casos será implementada em breve!',
      [{ text: 'OK' }]
    );
  };

  const renderCaso = ({ item }) => (
    <TouchableOpacity
      style={styles.casoCard}
      onPress={() => handleCasePress(item)}
    >
      <View style={styles.casoHeader}>
        <View style={styles.casoInfo}>
          <Text style={styles.casoNumero}>{item.numero}</Text>
          <Text style={styles.casoTitulo}>{item.titulo}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.casoDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{item.data}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="people-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{item.vitimas} vítima(s)</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="document-text-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{item.evidencias} evidências</Text>
        </View>
      </View>

      <View style={styles.casoFooter}>
        <View style={[styles.prioridadeBadge, { backgroundColor: getPrioridadeColor(item.prioridade) }]}>
          <Text style={styles.prioridadeText}>{item.prioridade}</Text>
        </View>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chevron-forward" size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderFiltro = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.filtroButton,
        selectedFilter === item && styles.filtroButtonActive
      ]}
      onPress={() => setSelectedFilter(item)}
    >
      <Text style={[
        styles.filtroText,
        selectedFilter === item && styles.filtroTextActive
      ]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Casos</Text>
        <Text style={styles.headerSubtitle}>{casosFiltrados.length} casos encontrados</Text>
      </View>

      {/* Barra de Busca */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar casos..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#999"
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <Ionicons name="close-circle" size={20} color="#666" />
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
          contentContainerStyle={styles.filtrosList}
        />
      </View>

      {/* Lista de Casos */}
      <FlatList
        data={casosFiltrados}
        renderItem={renderCaso}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.casosList}
        showsVerticalScrollIndicator={false}
      />

      {/* Botão Flutuante */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleCreateCase}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
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
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  filtrosContainer: {
    marginBottom: 10,
  },
  filtrosList: {
    paddingHorizontal: 20,
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
  filtroButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filtroText: {
    fontSize: 14,
    color: '#666',
  },
  filtroTextActive: {
    color: '#fff',
  },
  casosList: {
    padding: 20,
    paddingTop: 0,
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
  casoTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
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
  casoDetails: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  casoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prioridadeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  prioridadeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionButton: {
    padding: 5,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
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
}); 