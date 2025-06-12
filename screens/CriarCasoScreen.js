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
import DateTimePicker from '@react-native-community/datetimepicker';

export default function CriarCasoScreen({ navigation }) {
  const [formData, setFormData] = useState({
    titulo: '',
    status: 'Em andamento',
    descricao: '',
    dataAbertura: '',
    dataConclusao: '',
    localizacao: '',
  });

  const [showDatePickerAbertura, setShowDatePickerAbertura] = useState(false);
  const [showDatePickerConclusao, setShowDatePickerConclusao] = useState(false);

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

  const onDateChange = (event, selectedDate, field) => {
    if (Platform.OS === 'android') {
      if (field === 'dataAbertura') {
        setShowDatePickerAbertura(false);
      } else {
        setShowDatePickerConclusao(false);
      }
    }
    if (selectedDate) {
      const currentDate = selectedDate || new Date();
      const formattedDate = currentDate.toLocaleDateString('pt-BR');
      updateFormData(field, formattedDate);
    }
  };

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
        behavior="padding"
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

        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Título do Caso</Text>
              <TextInput
                style={styles.input}
                value={formData.titulo}
                onChangeText={(text) => updateFormData('titulo', text)}
                placeholder="Ex: Roubo em Residência"
                placeholderTextColor="#999"
              />
            </View>

            <StatusSelector />

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Descrição</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.descricao}
                onChangeText={(text) => updateFormData('descricao', text)}
                placeholder="Descreva os detalhes do caso..."
                placeholderTextColor="#999"
                multiline={true}
                numberOfLines={4}
              />
            </View>

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Data de Abertura</Text>
                  <TouchableOpacity onPress={() => setShowDatePickerAbertura(true)}>
                    <View style={styles.dateInput}>
                      <Text style={formData.dataAbertura ? styles.dateText : styles.placeholderTextDate}>
                        {formData.dataAbertura || "DD/MM/AAAA"}
                      </Text>
                      <Ionicons name="calendar" size={20} color="#999" />
                    </View>
                  </TouchableOpacity>
                  {showDatePickerAbertura && (
                    <DateTimePicker
                      testID="datePickerAbertura"
                      value={formData.dataAbertura ? new Date(formData.dataAbertura.split('/').reverse().join('-')) : new Date()}
                      mode="date"
                      display="default"
                      onChange={(event, selectedDate) => onDateChange(event, selectedDate, 'dataAbertura')}
                    />
                  )}
                </View>
              </View>
              <View style={styles.halfWidth}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Data de Conclusão</Text>
                  <TouchableOpacity onPress={() => setShowDatePickerConclusao(true)}>
                    <View style={styles.dateInput}>
                      <Text style={formData.dataConclusao ? styles.dateText : styles.placeholderTextDate}>
                        {formData.dataConclusao || "DD/MM/AAAA"}
                      </Text>
                      <Ionicons name="calendar" size={20} color="#999" />
                    </View>
                  </TouchableOpacity>
                  {showDatePickerConclusao && (
                    <DateTimePicker
                      testID="datePickerConclusao"
                      value={formData.dataConclusao ? new Date(formData.dataConclusao.split('/').reverse().join('-')) : new Date()}
                      mode="date"
                      display="default"
                      onChange={(event, selectedDate) => onDateChange(event, selectedDate, 'dataConclusao')}
                    />
                  )}
                </View>
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
    padding: 20,
  },
  formContainer: {
    flex: 1,
    paddingBottom: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  statusButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#eee',
  },
  statusButtonActive: {
    backgroundColor: '#007AFF',
  },
  statusText: {
    fontSize: 15,
    color: '#555',
    fontWeight: '500',
  },
  statusTextActive: {
    color: '#fff',
  },
  localizacaoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  localizacaoInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  capturarButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    height: '100%',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  halfWidth: {
    width: '48%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#ccc',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderTextDate: {
    fontSize: 16,
    color: '#999',
  },
}); 