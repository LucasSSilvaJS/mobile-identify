import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { casosService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function DetalhesCasoScreen({ navigation, route }) {
  const [caso, setCaso] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // ID do caso recebido via route.params
  const { casoId } = route.params || {};

  useEffect(() => {
    if (casoId) {
      carregarCaso();
    } else {
      console.error('ID do caso não fornecido');
      setError('ID do caso não fornecido');
      setLoading(false);
    }
  }, [casoId]);

  const carregarCaso = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Carregando caso:', casoId);
      const dadosCaso = await casosService.getCasoById(casoId);
      
      console.log('Dados do caso recebidos:', dadosCaso);
      setCaso(dadosCaso);
    } catch (err) {
      console.error('Erro ao carregar caso:', err);
      
      let errorMessage = 'Erro ao carregar dados do caso';
      
      if (err.error) {
        errorMessage = err.error;
      } else if (err.message) {
        if (err.message.includes('404')) {
          errorMessage = 'Caso não encontrado';
        } else if (err.message.includes('401')) {
          errorMessage = 'Não autorizado. Faça login novamente.';
        } else if (err.message.includes('500')) {
          errorMessage = 'Erro no servidor. Tente novamente mais tarde.';
        } else if (err.message.includes('Network')) {
          errorMessage = 'Erro de conexão. Verifique sua internet.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEditarCaso = () => {
    if (caso) {
      navigation.navigate('EditarCaso', { caso });
    }
  };

  const handleCompartilhar = () => {
    Alert.alert(
      'Compartilhar',
      'Funcionalidade de compartilhamento será implementada em breve.',
      [{ text: 'OK' }]
    );
  };

  const handleExcluirCaso = () => {
    Alert.alert(
      'Excluir Caso',
      'Tem certeza que deseja excluir este caso? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: confirmarExclusao,
        },
      ]
    );
  };

  const confirmarExclusao = async () => {
    try {
      await casosService.deleteCaso(casoId);
      
      Alert.alert(
        'Sucesso',
        'Caso excluído com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (err) {
      console.error('Erro ao excluir caso:', err);
      Alert.alert(
        'Erro',
        err.error || 'Erro ao excluir o caso. Tente novamente.',
        [{ text: 'OK' }]
      );
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Em andamento':
        return '#FF6B6B';
      case 'Finalizado':
        return '#51CF66';
      case 'Arquivado':
        return '#845EF7';
      default:
        return '#666';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Em andamento':
        return 'time-outline';
      case 'Finalizado':
        return 'checkmark-circle-outline';
      case 'Arquivado':
        return 'archive-outline';
      default:
        return 'help-circle-outline';
    }
  };

  const formatarData = (dataString) => {
    if (!dataString) return 'Não informado';
    try {
      return new Date(dataString).toLocaleDateString('pt-BR');
    } catch {
      return dataString;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Carregando detalhes do caso...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#FF6B6B" />
          <Text style={styles.errorTitle}>Erro ao carregar caso</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={carregarCaso}>
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!caso) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="document-outline" size={64} color="#666" />
          <Text style={styles.errorTitle}>Caso não encontrado</Text>
          <Text style={styles.errorMessage}>O caso solicitado não foi encontrado.</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
          
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleEditarCaso}>
              <Ionicons name="create-outline" size={20} color="#007AFF" />
              <Text style={styles.actionButtonText}>Editar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={handleExcluirCaso}>
              <Ionicons name="trash-outline" size={20} color="#FF3B30" />
              <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Excluir</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Informações do Caso */}
        <View style={styles.caseCard}>
          <View style={styles.caseHeader}>
            <View style={styles.caseInfo}>
              <Text style={styles.caseNumber}>Caso #{caso._id?.slice(-8) || caso.id?.slice(-8)}</Text>
              <Text style={styles.caseTitle}>{caso.titulo}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(caso.status) }]}>
              <Ionicons name={getStatusIcon(caso.status)} size={16} color="white" />
              <Text style={styles.statusText}>{caso.status}</Text>
            </View>
          </View>

          <Text style={styles.caseDescription}>{caso.descricao}</Text>

          {/* Detalhes do Caso */}
          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Data de Abertura</Text>
              <Text style={styles.detailValue}>{formatarData(caso.dataAbertura)}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Data de Conclusão</Text>
              <Text style={styles.detailValue}>{formatarData(caso.dataFechamento) || 'Não finalizado'}</Text>
            </View>
            
            {caso.geolocalizacao && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Localização</Text>
                <Text style={styles.detailValue}>
                  {caso.geolocalizacao.latitude}, {caso.geolocalizacao.longitude}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Evidências */}
        {caso.evidencias && caso.evidencias.length > 0 ? (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="camera-outline" size={24} color="#8B5CF6" />
              <Text style={styles.sectionTitle}>Evidências ({caso.evidencias.length})</Text>
            </View>
            
            {caso.evidencias.map((evidencia, index) => (
              <View key={evidencia._id} style={styles.evidenceItem}>
                <View style={styles.evidenceHeader}>
                  <Text style={styles.evidenceTitle}>Evidência {index + 1}</Text>
                  <View style={styles.evidenceType}>
                    <Text style={styles.evidenceTypeText}>{evidencia.tipo}</Text>
                  </View>
                </View>
                
                <View style={styles.evidenceDetails}>
                  <Text style={styles.evidenceDetail}>
                    <Text style={styles.detailBold}>Data de Coleta:</Text> {formatarData(evidencia.dataColeta)}
                  </Text>
                  <Text style={styles.evidenceDetail}>
                    <Text style={styles.detailBold}>Status:</Text> {evidencia.status}
                  </Text>
                  {evidencia.coletadaPor && (
                    <Text style={styles.evidenceDetail}>
                      <Text style={styles.detailBold}>Coletada por:</Text> {evidencia.coletadaPor.email || evidencia.coletadaPor.nome || 'Usuário não identificado'}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="camera-outline" size={24} color="#8B5CF6" />
              <Text style={styles.sectionTitle}>Evidências</Text>
            </View>
            <View style={styles.emptySection}>
              <Text style={styles.emptyText}>Nenhuma evidência cadastrada para este caso.</Text>
            </View>
          </View>
        )}

        {/* Vítimas */}
        {caso.vitimas && caso.vitimas.length > 0 ? (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="person-outline" size={24} color="#10B981" />
              <Text style={styles.sectionTitle}>Vítimas ({caso.vitimas.length})</Text>
            </View>
            
            {caso.vitimas.map((vitima, index) => (
              <View key={vitima._id} style={styles.victimItem}>
                <View style={styles.victimHeader}>
                  <Text style={styles.victimTitle}>Vítima {index + 1}</Text>
                  <View style={styles.nicBadge}>
                    <Text style={styles.nicText}>NIC: {vitima.nic}</Text>
                  </View>
                </View>
                
                <View style={styles.victimDetails}>
                  {vitima.nome && (
                    <Text style={styles.victimDetail}>
                      <Text style={styles.detailBold}>Nome:</Text> {vitima.nome}
                    </Text>
                  )}
                  {vitima.genero && (
                    <Text style={styles.victimDetail}>
                      <Text style={styles.detailBold}>Gênero:</Text> {vitima.genero}
                    </Text>
                  )}
                  {vitima.idade && (
                    <Text style={styles.victimDetail}>
                      <Text style={styles.detailBold}>Idade:</Text> {vitima.idade} anos
                    </Text>
                  )}
                  {vitima.corEtnia && (
                    <Text style={styles.victimDetail}>
                      <Text style={styles.detailBold}>Cor/Etnia:</Text> {vitima.corEtnia}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="person-outline" size={24} color="#10B981" />
              <Text style={styles.sectionTitle}>Vítimas</Text>
            </View>
            <View style={styles.emptySection}>
              <Text style={styles.emptyText}>Nenhuma vítima cadastrada para este caso.</Text>
            </View>
          </View>
        )}

        {/* Relatório */}
        {caso.relatorio ? (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-text-outline" size={24} color="#3B82F6" />
              <Text style={styles.sectionTitle}>Relatório</Text>
            </View>
            
            <View style={styles.reportContainer}>
              <Text style={styles.reportTitle}>{caso.relatorio.titulo}</Text>
              <Text style={styles.reportDetail}>
                <Text style={styles.detailBold}>Data de Criação:</Text> {formatarData(caso.relatorio.createdAt || caso.relatorio.dataCriacao)}
              </Text>
              <Text style={styles.reportDetail}>
                <Text style={styles.detailBold}>Perito Responsável:</Text> {caso.relatorio.peritoResponsavel?.username || caso.relatorio.peritoResponsavel?.email || 'Não informado'}
              </Text>
              <Text style={styles.reportContent}>{caso.relatorio.conteudo}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-text-outline" size={24} color="#3B82F6" />
              <Text style={styles.sectionTitle}>Relatório</Text>
            </View>
            <View style={styles.emptySection}>
              <Text style={styles.emptyText}>Nenhum relatório criado para este caso.</Text>
            </View>
          </View>
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
  scrollView: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginLeft: 12,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 4,
  },
  deleteButton: {
    marginLeft: 8,
  },
  deleteButtonText: {
    color: '#FF3B30',
  },
  caseCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  caseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  caseInfo: {
    flex: 1,
  },
  caseNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  caseTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  caseDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 20,
  },
  detailsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 20,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginLeft: 6,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
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
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  evidenceItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  evidenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  evidenceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  evidenceType: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  evidenceTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  evidenceDetails: {
    flex: 1,
  },
  evidenceDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  detailBold: {
    fontWeight: '600',
  },
  victimItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  victimHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  victimTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  nicBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  nicText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  victimDetails: {
    flex: 1,
  },
  victimDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  emptySection: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  reportContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  reportDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  reportContent: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginTop: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
}); 