import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useEvidencias } from '../hooks/useEvidencias';
import { useAuth } from '../contexts/AuthContext';

export default function EditarEvidenciaScreen({ navigation, route }) {
  const { evidenciaId, evidencia } = route.params || {};
  const { user } = useAuth();
  const { getEvidenciaById, atualizarEvidencia, loading } = useEvidencias();
  
  const [tipo, setTipo] = useState('');
  const [status, setStatus] = useState('');
  const [dataColeta, setDataColeta] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

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

  // Carregar dados da evidência
  useEffect(() => {
    if (evidencia) {
      carregarDadosEvidencia(evidencia);
    } else if (evidenciaId) {
      carregarEvidenciaPorId();
    }
  }, [evidencia, evidenciaId]);

  const carregarEvidenciaPorId = async () => {
    try {
      setInitialLoading(true);
      const dadosEvidencia = await getEvidenciaById(evidenciaId);
      carregarDadosEvidencia(dadosEvidencia);
    } catch (error) {
      console.error('Erro ao carregar evidência:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados da evidência.');
      navigation.goBack();
    } finally {
      setInitialLoading(false);
    }
  };

  const carregarDadosEvidencia = (dados) => {
    setTipo(dados.tipo || '');
    setStatus(dados.status || 'Em análise');
    
    // Converter data ISO para formato DD/MM/AAAA
    if (dados.dataColeta) {
      const data = new Date(dados.dataColeta);
      const dia = String(data.getDate()).padStart(2, '0');
      const mes = String(data.getMonth() + 1).padStart(2, '0');
      const ano = data.getFullYear();
      setDataColeta(`${dia}/${mes}/${ano}`);
    }
    
    setLatitude(dados.geolocalizacao?.latitude || '');
    setLongitude(dados.geolocalizacao?.longitude || '');
  };

  // Obter localização atual
  const obterLocalizacao = async () => {
    try {
      setIsGettingLocation(true);
      
      // Verificar permissões
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permissão Negada',
          'É necessário permitir o acesso à localização para obter as coordenadas da evidência.'
        );
        return;
      }

      // Obter localização
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLatitude(location.coords.latitude.toString());
      setLongitude(location.coords.longitude.toString());
      
      Alert.alert(
        'Localização Obtida',
        'Coordenadas capturadas com sucesso!'
      );
    } catch (error) {
      console.error('Erro ao obter localização:', error);
      Alert.alert(
        'Erro',
        'Não foi possível obter a localização. Verifique se o GPS está ativado.'
      );
    } finally {
      setIsGettingLocation(false);
    }
  };

  // Validar campos
  const validarCampos = () => {
    if (!tipo) {
      Alert.alert('Erro', 'Por favor, selecione o tipo da evidência.');
      return false;
    }
    
    if (!dataColeta) {
      Alert.alert('Erro', 'Por favor, informe a data de coleta.');
      return false;
    }
    
    if (!latitude || !longitude) {
      Alert.alert('Erro', 'Por favor, obtenha a localização da evidência.');
      return false;
    }

    // Validar formato da data
    const dataRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dataRegex.test(dataColeta)) {
      Alert.alert('Erro', 'Por favor, informe a data no formato DD/MM/AAAA.');
      return false;
    }

    return true;
  };

  // Converter data para formato ISO
  const converterDataParaISO = (dataString) => {
    const [dia, mes, ano] = dataString.split('/');
    return new Date(ano, mes - 1, dia).toISOString();
  };

  const handleSalvar = async () => {
    if (!validarCampos()) return;

    try {
      const evidenciaData = {
        tipo,
        dataColeta: converterDataParaISO(dataColeta),
        status,
        coletadaPor: user?.id || user?._id,
        latitude,
        longitude
      };

      await atualizarEvidencia(evidenciaId, evidenciaData);

      Alert.alert(
        'Sucesso',
        'Evidência atualizada com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navegar de volta com callback para atualizar a lista
              if (route.params?.onReturn) {
                route.params.onReturn();
              }
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Erro ao atualizar evidência:', error);
      Alert.alert(
        'Erro',
        error.error || 'Erro ao atualizar evidência. Tente novamente.'
      );
    }
  };

  if (initialLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Carregando evidência...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Evidência</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Tipo *</Text>
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
                {statusOptions.map((statusItem, index) => (
                  <Picker.Item key={index} label={statusItem} value={statusItem} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Data de Coleta *</Text>
            <TextInput
              style={styles.textInput}
              value={dataColeta}
              onChangeText={setDataColeta}
              placeholder="DD/MM/AAAA"
              placeholderTextColor="#999"
              keyboardType="numeric"
              maxLength={10}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Localização *</Text>
            <View style={styles.locationContainer}>
              <View style={styles.coordinateInputs}>
                <View style={styles.coordinateInput}>
                  <Text style={styles.coordinateLabel}>Latitude</Text>
                  <TextInput
                    style={styles.textInput}
                    value={latitude}
                    onChangeText={setLatitude}
                    placeholder="Ex: -23.5505"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.coordinateInput}>
                  <Text style={styles.coordinateLabel}>Longitude</Text>
                  <TextInput
                    style={styles.textInput}
                    value={longitude}
                    onChangeText={setLongitude}
                    placeholder="Ex: -46.6333"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                  />
                </View>
              </View>
              
              <TouchableOpacity 
                style={styles.locationButton} 
                onPress={obterLocalizacao}
                disabled={isGettingLocation}
              >
                {isGettingLocation ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="location" size={20} color="#fff" />
                )}
                <Text style={styles.locationButtonText}>
                  {isGettingLocation ? 'Obtendo...' : 'Obter Localização'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.saveButton, loading && styles.saveButtonDisabled]} 
            onPress={handleSalvar}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="save-outline" size={24} color="#fff" />
            )}
            <Text style={styles.saveButtonText}>
              {loading ? 'Salvando...' : 'Atualizar Evidência'}
            </Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
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
  locationContainer: {
    gap: 15,
  },
  coordinateInputs: {
    flexDirection: 'row',
    gap: 10,
  },
  coordinateInput: {
    flex: 1,
  },
  coordinateLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 5,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#28a745',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 8,
  },
  locationButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
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
    gap: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
}); 