import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  TextInput,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';

export default function AdicionarEvidenciaScreen({ navigation, route }) {
  const [tipo, setTipo] = useState('');
  const [status, setStatus] = useState('');
  const [dataColeta, setDataColeta] = useState('');
  const [localizacao, setLocalizacao] = useState('');

  const tiposEvidencia = [
    'Foto',
    'Documento',
    'Impressão Digital',
    'Amostra Biológica',
    'Arma Vestígio',
    'Vídeo',
    'Áudio',
    'Objeto',
    'Local',
    'Testemunho',
    'Laudo Técnico',
    'Relatório',
    'Outros'
  ];

  const statusOptions = ['Em análise', 'Concluído'];

  const handleSalvar = () => {
    if (!tipo || !status || !dataColeta || !localizacao) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Aqui você pode adicionar a lógica para salvar a evidência
    Alert.alert(
      'Sucesso',
      'Evidência adicionada com sucesso!',
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Adicionar Evidência</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Tipo</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={tipo}
                onValueChange={(itemValue) => setTipo(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Selecione o tipo" value="" />
                {tiposEvidencia.map((tipoItem, index) => (
                  <Picker.Item key={index} label={tipoItem} value={tipoItem} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Status</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={status}
                onValueChange={(itemValue) => setStatus(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Selecione o status" value="" />
                {statusOptions.map((statusItem, index) => (
                  <Picker.Item key={index} label={statusItem} value={statusItem} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Data de Coleta</Text>
            <TextInput
              style={styles.textInput}
              value={dataColeta}
              onChangeText={setDataColeta}
              placeholder="DD/MM/AAAA"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Localização</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={localizacao}
              onChangeText={setLocalizacao}
              placeholder="Digite a localização da evidência"
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
            />
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSalvar}>
            <Ionicons name="save-outline" size={24} color="#fff" />
            <Text style={styles.saveButtonText}>Salvar Evidência</Text>
          </TouchableOpacity>
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
  content: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 25,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 20,
    marginBottom: 40,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
}); 