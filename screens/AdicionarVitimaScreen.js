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

export default function AdicionarVitimaScreen({ navigation, route }) {
  const [nome, setNome] = useState('');
  const [genero, setGenero] = useState('');
  const [idade, setIdade] = useState('');
  const [corEtnia, setCorEtnia] = useState('');
  const [documento, setDocumento] = useState('');
  const [endereco, setEndereco] = useState('');

  const generos = ['Masculino', 'Feminino', 'Não binário', 'Prefiro não informar'];
  
  const coresEtnias = [
    'Branco',
    'Negro',
    'Pardo',
    'Amarelo',
    'Indígena',
    'Prefiro não informar'
  ];

  const handleSalvar = () => {
    if (!nome || !genero || !idade || !corEtnia || !documento || !endereco) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Aqui você pode adicionar a lógica para salvar a vítima
    Alert.alert(
      'Sucesso',
      'Vítima adicionada com sucesso!',
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
        <Text style={styles.headerTitle}>Adicionar Vítima</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Nome Completo *</Text>
            <TextInput
              style={styles.textInput}
              value={nome}
              onChangeText={setNome}
              placeholder="Digite o nome completo"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Gênero *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={genero}
                onValueChange={(itemValue) => setGenero(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Selecione o gênero" value="" />
                {generos.map((generoItem, index) => (
                  <Picker.Item key={index} label={generoItem} value={generoItem} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Idade *</Text>
            <TextInput
              style={styles.textInput}
              value={idade}
              onChangeText={setIdade}
              placeholder="Digite a idade"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Cor/Etnia *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={corEtnia}
                onValueChange={(itemValue) => setCorEtnia(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Selecione a cor/etnia" value="" />
                {coresEtnias.map((corItem, index) => (
                  <Picker.Item key={index} label={corItem} value={corItem} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Documento (CPF/RG) *</Text>
            <TextInput
              style={styles.textInput}
              value={documento}
              onChangeText={setDocumento}
              placeholder="Digite o número do documento"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Endereço *</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={endereco}
              onChangeText={setEndereco}
              placeholder="Digite o endereço completo"
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
            />
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSalvar}>
            <Ionicons name="save-outline" size={24} color="#fff" />
            <Text style={styles.saveButtonText}>Salvar Vítima</Text>
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