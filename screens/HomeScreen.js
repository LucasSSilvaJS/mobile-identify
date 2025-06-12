import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;

export default function HomeScreen() {
  const [stats] = useState({
    totalCasos: 156,
    totalEvidencias: 423,
    totalVitimas: 89,
  });

  const [statusData] = useState([
    {
      name: 'Em Andamento',
      population: 67,
      color: '#FF6B6B',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    },
    {
      name: 'Finalizados',
      population: 45,
      color: '#4ECDC4',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    },
    {
      name: 'Arquivados',
      population: 44,
      color: '#45B7D1',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    },
  ]);

  const [casosPorMes] = useState({
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai'],
    datasets: [
      {
        data: [12, 18, 25, 22, 15],
      },
    ],
  });

  const [distribuicaoStatus] = useState({
    emAndamento: 67,
    finalizados: 45,
    arquivados: 44,
  });

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#007AFF',
    },
  };

  const pieChartConfig = {
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  };

  const StatCard = ({ title, value, icon, color }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statContent}>
        <View style={styles.statHeader}>
          <Ionicons name={icon} size={24} color={color} />
          <Text style={styles.statTitle}>{title}</Text>
        </View>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
      </View>
    </View>
  );

  const StatusCard = ({ title, value, color, percentage }) => (
    <View style={styles.statusCard}>
      <View style={styles.statusHeader}>
        <View style={[styles.statusDot, { backgroundColor: color }]} />
        <Text style={styles.statusTitle}>{title}</Text>
      </View>
      <Text style={[styles.statusValue, { color }]}>{value}</Text>
      <Text style={styles.statusPercentage}>{percentage}%</Text>
    </View>
  );

  const handleCreateCase = () => {
    Alert.alert(
      'Criar Novo Caso',
      'Funcionalidade de criação de casos será implementada em breve!',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Text style={styles.headerSubtitle}>Visão geral dos casos</Text>
        </View>

        {/* Cards de Estatísticas */}
        <View style={styles.statsContainer}>
          <StatCard
            title="Total de Casos"
            value={stats.totalCasos}
            icon="folder-outline"
            color="#007AFF"
          />
          <StatCard
            title="Total de Evidências"
            value={stats.totalEvidencias}
            icon="document-text-outline"
            color="#34C759"
          />
          <StatCard
            title="Total de Vítimas"
            value={stats.totalVitimas}
            icon="people-outline"
            color="#FF3B30"
          />
        </View>

        {/* Gráfico de Pizza - Status dos Casos */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Status dos Casos</Text>
          <PieChart
            data={statusData}
            width={screenWidth - 40}
            height={220}
            chartConfig={pieChartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </View>

        {/* Gráfico de Barras - Casos por Mês */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Casos por Mês</Text>
          <BarChart
            data={casosPorMes}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            verticalLabelRotation={0}
            fromZero
            showBarTops
            showValuesOnTopOfBars
          />
        </View>

        {/* Distribuição por Status */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Distribuição por Status</Text>
          <View style={styles.statusContainer}>
            <StatusCard
              title="Em Andamento"
              value={distribuicaoStatus.emAndamento}
              color="#FF6B6B"
              percentage={43}
            />
            <StatusCard
              title="Finalizados"
              value={distribuicaoStatus.finalizados}
              color="#4ECDC4"
              percentage={29}
            />
            <StatusCard
              title="Arquivados"
              value={distribuicaoStatus.arquivados}
              color="#45B7D1"
              percentage={28}
            />
          </View>
        </View>

        {/* Espaço para o botão flutuante */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Botão Flutuante */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleCreateCase}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  statsContainer: {
    padding: 20,
    paddingTop: 10,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statTitle: {
    fontSize: 16,
    color: '#666',
    marginLeft: 12,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  chartContainer: {
    backgroundColor: '#fff',
    margin: 20,
    marginTop: 0,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusCard: {
    flex: 1,
    alignItems: 'center',
    padding: 15,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusTitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  statusValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusPercentage: {
    fontSize: 12,
    color: '#999',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
}); 