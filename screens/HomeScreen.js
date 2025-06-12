import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  useWindowDimensions,
  SafeAreaView,
  Platform,
} from 'react-native';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const { width, height } = useWindowDimensions();
  const [isLandscape, setIsLandscape] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const navigation = useNavigation();

  // Detectar mudanças de orientação e tamanho de tela
  useEffect(() => {
    const checkOrientation = () => {
      setIsLandscape(width > height);
      setIsTablet(width >= 768); // Considera tablet a partir de 768px
    };

    checkOrientation();
  }, [width, height]);

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
      legendFontSize: isTablet ? 14 : 12,
    },
    {
      name: 'Finalizados',
      population: 45,
      color: '#51CF66',
      legendFontColor: '#7F7F7F',
      legendFontSize: isTablet ? 14 : 12,
    },
    {
      name: 'Arquivados',
      population: 44,
      color: '#845EF7',
      legendFontColor: '#7F7F7F',
      legendFontSize: isTablet ? 14 : 12,
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

  // Configurações responsivas para gráficos
  const getChartWidth = () => {
    const containerWidth = width - 40; // Largura do container
    const chartWidth = Math.min(containerWidth, 300); // Máximo de 300px
    return chartWidth;
  };

  const getPieChartWidth = () => {
    // Para o gráfico de pizza, usar uma largura fixa menor para centralizar melhor
    return Math.min(width - 80, 280);
  };

  const getChartHeight = () => {
    if (isTablet) {
      return isLandscape ? 180 : 220;
    }
    return 220;
  };

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
      r: isTablet ? '8' : '6',
      strokeWidth: '2',
      stroke: '#007AFF',
    },
    propsForLabels: {
      fontSize: isTablet ? 14 : 12,
    },
  };

  const pieChartConfig = {
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  };

  const StatCard = ({ title, value, icon, color }) => (
    <View style={[
      styles.statCard, 
      { 
        borderLeftColor: color,
        flex: isTablet ? 1 : undefined,
        marginHorizontal: isTablet ? 8 : 0,
      }
    ]}>
      <View style={[
        styles.statContent,
        isTablet && styles.statContentTablet
      ]}>
        <View style={styles.statHeader}>
          <Ionicons name={icon} size={isTablet ? 28 : 24} color={color} />
          <Text style={[
            styles.statTitle,
            isTablet && styles.statTitleTablet
          ]}>{title}</Text>
        </View>
        <Text style={[
          styles.statValue, 
          { color },
          isTablet && styles.statValueTablet
        ]}>{value}</Text>
      </View>
    </View>
  );

  const handleCreateCase = () => {
    navigation.navigate('CriarCaso');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={isTablet && styles.scrollViewTablet}
      >
        {/* Header */}
        <View style={[
          styles.header,
          isTablet && styles.headerTablet
        ]}>
          <Text style={[
            styles.headerTitle,
            isTablet && styles.headerTitleTablet
          ]}>Dashboard</Text>
          <Text style={[
            styles.headerSubtitle,
            isTablet && styles.headerSubtitleTablet
          ]}>Visão geral dos casos</Text>
        </View>

        {/* Cards de Estatísticas */}
        <View style={[
          styles.statsContainer,
          isTablet && styles.statsContainerTablet
        ]}>
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
          
          <View style={styles.pieChartCard}>
            <PieChart
              data={statusData}
              paddingLeft='50' //gambiarra
              width={200}
              height={200}
              chartConfig={pieChartConfig}
              accessor="population"
              backgroundColor="transparent"
              absolute
              hasLegend={false}
            />
            
            <View style={styles.legendContainer}>
              {statusData.map((item, index) => (
                <View key={index} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                  <View style={styles.legendTextContainer}>
                    <Text style={styles.legendText}>{item.name}</Text>
                    <Text style={[styles.legendNumber, { color: item.color }]}>
                      {item.population} casos
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Gráfico de Barras - Casos por Mês */}
        <View style={[
          styles.chartContainer,
          isTablet && styles.chartContainerTablet
        ]}>
          <Text style={[
            styles.chartTitle,
            isTablet && styles.chartTitleTablet
          ]}>Casos por Mês</Text>
          <BarChart
            
            data={casosPorMes}
            width={getChartWidth()}
            height={getChartHeight()}
            chartConfig={chartConfig}
            verticalLabelRotation={0}
            fromZero
            showBarTops
            showValuesOnTopOfBars
          />
        </View>

        {/* Espaço para o botão flutuante */}
        <View style={{ height: isTablet ? 120 : 100 }} />
      </ScrollView>

      {/* Botão Flutuante */}
      <TouchableOpacity
        style={[
          styles.fab,
          isTablet && styles.fabTablet
        ]}
        onPress={handleCreateCase}
      >
        <Ionicons name="add" size={isTablet ? 36 : 30} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
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
  scrollViewTablet: {
    paddingHorizontal: 20,
  },
  header: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    backgroundColor: '#fff',
  },
  headerTablet: {
    paddingHorizontal: 40,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  headerTitleTablet: {
    fontSize: 36,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  headerSubtitleTablet: {
    fontSize: 20,
  },
  statsContainer: {
    padding: 20,
    paddingTop: 10,
  },
  statsContainerTablet: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
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
  statContentTablet: {
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
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
  statTitleTablet: {
    fontSize: 18,
    marginLeft: 0,
    marginTop: 8,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  statValueTablet: {
    fontSize: 40,
    marginTop: 8,
  },
  chartsContainer: {
    flex: 1,
  },
  chartsContainerLandscape: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
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
  chartContainerTablet: {
    margin: 10,
    padding: 30,
    flex: 1,
    minWidth: 300,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  chartTitleTablet: {
    fontSize: 22,
    marginBottom: 20,
  },
  pieChartCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  legendContainer: {
    marginTop: 20,
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  legendDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  legendTextContainer: {
    flex: 1,
  },
  legendText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    marginBottom: 2,
  },
  legendNumber: {
    fontSize: 14,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 80,
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
  fabTablet: {
    width: 70,
    height: 70,
    borderRadius: 35,
    bottom: Platform.OS === 'ios' ? 120 : 100,
    right: 30,
  },
}); 