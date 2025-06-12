import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Importação condicional do mapa
let MapView, Marker;
try {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
} catch (error) {
  console.log('Mapa não disponível:', error);
  MapView = null;
  Marker = null;
}

export default function DetalhesCasoScreen({ navigation, route }) {
  // Dados do caso recebidos via route.params
  const { caso } = route.params || {
    id: '1',
    numero: 'CASE-001',
    titulo: 'Roubo em Residência',
    status: 'Em andamento',
    descricao: 'Roubo ocorrido em residência localizada na Rua das Flores, 123. O suspeito invadiu a propriedade durante a madrugada e levou objetos de valor.',
    dataAbertura: '15/03/2024',
    dataConclusao: '',
    localizacao: 'Rua das Flores, 123 - Centro',
    latitude: -23.5505,
    longitude: -46.6333,
    evidencia: 'Fotos do local, impressões digitais',
    vitimas: 'João Silva',
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Em andamento':
        return '#FF6B6B';
      case 'Finalizado':
        return '#51CF66';
      case 'Arquivado':
        return '#845EF7';
      default:
        return '#666';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Em andamento':
        return 'time-outline';
      case 'Finalizado':
        return 'checkmark-circle-outline';
      case 'Arquivado':
        return 'archive-outline';
      default:
        return 'help-circle-outline';
    }
  };

  const InfoCard = ({ title, value, icon, color = '#333' }) => (
    <View style={styles.infoCard}>
      <View style={styles.infoHeader}>
        <Ionicons name={icon} size={20} color={color} />
        <Text style={styles.infoTitle}>{title}</Text>
      </View>
      <Text style={[styles.infoValue, { color }]}>
        {value || 'Não informado'}
      </Text>
    </View>
  );

  const MapCard = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Localização</Text>
      <View style={styles.mapContainer}>
        {MapView ? (
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: caso.geolocalizacao?.latitude || caso.latitude || -23.5505,
              longitude: caso.geolocalizacao?.longitude || caso.longitude || -46.6333,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker
              coordinate={{
                latitude: caso.geolocalizacao?.latitude || caso.latitude || -23.5505,
                longitude: caso.geolocalizacao?.longitude || caso.longitude || -46.6333,
              }}
              title={caso.titulo || 'Caso'}
              description={caso.geolocalizacao?.endereco || caso.localizacao || 'Localização'}
            />
          </MapView>
        ) : (
          <View style={styles.mapPlaceholder}>
            <Ionicons name="map-outline" size={48} color="#ccc" />
            <Text style={styles.mapPlaceholderText}>Mapa não disponível</Text>
            <Text style={styles.mapPlaceholderSubtext}>
              Coordenadas: {caso.geolocalizacao?.latitude || caso.latitude || -23.5505}, {caso.geolocalizacao?.longitude || caso.longitude || -46.6333}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.coordinatesContainer}>
        <Text style={styles.coordinatesText}>
          Latitude: {caso.geolocalizacao?.latitude || caso.latitude || -23.5505}
        </Text>
        <Text style={styles.coordinatesText}>
          Longitude: {caso.geolocalizacao?.longitude || caso.longitude || -46.6333}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes do Caso</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* ID e Título */}
          <View style={styles.titleSection}>
            <Text style={styles.caseId}>
              {caso.numero || `CASE-${String(caso.id || caso._id || '').slice(-6)}`}
            </Text>
            <Text style={styles.caseTitle}>{caso.titulo}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(caso.status) }]}>
              <Ionicons name={getStatusIcon(caso.status)} size={16} color="#fff" />
              <Text style={styles.statusText}>{caso.status}</Text>
            </View>
          </View>

          {/* Informações Principais */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informações Gerais</Text>
            
            <InfoCard
              title="Data de Abertura"
              value={caso.dataAbertura ? new Date(caso.dataAbertura).toLocaleDateString('pt-BR') : 'Não informado'}
              icon="calendar-outline"
              color="#007AFF"
            />

            {caso.dataConclusao && (
              <InfoCard
                title="Data de Conclusão"
                value={new Date(caso.dataConclusao).toLocaleDateString('pt-BR')}
                icon="checkmark-circle-outline"
                color="#51CF66"
              />
            )}

            <InfoCard
              title="Endereço"
              value={caso.geolocalizacao?.endereco || caso.localizacao || 'Não informado'}
              icon="location-outline"
              color="#FF6B6B"
            />

            <InfoCard
              title="Vítima(s)"
              value={caso.vitimas?.length ? `${caso.vitimas.length} vítima(s)` : 'Nenhuma vítima registrada'}
              icon="person-outline"
              color="#845EF7"
            />
          </View>

          {/* Descrição */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descrição</Text>
            <View style={styles.descriptionCard}>
              <Text style={styles.descriptionText}>{caso.descricao || 'Nenhuma descrição disponível'}</Text>
            </View>
          </View>

          {/* Mapa */}
          <MapCard />

          {/* Evidências */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Evidências</Text>
            <View style={styles.evidenceCard}>
              <Ionicons name="document-text-outline" size={20} color="#007AFF" />
              <Text style={styles.evidenceText}>
                {caso.evidencias?.length ? `${caso.evidencias.length} evidência(s)` : 'Nenhuma evidência registrada'}
              </Text>
            </View>
            <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AdicionarEvidencia')}>
              <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
              <Text style={styles.addButtonText}>Adicionar Evidência</Text>
            </TouchableOpacity>
          </View>

          {/* Vítimas */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vítimas</Text>
            <View style={styles.evidenceCard}>
              <Ionicons name="person-outline" size={20} color="#845EF7" />
              <Text style={styles.evidenceText}>
                {caso.vitimas?.length ? `${caso.vitimas.length} vítima(s)` : 'Nenhuma vítima registrada'}
              </Text>
            </View>
            <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AdicionarVitima')}>
              <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
              <Text style={styles.addButtonText}>Adicionar Vítima</Text>
            </TouchableOpacity>
          </View>

          {/* Relatório */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Relatório</Text>
            <View style={styles.evidenceCard}>
              <Ionicons name="receipt-outline" size={20} color="#51CF66" />
              <Text style={styles.evidenceText}>Nenhum relatório adicionado.</Text>
            </View>
            <TouchableOpacity style={styles.addButton} onPress={() => alert('Adicionar Relatório')}>
              <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
              <Text style={styles.addButtonText}>Adicionar Relatório</Text>
            </TouchableOpacity>
          </View>
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
  titleSection: {
    marginBottom: 30,
  },
  caseId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 5,
  },
  caseTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginLeft: 8,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  descriptionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  evidenceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  evidenceText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  actionsSection: {
    marginTop: 20,
    marginBottom: 30,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 8,
  },
  deleteButton: {
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  deleteButtonText: {
    color: '#FF3B30',
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: '#f0f0f0',
  },
  map: {
    flex: 1,
  },
  coordinatesContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  coordinatesText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  mapPlaceholderSubtext: {
    fontSize: 14,
    color: '#666',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 8,
  },
}); 