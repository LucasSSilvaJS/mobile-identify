import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { evidenciasService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { formatarData, formatarDataHora } from '../utils/dateUtils';

const { width } = Dimensions.get('window');

export default function DetalhesEvidenciaScreen({ navigation, route }) {
  const [evidencia, setEvidencia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const { user } = useAuth();
  const { evidenciaId } = route.params || {};

  useEffect(() => {
    if (evidenciaId) {
      carregarEvidencia();
    } else {
      console.error('ID da evidência não fornecido');
      setError('ID da evidência não fornecido');
      setLoading(false);
    }
  }, [evidenciaId]);

  // Recarregar dados quando a tela receber foco
  useFocusEffect(
    React.useCallback(() => {
      if (evidenciaId && !isInitialized) {
        console.log('Tela de detalhes da evidência recebeu foco - recarregando dados:', evidenciaId);
        carregarEvidencia();
        setIsInitialized(true);
      }
    }, [evidenciaId, isInitialized])
  );

  const carregarEvidencia = React.useCallback(async () => {
    if (!evidenciaId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('Carregando evidência:', evidenciaId);
      const dadosEvidencia = await evidenciasService.getEvidenciaById(evidenciaId);
      
      console.log('Dados da evidência recebidos:', dadosEvidencia);
      setEvidencia(dadosEvidencia);
    } catch (err) {
      console.error('Erro ao carregar evidência:', err);
      
      let errorMessage = 'Erro ao carregar dados da evidência';
      
      if (err.error) {
        errorMessage = err.error;
      } else if (err.message) {
        if (err.message.includes('404')) {
          errorMessage = 'Evidência não encontrada';
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
  }, [evidenciaId]);

  const forcarRecarregamento = React.useCallback(() => {
    setIsInitialized(false);
    carregarEvidencia();
  }, [carregarEvidencia]);

  const handleEditarEvidencia = () => {
    if (evidencia) {
      navigation.navigate('EditarEvidencia', { 
        evidenciaId: evidencia._id,
        evidencia: evidencia,
        onReturn: () => {
          forcarRecarregamento();
        }
      });
    }
  };

  const handleVerImagens = () => {
    if (evidencia) {
      navigation.navigate('ImagensEvidencia', { 
        evidenciaId: evidencia._id,
        evidenciaNome: evidencia.tipo || 'Evidência'
      });
    }
  };

  const handleExcluirEvidencia = () => {
    Alert.alert(
      'Excluir Evidência',
      'Tem certeza que deseja excluir esta evidência? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => confirmarExclusaoEvidencia(),
        },
      ]
    );
  };

  const confirmarExclusaoEvidencia = async () => {
    try {
      await evidenciasService.deleteEvidencia(evidencia._id);

      Alert.alert(
        'Sucesso',
        'Evidência excluída com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('Erro ao excluir evidência:', error);
      Alert.alert(
        'Erro',
        error.error || 'Erro ao excluir evidência. Tente novamente.',
        [{ text: 'OK' }]
      );
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'coletada':
        return '#51CF66';
      case 'em análise':
        return '#FFD43B';
      case 'processada':
        return '#339AF0';
      case 'arquivada':
        return '#845EF7';
      default:
        return '#666';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'coletada':
        return 'checkmark-circle-outline';
      case 'em análise':
        return 'time-outline';
      case 'processada':
        return 'analytics-outline';
      case 'arquivada':
        return 'archive-outline';
      default:
        return 'help-circle-outline';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Carregando detalhes da evidência...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#FF6B6B" />
          <Text style={styles.errorTitle}>Erro ao carregar evidência</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={forcarRecarregamento}>
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!evidencia) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="document-outline" size={64} color="#666" />
          <Text style={styles.errorTitle}>Evidência não encontrada</Text>
          <Text style={styles.errorMessage}>A evidência solicitada não foi encontrada.</Text>
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
            <TouchableOpacity style={styles.actionButton} onPress={handleEditarEvidencia}>
              <Ionicons name="create-outline" size={20} color="#007AFF" />
              <Text style={styles.actionButtonText}>Editar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={handleExcluirEvidencia}>
              <Ionicons name="trash-outline" size={20} color="#FF3B30" />
              <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Excluir</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Informações da Evidência */}
        <View style={styles.evidenceCard}>
          <View style={styles.evidenceHeader}>
            <View style={styles.evidenceInfo}>
              <Text style={styles.evidenceTitle}>Evidência #{evidencia._id?.slice(-8)}</Text>
              <Text style={styles.evidenceType}>{evidencia.tipo}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(evidencia.status) }]}>
              <Ionicons name={getStatusIcon(evidencia.status)} size={16} color="white" />
              <Text style={styles.statusText}>{evidencia.status}</Text>
            </View>
          </View>

          <Text style={styles.evidenceDescription}>{evidencia.descricao}</Text>

          {/* Detalhes da Evidência */}
          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Data de Coleta</Text>
              <Text style={styles.detailValue}>{formatarData(evidencia.dataColeta)}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Data de Criação</Text>
              <Text style={styles.detailValue}>{formatarDataHora(evidencia.createdAt)}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Última Atualização</Text>
              <Text style={styles.detailValue}>{formatarDataHora(evidencia.updatedAt)}</Text>
            </View>
            
            {evidencia.geolocalizacao && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Localização</Text>
                <Text style={styles.detailValue}>
                  {evidencia.geolocalizacao.latitude}, {evidencia.geolocalizacao.longitude}
                </Text>
              </View>
            )}
            
            {evidencia.coletadaPor && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Coletada por</Text>
                <Text style={styles.detailValue}>
                  {evidencia.coletadaPor.username || evidencia.coletadaPor.email || 'Não informado'}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Imagens */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="images-outline" size={24} color="#8B5CF6" />
            <Text style={styles.sectionTitle}>
              Imagens {evidencia.imagens && evidencia.imagens.length > 0 ? `(${evidencia.imagens.length})` : ''}
            </Text>
            <TouchableOpacity style={[styles.addButton, { backgroundColor: '#8B5CF6' }]} onPress={handleVerImagens}>
              <Ionicons name="eye" size={20} color="white" />
              <Text style={styles.addButtonText}>Ver Todas</Text>
            </TouchableOpacity>
          </View>
          
          {evidencia.imagens && evidencia.imagens.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesScroll}>
              {evidencia.imagens.slice(0, 5).map((imagem, index) => (
                <TouchableOpacity 
                  key={imagem._id} 
                  style={styles.imageThumbnail}
                  onPress={() => handleVerImagens()}
                >
                  <Image
                    source={{ uri: imagem.imagemUrl }}
                    style={styles.thumbnailImage}
                    resizeMode="cover"
                  />
                  {index === 4 && evidencia.imagens.length > 5 && (
                    <View style={styles.moreImagesOverlay}>
                      <Text style={styles.moreImagesText}>+{evidencia.imagens.length - 5}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptySection}>
              <Text style={styles.emptyText}>Nenhuma imagem cadastrada para esta evidência.</Text>
            </View>
          )}
        </View>

        {/* Textos */}
        {evidencia.textos && evidencia.textos.length > 0 && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-text-outline" size={24} color="#10B981" />
              <Text style={styles.sectionTitle}>
                Textos ({evidencia.textos.length})
              </Text>
            </View>
            
            {evidencia.textos.map((texto, index) => (
              <View key={texto._id} style={styles.textItem}>
                <Text style={styles.textTitle}>Texto {index + 1}</Text>
                <Text style={styles.textContent}>{texto.conteudo}</Text>
                <Text style={styles.textDate}>
                  Criado em: {formatarDataHora(texto.createdAt)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Laudo */}
        {evidencia.laudo && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="clipboard-outline" size={24} color="#F59E0B" />
              <Text style={styles.sectionTitle}>Laudo</Text>
            </View>
            
            <View style={styles.laudoItem}>
              <Text style={styles.laudoTitle}>{evidencia.laudo.titulo}</Text>
              <Text style={styles.laudoContent}>{evidencia.laudo.conteudo}</Text>
              <Text style={styles.laudoDate}>
                Criado em: {formatarDataHora(evidencia.laudo.createdAt)}
              </Text>
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
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    marginLeft: 8,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F2F2F7',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
  },
  deleteButtonText: {
    color: '#FF3B30',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginBottom: 12,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  evidenceCard: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  evidenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  evidenceInfo: {
    flex: 1,
  },
  evidenceTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  evidenceType: {
    fontSize: 16,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  evidenceDescription: {
    fontSize: 16,
    color: '#1C1C1E',
    lineHeight: 24,
    marginBottom: 16,
  },
  detailsContainer: {
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#1C1C1E',
    fontWeight: '400',
    textAlign: 'right',
    flex: 1,
    marginLeft: 8,
  },
  sectionCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    flex: 1,
    marginLeft: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  imagesScroll: {
    flexDirection: 'row',
    gap: 8,
  },
  imageThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  moreImagesOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreImagesText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptySection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
  textItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  textTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  textContent: {
    fontSize: 14,
    color: '#1C1C1E',
    lineHeight: 20,
    marginBottom: 8,
  },
  textDate: {
    fontSize: 12,
    color: '#8E8E93',
  },
  laudoItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
  },
  laudoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  laudoContent: {
    fontSize: 14,
    color: '#1C1C1E',
    lineHeight: 20,
    marginBottom: 8,
  },
  laudoDate: {
    fontSize: 12,
    color: '#8E8E93',
  },
}); 