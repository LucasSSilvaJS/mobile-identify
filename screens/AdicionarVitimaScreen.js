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
import { useVitimas } from '../hooks/useVitimas';

export default function AdicionarVitimaScreen({ navigation, route }) {
  const [formData, setFormData] = useState({
    nome: '',
    genero: '',
    idade: '',
    documento: '',
    endereco: '',
    corEtnia: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { criarVitima } = useVitimas();

  // ID do caso recebido via route.params
  const { casoId } = route.params || {};

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.nome || formData.nome.trim() === '') {
      Alert.alert('Erro', 'O nome é obrigatório');
      return false;
    }

    if (formData.idade && (isNaN(formData.idade) || parseInt(formData.idade) < 0 || parseInt(formData.idade) > 150)) {
      Alert.alert('Erro', 'A idade deve ser um número válido entre 0 e 150');
      return false;
    }

    if (formData.documento && formData.documento.trim() !== '') {
      // Validar formato do documento (CPF ou RG)
      const documentoRegex = /^(\d{3}\.\d{3}\.\d{3}-\d{2}|\d{2}\.\d{3}\.\d{3}-\d{1}|\d{11}|\d{9})$/;
      if (!documentoRegex.test(formData.documento.replace(/[^\d]/g, ''))) {
        Alert.alert('Erro', 'Formato de documento inválido. Use CPF ou RG.');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    if (!casoId) {
      Alert.alert('Erro', 'ID do caso não fornecido');
      return;
    }

    setIsLoading(true);
    try {
      const vitimaData = {
        nome: formData.nome.trim(),
        genero: formData.genero.trim() || undefined,
        idade: formData.idade ? parseInt(formData.idade) : undefined,
        documento: formData.documento.trim() || undefined,
        endereco: formData.endereco.trim() || undefined,
        corEtnia: formData.corEtnia.trim() || undefined,
        idCaso: casoId,
      };

      console.log('AdicionarVitima - Dados da vítima a serem enviados:', vitimaData);

      await criarVitima(vitimaData);
      
      Alert.alert(
        'Sucesso', 
        'Vítima criada com sucesso! A lista será atualizada automaticamente.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('Erro ao criar vítima:', error);
      Alert.alert('Erro', error.error || 'Erro ao criar vítima');
    } finally {
      setIsLoading(false);
    }
  };

  const formatarDocumento = (text) => {
    // Remove tudo que não é dígito
    const numbers = text.replace(/\D/g, '');
    
    // Formata como CPF se tiver 11 dígitos
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    
    // Formata como RG se tiver 9 dígitos
    if (numbers.length <= 9) {
      return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{1})/, '$1.$2.$3-$4');
    }
    
    return text;
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
          <Text style={styles.headerTitle}>Adicionar Vítima</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Nome *</Text>
              <TextInput
                style={styles.input}
                value={formData.nome}
                onChangeText={(text) => updateFormData('nome', text)}
                placeholder="Nome completo da vítima"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Gênero</Text>
              <TextInput
                style={styles.input}
                value={formData.genero}
                onChangeText={(text) => updateFormData('genero', text)}
                placeholder="Ex: Masculino, Feminino, Não informado"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Idade</Text>
              <TextInput
                style={styles.input}
                value={formData.idade}
                onChangeText={(text) => updateFormData('idade', text.replace(/\D/g, ''))}
                placeholder="Ex: 25"
                placeholderTextColor="#999"
                keyboardType="numeric"
                maxLength={3}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Documento</Text>
              <TextInput
                style={styles.input}
                value={formData.documento}
                onChangeText={(text) => updateFormData('documento', formatarDocumento(text))}
                placeholder="CPF ou RG"
                placeholderTextColor="#999"
                maxLength={14}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Endereço</Text>
              <TextInput
                style={styles.input}
                value={formData.endereco}
                onChangeText={(text) => updateFormData('endereco', text)}
                placeholder="Endereço completo"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Cor/Etnia</Text>
              <TextInput
                style={styles.input}
                value={formData.corEtnia}
                onChangeText={(text) => updateFormData('corEtnia', text)}
                placeholder="Ex: Branca, Negra, Parda, Amarela, Indígena"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.infoContainer}>
              <Ionicons name="information-circle-outline" size={20} color="#007AFF" />
              <Text style={styles.infoText}>
                O NIC (Número de Identificação do Caso) será gerado automaticamente pelo sistema.
              </Text>
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
                  <Text style={styles.submitButtonText}>Criar Vítima</Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
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
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#1976d2',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#6c757d',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
}); 