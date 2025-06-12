import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { useVitimas } from '../hooks/useVitimas';
import { useOdontogramas } from '../hooks/useOdontogramas';
import { formatarData } from '../utils/dateUtils';

export default function DetalhesVitimaScreen({ navigation, route }) {
  const [vitima, setVitima] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const { user } = useAuth();
  const { carregarVitimaPorId, excluirVitima } = useVitimas();
  const { odontogramas, criarOdontograma, excluirOdontograma, carregarOdontogramas } = useOdontogramas();
  
  const { vitimaId, vitima: vitimaParam } = route.params || {};

  const carregarVitima = async () => {
    try {
      setError(null);
      setLoading(true);
      
      let vitimaData;
      if (vitimaParam) {
        vitimaData = vitimaParam;
      } else if (vitimaId) {
        vitimaData = await carregarVitimaPorId(vitimaId);
      } else {
        throw new Error('ID da vítima não fornecido');
      }
      
      setVitima(vitimaData);
      setLastUpdate(new Date());
      
      // Também recarregar odontogramas para garantir sincronização
      try {
        await carregarOdontogramas(true);
      } catch (err) {
        console.log('Erro ao recarregar odontogramas:', err);
      }
    } catch (err) {
      console.error('Erro ao carregar vítima:', err);
      setError(err.error || 'Erro ao carregar vítima');
    } finally {
      setLoading(false);
    }
  };

  const forcarRecarregamento = async () => {
    console.log('Forçando recarregamento da vítima');
    await carregarVitima();
  };

  // Recarregar vítima quando a tela receber foco
  useFocusEffect(
    React.useCallback(() => {
      console.log('Tela de detalhes da vítima recebeu foco - recarregando dados');
      carregarVitima();
      
      // Também forçar recarregamento dos odontogramas
      return () => {
        console.log('Tela de detalhes da vítima perdeu foco');
      };
    }, [vitimaId, vitimaParam])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await carregarVitima();
    setRefreshing(false);
  };

  const handleEditarVitima = () => {
    navigation.navigate('EditarVitima', { 
      vitimaId: vitima._id,
      vitima: vitima 
    });
  };

  const handleExcluirVitima = () => {
    Alert.alert(
      'Excluir Vítima',
      'Tem certeza que deseja excluir esta vítima? Esta ação não pode ser desfeita e também excluirá todos os odontogramas associados.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => confirmarExclusaoVitima(),
        },
      ]
    );
  };

  const confirmarExclusaoVitima = async () => {
    try {
      // Primeiro, excluir todos os odontogramas da vítima
      if (vitima.odontograma && vitima.odontograma.length > 0) {
        for (const odontogramaId of vitima.odontograma) {
          try {
            await excluirOdontograma(odontogramaId, vitima._id);
          } catch (err) {
            console.error('Erro ao excluir odontograma:', err);
          }
        }
      }

      // Depois, excluir a vítima
      await excluirVitima(vitima._id, vitima.casoId || vitima.caso);

      Alert.alert(
        'Sucesso',
        'Vítima excluída com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('Erro ao excluir vítima:', error);
      Alert.alert(
        'Erro',
        error.error || 'Erro ao excluir vítima. Tente novamente.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleAdicionarOdontograma = () => {
    navigation.navigate('AdicionarOdontograma', { 
      vitimaId: vitima._id,
      vitima: vitima,
      onReturn: forcarRecarregamento
    });
  };

  const handleEditarOdontograma = (odontograma) => {
    navigation.navigate('EditarOdontograma', { 
      odontogramaId: odontograma._id,
      odontograma: odontograma,
      vitimaId: vitima._id,
      onReturn: forcarRecarregamento
    });
  };

  const handleExcluirOdontograma = (odontograma) => {
    Alert.alert(
      'Excluir Odontograma',
      'Tem certeza que deseja excluir este odontograma? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => confirmarExclusaoOdontograma(odontograma),
        },
      ]
    );
  };

  const confirmarExclusaoOdontograma = async (odontograma) => {
    try {
      await excluirOdontograma(odontograma._id, vitima._id);

      Alert.alert(
        'Sucesso',
        'Odontograma excluído com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Recarregar a vítima para atualizar a interface
              console.log('Recarregando vítima após exclusão de odontograma');
              forcarRecarregamento();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Erro ao excluir odontograma:', error);
      Alert.alert(
        'Erro',
        error.error || 'Erro ao excluir odontograma. Tente novamente.',
        [{ text: 'OK' }]
      );
    }
  };

  const getOdontogramasDaVitima = () => {
    if (!vitima || !vitima.odontograma) return [];
    
    return odontogramas.filter(odonto => 
      vitima.odontograma.includes(odonto._id)
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Carregando detalhes da vítima...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#FF6B6B" />
          <Text style={styles.errorTitle}>Erro ao carregar vítima</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={carregarVitima}>
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!vitima) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="person-outline" size={64} color="#666" />
          <Text style={styles.errorTitle}>Vítima não encontrada</Text>
          <Text style={styles.errorMessage}>A vítima solicitada não foi encontrada.</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const odontogramasDaVitima = getOdontogramasDaVitima();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
          
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleEditarVitima}>
              <Ionicons name="create-outline" size={20} color="#007AFF" />
              <Text style={styles.actionButtonText}>Editar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={handleExcluirVitima}>
              <Ionicons name="trash-outline" size={20} color="#FF3B30" />
              <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Excluir</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Informações da Vítima */}
        <View style={styles.vitimaCard}>
          <View style={styles.vitimaHeader}>
            <View style={styles.vitimaInfo}>
              <Text style={styles.vitimaName}>{vitima.nome || 'Vítima sem nome'}</Text>
              <View style={styles.nicBadge}>
                <Text style={styles.nicText}>NIC: {vitima.nic}</Text>
              </View>
            </View>
          </View>

          {/* Detalhes da Vítima */}
          <View style={styles.detailsContainer}>
            {vitima.genero && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Gênero</Text>
                <Text style={styles.detailValue}>{vitima.genero}</Text>
              </View>
            )}
            
            {vitima.idade && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Idade</Text>
                <Text style={styles.detailValue}>{vitima.idade} anos</Text>
              </View>
            )}
            
            {vitima.corEtnia && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Cor/Etnia</Text>
                <Text style={styles.detailValue}>{vitima.corEtnia}</Text>
              </View>
            )}
            
            {vitima.documento && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Documento</Text>
                <Text style={styles.detailValue}>{vitima.documento}</Text>
              </View>
            )}
            
            {vitima.endereco && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Endereço</Text>
                <Text style={styles.detailValue}>{vitima.endereco}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Odontogramas */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="medical-outline" size={24} color="#8B5CF6" />
            <Text style={styles.sectionTitle}>
              Odontogramas {odontogramasDaVitima.length > 0 ? `(${odontogramasDaVitima.length})` : ''}
            </Text>
            <TouchableOpacity style={[styles.addButton, { backgroundColor: '#8B5CF6' }]} onPress={handleAdicionarOdontograma}>
              <Ionicons name="add" size={20} color="white" />
              <Text style={styles.addButtonText}>Adicionar</Text>
            </TouchableOpacity>
          </View>
          
          {lastUpdate && (
            <Text style={styles.lastUpdateText}>
              Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
            </Text>
          )}
          
          {odontogramasDaVitima.length > 0 ? (
            odontogramasDaVitima.map((odontograma, index) => (
              <View key={odontograma._id} style={styles.odontogramaItem}>
                <View style={styles.odontogramaHeader}>
                  <View style={styles.odontogramaInfo}>
                    <Text style={styles.odontogramaTitle}>Odontograma {index + 1}</Text>
                    <View style={styles.identificacaoBadge}>
                      <Text style={styles.identificacaoText}>Dente: {odontograma.identificacao}</Text>
                    </View>
                  </View>
                  <View style={styles.odontogramaActions}>
                    <TouchableOpacity
                      style={styles.odontogramaActionButton}
                      onPress={() => handleEditarOdontograma(odontograma)}
                    >
                      <Ionicons name="create-outline" size={16} color="#007AFF" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.odontogramaActionButton, styles.deleteButton]}
                      onPress={() => handleExcluirOdontograma(odontograma)}
                    >
                      <Ionicons name="trash-outline" size={16} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                </View>
                
                <View style={styles.odontogramaDetails}>
                  <Text style={styles.odontogramaDetail}>
                    <Text style={styles.detailBold}>Identificação:</Text> Dente {odontograma.identificacao}
                  </Text>
                  {odontograma.observacao && (
                    <Text style={styles.odontogramaDetail}>
                      <Text style={styles.detailBold}>Observação:</Text> {odontograma.observacao}
                    </Text>
                  )}
                  <Text style={styles.odontogramaDetail}>
                    <Text style={styles.detailBold}>Data de Criação:</Text> {formatarData(odontograma.createdAt)}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptySection}>
              <Text style={styles.emptyText}>Nenhum odontograma cadastrado para esta vítima.</Text>
              <Text style={styles.emptySubtext}>Adicione odontogramas para registrar informações odontológicas.</Text>
            </View>
          )}
        </View>
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    marginLeft: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginLeft: 8,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 4,
  },
  deleteButton: {
    marginLeft: 4,
  },
  deleteButtonText: {
    color: '#FF3B30',
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
    marginBottom: 12,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  vitimaCard: {
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
  vitimaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  vitimaInfo: {
    flex: 1,
  },
  vitimaName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  nicBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  nicText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  detailsContainer: {
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  sectionCard: {
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginLeft: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptySection: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  odontogramaItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  odontogramaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  odontogramaInfo: {
    flex: 1,
  },
  odontogramaTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  identificacaoBadge: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  identificacaoText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  odontogramaActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  odontogramaActionButton: {
    padding: 4,
    marginLeft: 8,
  },
  odontogramaDetails: {
    gap: 8,
  },
  odontogramaDetail: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  detailBold: {
    fontWeight: '600',
  },
  lastUpdateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
    marginTop: 8,
  },
}); 