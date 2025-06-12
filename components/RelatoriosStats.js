import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function RelatoriosStats({ relatorios }) {
  const getStats = () => {
    const total = relatorios.length;
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const inicioSemana = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);

    const relatoriosHoje = relatorios.filter(relatorio => {
      const dataRelatorio = new Date(relatorio.createdAt);
      return dataRelatorio.toDateString() === hoje.toDateString();
    }).length;

    const relatoriosSemana = relatorios.filter(relatorio => {
      const dataRelatorio = new Date(relatorio.createdAt);
      return dataRelatorio >= inicioSemana;
    }).length;

    const relatoriosMes = relatorios.filter(relatorio => {
      const dataRelatorio = new Date(relatorio.createdAt);
      return dataRelatorio >= inicioMes;
    }).length;

    return {
      total,
      hoje: relatoriosHoje,
      semana: relatoriosSemana,
      mes: relatoriosMes
    };
  };

  const stats = getStats();

  return (
    <View style={styles.container}>
      <View style={styles.statCard}>
        <View style={styles.statIcon}>
          <Ionicons name="document-text-outline" size={24} color="#3B82F6" />
        </View>
        <View style={styles.statContent}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      <View style={styles.statCard}>
        <View style={styles.statIcon}>
          <Ionicons name="today-outline" size={24} color="#10B981" />
        </View>
        <View style={styles.statContent}>
          <Text style={styles.statValue}>{stats.hoje}</Text>
          <Text style={styles.statLabel}>Hoje</Text>
        </View>
      </View>

      <View style={styles.statCard}>
        <View style={styles.statIcon}>
          <Ionicons name="calendar-outline" size={24} color="#F59E0B" />
        </View>
        <View style={styles.statContent}>
          <Text style={styles.statValue}>{stats.semana}</Text>
          <Text style={styles.statLabel}>Semana</Text>
        </View>
      </View>

      <View style={styles.statCard}>
        <View style={styles.statIcon}>
          <Ionicons name="calendar-clear-outline" size={24} color="#8B5CF6" />
        </View>
        <View style={styles.statContent}>
          <Text style={styles.statValue}>{stats.mes}</Text>
          <Text style={styles.statLabel}>Mês</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    marginBottom: 8,
  },
  statContent: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
}); 