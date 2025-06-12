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
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { casosService, authService } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';

const { width, height } = Dimensions.get('window');

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
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: -23.55052,
    longitude: -46.633308,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useAuth(); // Usar o contexto de autenticação

  const statusOptions = ['Em andamento', 'Finalizado', 'Arquivado'];

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Permissão de localização é necessária para usar esta funcionalidade.');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      
      setUserLocation({ latitude, longitude });
      setMapRegion({
        latitude,
        longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
      setSelectedLocation({ latitude, longitude });
    } catch (error) {
      console.error('Erro ao obter localização:', error);
      Alert.alert('Erro', 'Não foi possível obter sua localização atual.');
    }
  };

  const handleMapPress = (event) => {
    const { coordinate } = event.nativeEvent;
    setSelectedLocation(coordinate);
  };

  const handleConfirmLocation = () => {
    if (selectedLocation) {
      const coordenadas = `Latitude: ${selectedLocation.latitude.toFixed(6)}, Longitude: ${selectedLocation.longitude.toFixed(6)}`;
      updateFormData('localizacao', coordenadas);
      setShowMapPicker(false);
      Alert.alert('Sucesso', 'Localização selecionada com sucesso!');
    }
  };

  const handleOpenMapPicker = () => {
    if (userLocation) {
      setShowMapPicker(true);
    } else {
      Alert.alert('Erro', 'Aguarde a localização ser carregada ou verifique as permissões.');
    }
  };

  const formatarDataParaAPI = (dataString) => {
    if (!dataString) return null;
    
    // Converte DD/MM/AAAA para YYYY-MM-DD
    const partes = dataString.split('/');
    if (partes.length === 3) {
      return `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
    }
    return null;
  };

  const parsearCoordenadas = (coordenadasString) => {
    if (!coordenadasString) return null;
    
    try {
      const latMatch = coordenadasString.match(/Latitude: ([\d.-]+)/);
      const lngMatch = coordenadasString.match(/Longitude: ([\d.-]+)/);
      
      if (latMatch && lngMatch) {
        return {
          latitude: latMatch[1],
          longitude: lngMatch[1]
        };
      }
    } catch (error) {
      console.error('Erro ao parsear coordenadas:', error);
    }
    
    return null;
  };

  const handleSubmit = async () => {
    if (!formData.titulo || !formData.descricao || !formData.status || !formData.dataAbertura) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    // Verificar se há localização selecionada
    const coordenadas = parsearCoordenadas(formData.localizacao);
    if (!coordenadas) {
      Alert.alert('Erro', 'Selecione uma localização no mapa');
      return;
    }

    setIsLoading(true);
    try {
      // Obter dados do usuário do contexto ou AsyncStorage
      let userData = null;
      
      if (user) {
        userData = user;
      } else {
        const savedUserData = await AsyncStorage.getItem('@user_data');
        if (savedUserData) {
          userData = JSON.parse(savedUserData);
        }
      }
      
      if (!userData || !userData.id) {
        Alert.alert('Erro', 'Usuário não autenticado. Faça login novamente.');
        return;
      }

      // Converter data do formato brasileiro (DD/MM/AAAA) para ISO
      const converterDataParaISO = (dataString) => {
        if (!dataString) return null;
        const partes = dataString.split('/');
        if (partes.length === 3) {
          const dia = parseInt(partes[0]);
          const mes = parseInt(partes[1]) - 1; // Mês começa em 0
          const ano = parseInt(partes[2]);
          return new Date(ano, mes, dia).toISOString();
        }
        return null;
      };

      const casoData = {
        userId: userData.id,
        titulo: formData.titulo,
        descricao: formData.descricao,
        status: formData.status,
        dataAbertura: converterDataParaISO(formData.dataAbertura),
        dataFechamento: formData.dataConclusao ? converterDataParaISO(formData.dataConclusao) : null,
        geolocalizacao: {
          latitude: coordenadas.latitude.toString(),
          longitude: coordenadas.longitude.toString()
        }
      };

      console.log('CriarCaso - Dados do caso a serem enviados:', casoData);

      const response = await casosService.createCaso(casoData);
      
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
    } catch (error) {
      console.error('Erro ao criar caso:', error);
      Alert.alert('Erro', 'Erro ao criar caso');
    } finally {
      setIsLoading(false);
    }
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

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Localização</Text>
              <TouchableOpacity
                style={styles.mapButton}
                onPress={handleOpenMapPicker}
              >
                <Ionicons name="map" size={20} color="#fff" />
                <Text style={styles.mapButtonText}>Selecionar no Mapa</Text>
              </TouchableOpacity>
              {formData.localizacao ? (
                <View style={styles.coordenadasContainer}>
                  <Text style={styles.coordenadasLabel}>Localização selecionada:</Text>
                  <Text style={styles.coordenadasText}>{formData.localizacao}</Text>
                </View>
              ) : null}
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
                  <Text style={styles.submitButtonText}>Criar Caso</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        animationType="slide"
        transparent={false}
        visible={showMapPicker}
        onRequestClose={() => setShowMapPicker(false)}
      >
        <SafeAreaView style={styles.mapModalContainer}>
          <View style={styles.mapModalHeader}>
            <TouchableOpacity onPress={() => setShowMapPicker(false)}>
              <Text style={styles.mapModalButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={styles.mapModalTitle}>Selecionar Localização</Text>
            <TouchableOpacity onPress={handleConfirmLocation}>
              <Text style={styles.mapModalButtonText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
          <MapView
            style={styles.map}
            region={mapRegion}
            onPress={handleMapPress}
            showsUserLocation={true}
            showsMyLocationButton={true}
          >
            {selectedLocation && (
              <Marker
                coordinate={selectedLocation}
                pinColor="red"
                draggable
                onDragEnd={(e) => setSelectedLocation(e.nativeEvent.coordinate)}
              />
            )}
          </MapView>
        </SafeAreaView>
      </Modal>
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
  enderecoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  enderecoInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  buscarButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    height: '100%',
    justifyContent: 'center',
  },
  coordenadasContainer: {
    marginTop: 10,
    padding: 12,
    backgroundColor: '#e8f4fd',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#b3d9ff',
  },
  coordenadasLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 4,
  },
  coordenadasText: {
    fontSize: 14,
    color: '#333',
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
  buscarCoordenadasButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buscarCoordenadasText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  mapButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  mapButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  mapModalContainer: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 0 : 40,
  },
  mapModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  mapModalButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  mapModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  map: {
    flex: 1,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
}); 