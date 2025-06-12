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
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { relatoriosService } from '../services/api';

export default function DetalhesRelatorioScreen({ navigation, route }) {
  const [relatorio, setRelatorio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { relatorioId } = route.params;

  const carregarRelatorio = async () => {
    try {
      setError(null);
      const data = await relatoriosService.getRelatorioById(relatorioId);
      setRelatorio(data);
    } catch (err) {
      console.error('Erro ao carregar relatório:', err);
      setError(err.error || 'Erro ao carregar relatório');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarRelatorio();
  }, [relatorioId]);

  const handleEditarRelatorio = () => {
    navigation.navigate('EditarRelatorio', { 
      relatorioId: relatorio._id,
      relatorio: relatorio 
    });
  };

  const handleCompartilhar = async () => {
    try {
      const conteudo = `Relatório: ${relatorio.titulo}\n\n${relatorio.conteudo}\n\nPerito: ${relatorio.peritoResponsavel?.username || relatorio.peritoResponsavel?.email || 'Não informado'}`;
      
      await Share.share({
        message: conteudo,
        title: relatorio.titulo,
      });
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      Alert.alert('Erro', 'Erro ao compartilhar relatório');
    }
  };

  const handleCopiarConteudo = () => {
    // Em React Native, podemos usar Clipboard do Expo
    // Por enquanto, vamos mostrar uma mensagem
    Alert.alert(
      'Copiar Conteúdo',
      'Funcionalidade de copiar será implementada em breve.',
      [{ text: 'OK' }]
    );
  };

  const handleExportarPDF = () => {
    Alert.alert(
      'Exportar PDF',
      'Funcionalidade de exportação será implementada em breve.',
      [{ text: 'OK' }]
    );
  };

  const formatarData = (dataString) => {
    if (!dataString) return 'Não informado';
    try {
      return new Date(dataString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dataString;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Carregando relatório...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#FF6B6B" />
          <Text style={styles.errorTitle}>Erro ao carregar relatório</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={carregarRelatorio}>
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!relatorio) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="document-outline" size={64} color="#666" />
          <Text style={styles.errorTitle}>Relatório não encontrado</Text>
          <Text style={styles.errorMessage}>O relatório solicitado não foi encontrado.</Text>
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
            <TouchableOpacity style={styles.actionButton} onPress={handleEditarRelatorio}>
              <Ionicons name="create-outline" size={20} color="#007AFF" />
              <Text style={styles.actionButtonText}>Editar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={handleCompartilhar}>
              <Ionicons name="share-outline" size={20} color="#007AFF" />
              <Text style={styles.actionButtonText}>Compartilhar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleCopiarConteudo}>
              <Ionicons name="copy-outline" size={20} color="#007AFF" />
              <Text style={styles.actionButtonText}>Copiar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleExportarPDF}>
              <Ionicons name="document-outline" size={20} color="#007AFF" />
              <Text style={styles.actionButtonText}>PDF</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Informações do Relatório */}
        <View style={styles.relatorioCard}>
          <View style={styles.relatorioHeader}>
            <View style={styles.relatorioInfo}>
              <Text style={styles.relatorioTitle}>{relatorio.titulo}</Text>
              <Text style={styles.relatorioId}>ID: {relatorio._id?.slice(-8)}</Text>
            </View>
            <View style={styles.statusBadge}>
              <Ionicons name="document-text-outline" size={16} color="white" />
              <Text style={styles.statusText}>Relatório</Text>
            </View>
          </View>

          {/* Detalhes do Relatório */}
          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Data de Criação</Text>
              <Text style={styles.detailValue}>{formatarData(relatorio.createdAt)}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Última Atualização</Text>
              <Text style={styles.detailValue}>{formatarData(relatorio.updatedAt)}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Perito Responsável</Text>
              <Text style={styles.detailValue}>
                {relatorio.peritoResponsavel?.username || 
                 relatorio.peritoResponsavel?.email || 
                 'Não informado'}
              </Text>
            </View>
          </View>
        </View>

        {/* Conteúdo do Relatório */}
        <View style={styles.contentCard}>
          <View style={styles.contentHeader}>
            <Ionicons name="document-text-outline" size={24} color="#3B82F6" />
            <Text style={styles.contentTitle}>Conteúdo do Relatório</Text>
          </View>
          
          <Text style={styles.contentText}>{relatorio.conteudo}</Text>
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
  backButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  relatorioCard: {
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
  relatorioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  relatorioInfo: {
    flex: 1,
  },
  relatorioTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  relatorioId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
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
  contentCard: {
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
  contentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    textAlign: 'justify',
  },
}); 