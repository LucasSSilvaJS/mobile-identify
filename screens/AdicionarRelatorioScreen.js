import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useRelatorios } from '../hooks/useRelatorios';

export default function AdicionarRelatorioScreen({ navigation, route }) {
  const [formData, setFormData] = useState({
    titulo: '',
    conteudo: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { criarRelatorio } = useRelatorios();

  // ID do caso recebido via route.params
  const { casoId } = route.params || {};

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

    if (!casoId) {
      Alert.alert('Erro', 'ID do caso não fornecido');
      return;
    }

    setIsLoading(true);
    try {
      const relatorioData = {
        casoId: casoId,
        userId: user?.id || user?._id,
        titulo: formData.titulo,
        conteudo: formData.conteudo,
        peritoResponsavel: user?.id || user?._id,
      };

      console.log('AdicionarRelatorio - Dados do relatório a serem enviados:', relatorioData);

      await criarRelatorio(relatorioData);
      
      Alert.alert(
        'Sucesso', 
        'Relatório criado com sucesso! A lista será atualizada automaticamente.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('Erro ao criar relatório:', error);
      Alert.alert('Erro', error.error || 'Erro ao criar relatório');
    } finally {
      setIsLoading(false);
    }
  };

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
          <Text style={styles.headerTitle}>Criar Relatório</Text>
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
                  <Text style={styles.submitButtonText}>Criando...</Text>
                ) : (
                  <Text style={styles.submitButtonText}>Criar Relatório</Text>
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
}); 