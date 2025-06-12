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
  Modal,
  Dimensions,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { useEvidencias } from '../hooks/useEvidencias';
import { useAuth } from '../contexts/AuthContext';

const { width, height } = Dimensions.get('window');

export default function EditarEvidenciaScreen({ navigation, route }) {
  const { evidenciaId, evidencia } = route.params || {};
  const { user } = useAuth();
  const { getEvidenciaById, atualizarEvidencia, loading } = useEvidencias();
  
  const [tipo, setTipo] = useState('');
  const [status, setStatus] = useState('');
  const [dataColeta, setDataColeta] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: -23.55052,
    longitude: -46.633308,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
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

  // Obter localização atual ao carregar a tela
  useEffect(() => {
    getCurrentLocation();
  }, []);

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
    
    // Configurar localização do mapa
    if (dados.geolocalizacao) {
      const lat = parseFloat(dados.geolocalizacao.latitude);
      const lng = parseFloat(dados.geolocalizacao.longitude);
      
      setMapRegion({
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
      setSelectedLocation({ latitude: lat, longitude: lng });
    }
  };

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
      
      // Só atualiza a região do mapa se não houver localização já selecionada
      if (!selectedLocation) {
        setMapRegion({
          latitude,
          longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        });
        setSelectedLocation({ latitude, longitude });
      }
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
      setShowMapPicker(false);
      Alert.alert(
        'Localização Confirmada',
        `Latitude: ${selectedLocation.latitude.toFixed(6)}, Longitude: ${selectedLocation.longitude.toFixed(6)}`
      );
    }
  };

  const handleOpenMapPicker = () => {
    if (userLocation || selectedLocation) {
      setShowMapPicker(true);
    } else {
      Alert.alert('Erro', 'Aguarde a localização ser carregada ou verifique as permissões.');
    }
  };

  const onDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      const currentDate = selectedDate || new Date();
      const formattedDate = currentDate.toLocaleDateString('pt-BR');
      setDataColeta(formattedDate);
    }
  };

  // Validar campos
  const validarCampos = () => {
    if (!tipo) {
      Alert.alert('Erro', 'Por favor, selecione o tipo da evidência.');
      return false;
    }
    
    if (!dataColeta) {
      Alert.alert('Erro', 'Por favor, selecione a data de coleta.');
      return false;
    }
    
    if (!selectedLocation) {
      Alert.alert('Erro', 'Por favor, selecione uma localização no mapa.');
      return false;
    }

    return true;
  };

  // Converter data para formato ISO
  const converterDataParaISO = (dataString) => {
    if (!dataString) return null;
    
    // Converte DD/MM/AAAA para YYYY-MM-DD
    const partes = dataString.split('/');
    if (partes.length === 3) {
      return `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
    }
    return null;
  };

  const handleSalvar = async () => {
    if (!validarCampos()) return;

    try {
      const evidenciaData = {
        tipo,
        dataColeta: converterDataParaISO(dataColeta),
        status,
        coletadaPor: user?.id || user?._id,
        latitude: selectedLocation.latitude.toString(),
        longitude: selectedLocation.longitude.toString()
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
            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <View style={styles.dateInput}>
                <Text style={dataColeta ? styles.dateText : styles.placeholderTextDate}>
                  {dataColeta || "DD/MM/AAAA"}
                </Text>
                <Ionicons name="calendar" size={20} color="#999" />
              </View>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                testID="datePickerColeta"
                value={dataColeta ? new Date(dataColeta.split('/').reverse().join('-')) : new Date()}
                mode="date"
                display="default"
                onChange={onDateChange}
              />
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Localização *</Text>
            <TouchableOpacity
              style={styles.mapButton}
              onPress={handleOpenMapPicker}
            >
              <Ionicons name="map" size={20} color="#fff" />
              <Text style={styles.mapButtonText}>Selecionar no Mapa</Text>
            </TouchableOpacity>
            {selectedLocation ? (
              <View style={styles.coordenadasContainer}>
                <Text style={styles.coordenadasLabel}>Localização selecionada:</Text>
                <Text style={styles.coordenadasText}>
                  Latitude: {selectedLocation.latitude.toFixed(6)}, Longitude: {selectedLocation.longitude.toFixed(6)}
                </Text>
              </View>
            ) : null}
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
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
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
  mapButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  mapButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
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
}); 