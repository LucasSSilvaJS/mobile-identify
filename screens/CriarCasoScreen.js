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

export default function CriarCasoScreen({ navigation }) {
  const [formData, setFormData] = useState({
    titulo: '',
    status: 'Em andamento',
    descricao: '',
    dataAbertura: '',
    dataConclusao: '',
    localizacao: '',
  });

  const statusOptions = ['Em andamento', 'Finalizado', 'Arquivado'];

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCapturarLocalizacao = () => {
    // Simular captura de localização
    Alert.alert(
      'Capturar Localização',
      'Funcionalidade de captura de localização será implementada em breve!',
      [{ text: 'OK' }]
    );
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

    if (!formData.dataAbertura.trim()) {
      Alert.alert('Erro', 'Por favor, insira a data de abertura');
      return;
    }

    if (!formData.localizacao.trim()) {
      Alert.alert('Erro', 'Por favor, capture a localização do caso');
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

  const StatusSelector = () => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>Status</Text>
      <View style={styles.statusContainer}>
        {statusOptions.map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.statusButton,
              formData.status === status && styles.statusButtonActive
            ]}
            onPress={() => updateFormData('status', status)}
          >
            <Text style={[
              styles.statusText,
              formData.status === status && styles.statusTextActive
            ]}>
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const LocalizacaoField = () => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>Localização</Text>
      <View style={styles.localizacaoContainer}>
        <TextInput
          style={styles.localizacaoInput}
          value={formData.localizacao}
          onChangeText={(text) => updateFormData('localizacao', text)}
          placeholder="Clique no botão para capturar localização"
          placeholderTextColor="#999"
          editable={false}
        />
        <TouchableOpacity
          style={styles.capturarButton}
          onPress={handleCapturarLocalizacao}
        >
          <Ionicons name="location" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardContainer} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Criar Novo Caso</Text>
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

            <StatusSelector />

            <InputField
              label="Descrição"
              value={formData.descricao}
              onChangeText={(text) => updateFormData('descricao', text)}
              placeholder="Descreva os detalhes do caso..."
              multiline={true}
              numberOfLines={4}
            />

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <InputField
                  label="Data de Abertura"
                  value={formData.dataAbertura}
                  onChangeText={(text) => updateFormData('dataAbertura', text)}
                  placeholder="DD/MM/AAAA"
                />
              </View>
              <View style={styles.halfWidth}>
                <InputField
                  label="Data de Conclusão"
                  value={formData.dataConclusao}
                  onChangeText={(text) => updateFormData('dataConclusao', text)}
                  placeholder="DD/MM/AAAA"
                />
              </View>
            </View>

            <LocalizacaoField />

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
  statusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statusButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  statusButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  statusText: {
    fontSize: 14,
    color: '#666',
  },
  statusTextActive: {
    color: '#fff',
  },
  localizacaoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  localizacaoInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  capturarButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    marginLeft: 10,
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