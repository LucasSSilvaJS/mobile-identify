import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { relatoriosService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function EditarRelatorioScreen({ navigation, route }) {
  const [formData, setFormData] = useState({
    titulo: '',
    conteudo: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loadingRelatorio, setLoadingRelatorio] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // ID do relatório recebido via route.params
  const { relatorioId, relatorio } = route.params || {};

  useEffect(() => {
    if (relatorio) {
      // Se o relatório foi passado como parâmetro, use-o
      setFormData({
        titulo: relatorio.titulo || '',
        conteudo: relatorio.conteudo || '',
      });
      setLoadingRelatorio(false);
    } else if (relatorioId) {
      // Se apenas o ID foi passado, carregue o relatório
      carregarRelatorio();
    } else {
      setError('ID do relatório não fornecido');
      setLoadingRelatorio(false);
    }
  }, [relatorioId, relatorio]);

  const carregarRelatorio = async () => {
    try {
      setError(null);
      const data = await relatoriosService.getRelatorioById(relatorioId);
      setFormData({
        titulo: data.titulo || '',
        conteudo: data.conteudo || '',
      });
    } catch (err) {
      console.error('Erro ao carregar relatório:', err);
      setError(err.error || 'Erro ao carregar relatório');
    } finally {
      setLoadingRelatorio(false);
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.titulo || !formData.conteudo) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    if (!relatorioId) {
      Alert.alert('Erro', 'ID do relatório não fornecido');
      return;
    }

    setIsLoading(true);
    try {
      const relatorioData = {
        titulo: formData.titulo,
        conteudo: formData.conteudo,
        peritoResponsavel: user?.id || user?._id,
      };

      console.log('EditarRelatorio - Dados do relatório a serem enviados:', relatorioData);

      const response = await relatoriosService.updateRelatorio(relatorioId, relatorioData);
      
      Alert.alert(
        'Sucesso', 
        'Relatório atualizado com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('Erro ao atualizar relatório:', error);
      Alert.alert('Erro', error.error || 'Erro ao atualizar relatório');
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingRelatorio) {
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

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardContainer} 
        behavior="padding"
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Editar Relatório</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Título do Relatório</Text>
              <TextInput
                style={styles.input}
                value={formData.titulo}
                onChangeText={(text) => updateFormData('titulo', text)}
                placeholder="Ex: Relatório de Investigação - Caso #123"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Conteúdo do Relatório</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.conteudo}
                onChangeText={(text) => updateFormData('conteudo', text)}
                placeholder="Descreva os detalhes da investigação, conclusões, evidências encontradas..."
                placeholderTextColor="#999"
                multiline={true}
                numberOfLines={10}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.cancelButton, isLoading && styles.disabledButton]}
                onPress={() => navigation.goBack()}
                disabled={isLoading}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitButton, isLoading && styles.disabledButton]}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Text style={styles.submitButtonText}>Atualizando...</Text>
                ) : (
                  <Text style={styles.submitButtonText}>Atualizar Relatório</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 34,
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 200,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 15,
    marginLeft: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  disabledButton: {
    opacity: 0.6,
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
}); 