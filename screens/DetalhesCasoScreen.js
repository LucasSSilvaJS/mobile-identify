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

  const SectionCard = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const ActionButton = ({ title, icon, onPress, color = '#007AFF' }) => (
    <TouchableOpacity style={styles.actionButton} onPress={onPress}>
      <Ionicons name={icon} size={24} color={color} />
      <Text style={[styles.actionButtonText, { color }]}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes do Caso</Text>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Cabeçalho do Caso */}
          <View style={styles.caseHeader}>
            <Text style={styles.caseNumber}>
              {caso.numero || `CASE-${String(caso.id || caso._id || '').slice(-6)}`}
            </Text>
            <Text style={styles.caseTitle}>{caso.titulo}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(caso.status) }]}>
              <Ionicons name={getStatusIcon(caso.status)} size={16} color="#fff" />
              <Text style={styles.statusText}>{caso.status}</Text>
            </View>
          </View>

          {/* Informações Básicas */}
          <SectionCard title="Informações Básicas">
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
              title="Localização"
              value={caso.geolocalizacao?.endereco || caso.localizacao || 'Não informado'}
              icon="location-outline"
              color="#FF6B6B"
            />

            <InfoCard
              title="Vítimas"
              value={caso.vitimas?.length ? `${caso.vitimas.length} vítima(s)` : 'Nenhuma vítima registrada'}
              icon="person-outline"
              color="#845EF7"
            />
          </SectionCard>

          {/* Descrição */}
          <SectionCard title="Descrição">
            <View style={styles.descriptionCard}>
              <Text style={styles.descriptionText}>
                {caso.descricao || 'Nenhuma descrição disponível'}
              </Text>
            </View>
          </SectionCard>

          {/* Evidências */}
          <SectionCard title="Evidências">
            <View style={styles.evidenceCard}>
              <Ionicons name="document-text-outline" size={20} color="#007AFF" />
              <Text style={styles.evidenceText}>
                {caso.evidencias?.length ? `${caso.evidencias.length} evidência(s)` : 'Nenhuma evidência registrada'}
              </Text>
            </View>
            <ActionButton
              title="Adicionar Evidência"
              icon="add-circle-outline"
              onPress={() => navigation.navigate('AdicionarEvidencia')}
            />
          </SectionCard>

          {/* Vítimas */}
          <SectionCard title="Vítimas">
            <View style={styles.evidenceCard}>
              <Ionicons name="person-outline" size={20} color="#845EF7" />
              <Text style={styles.evidenceText}>
                {caso.vitimas?.length ? `${caso.vitimas.length} vítima(s)` : 'Nenhuma vítima registrada'}
              </Text>
            </View>
            <ActionButton
              title="Adicionar Vítima"
              icon="add-circle-outline"
              onPress={() => navigation.navigate('AdicionarVitima')}
            />
          </SectionCard>

          {/* Relatório */}
          <SectionCard title="Relatório">
            <View style={styles.evidenceCard}>
              <Ionicons name="receipt-outline" size={20} color="#51CF66" />
              <Text style={styles.evidenceText}>Nenhum relatório adicionado</Text>
            </View>
            <ActionButton
              title="Adicionar Relatório"
              icon="add-circle-outline"
              onPress={() => alert('Funcionalidade em desenvolvimento')}
            />
          </SectionCard>

          {/* Ações */}
          <SectionCard title="Ações">
            <ActionButton
              title="Editar Caso"
              icon="create-outline"
              onPress={() => navigation.navigate('EditarCaso', { caso })}
            />
            <ActionButton
              title="Compartilhar"
              icon="share-outline"
              onPress={() => alert('Funcionalidade em desenvolvimento')}
            />
            <ActionButton
              title="Excluir Caso"
              icon="trash-outline"
              color="#FF3B30"
              onPress={() => alert('Funcionalidade em desenvolvimento')}
            />
          </SectionCard>
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
  menuButton: {
    padding: 5,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  caseHeader: {
    marginBottom: 30,
    alignItems: 'center',
  },
  caseNumber: {
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
    textAlign: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
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
  evidenceText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    flex: 1,
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
    marginLeft: 8,
  },
}); 