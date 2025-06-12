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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CriarCasoScreen({ navigation }) {
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    local: '',
    data: '',
    hora: '',
    vitimas: '',
    prioridade: 'Média',
    observacoes: '',
  });

  const prioridades = ['Baixa', 'Média', 'Alta', 'Crítica'];

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    // Validação básica
    if (!formData.titulo.trim()) {
      Alert.alert('Erro', 'Por favor, insira o título do caso');
      return;
    }

    if (!formData.descricao.trim()) {
      Alert.alert('Erro', 'Por favor, insira a descrição do caso');
      return;
    }

    if (!formData.local.trim()) {
      Alert.alert('Erro', 'Por favor, insira o local do caso');
      return;
    }

    // Simular criação do caso
    Alert.alert(
      'Sucesso',
      'Caso criado com sucesso!',
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack()
        }
      ]
    );
  };

  const InputField = ({ label, value, onChangeText, placeholder, multiline = false, numberOfLines = 1 }) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.textArea]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#999"
        multiline={multiline}
        numberOfLines={numberOfLines}
      />
    </View>
  );

  const PrioridadeSelector = () => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>Prioridade</Text>
      <View style={styles.prioridadeContainer}>
        {prioridades.map((prioridade) => (
          <TouchableOpacity
            key={prioridade}
            style={[
              styles.prioridadeButton,
              formData.prioridade === prioridade && styles.prioridadeButtonActive
            ]}
            onPress={() => updateFormData('prioridade', prioridade)}
          >
            <Text style={[
              styles.prioridadeText,
              formData.prioridade === prioridade && styles.prioridadeTextActive
            ]}>
              {prioridade}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Novo Caso</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <InputField
            label="Título do Caso"
            value={formData.titulo}
            onChangeText={(text) => updateFormData('titulo', text)}
            placeholder="Ex: Roubo em Residência"
          />

          <InputField
            label="Descrição"
            value={formData.descricao}
            onChangeText={(text) => updateFormData('descricao', text)}
            placeholder="Descreva os detalhes do caso..."
            multiline={true}
            numberOfLines={4}
          />

          <InputField
            label="Local"
            value={formData.local}
            onChangeText={(text) => updateFormData('local', text)}
            placeholder="Endereço ou local do incidente"
          />

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <InputField
                label="Data"
                value={formData.data}
                onChangeText={(text) => updateFormData('data', text)}
                placeholder="DD/MM/AAAA"
              />
            </View>
            <View style={styles.halfWidth}>
              <InputField
                label="Hora"
                value={formData.hora}
                onChangeText={(text) => updateFormData('hora', text)}
                placeholder="HH:MM"
              />
            </View>
          </View>

          <InputField
            label="Número de Vítimas"
            value={formData.vitimas}
            onChangeText={(text) => updateFormData('vitimas', text)}
            placeholder="0"
          />

          <PrioridadeSelector />

          <InputField
            label="Observações Adicionais"
            value={formData.observacoes}
            onChangeText={(text) => updateFormData('observacoes', text)}
            placeholder="Informações adicionais relevantes..."
            multiline={true}
            numberOfLines={3}
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>Criar Caso</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
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
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    color: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  prioridadeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  prioridadeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  prioridadeButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  prioridadeText: {
    fontSize: 14,
    color: '#666',
  },
  prioridadeTextActive: {
    color: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    marginBottom: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
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
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    marginLeft: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
}); 