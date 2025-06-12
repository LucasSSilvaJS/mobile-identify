import { useState, useEffect, useCallback, useRef } from 'react';
import { relatoriosService } from '../services/api';

export const useRelatorios = () => {
  const [relatorios, setRelatorios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastSync, setLastSync] = useState(null);
  const syncIntervalRef = useRef(null);

  const carregarRelatorios = useCallback(async (forceRefresh = false) => {
    try {
      setError(null);
      setLoading(true);
      const data = await relatoriosService.getRelatorios(forceRefresh);
      setRelatorios(data);
      setLastSync(new Date());
      return data;
    } catch (err) {
      console.error('Erro ao carregar relatórios:', err);
      setError(err.error || 'Erro ao carregar relatórios');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const carregarRelatorioPorId = useCallback(async (id) => {
    try {
      const data = await relatoriosService.getRelatorioById(id);
      return data;
    } catch (err) {
      console.error('Erro ao carregar relatório:', err);
      throw err;
    }
  }, []);

  const criarRelatorio = useCallback(async (relatorioData) => {
    try {
      const novoRelatorio = await relatoriosService.createRelatorio(relatorioData);
      // Recarregar lista após criar
      await carregarRelatorios(true);
      return novoRelatorio;
    } catch (err) {
      console.error('Erro ao criar relatório:', err);
      throw err;
    }
  }, [carregarRelatorios]);

  const atualizarRelatorio = useCallback(async (id, relatorioData) => {
    try {
      const relatorioAtualizado = await relatoriosService.updateRelatorio(id, relatorioData);
      // Recarregar lista após atualizar
      await carregarRelatorios(true);
      return relatorioAtualizado;
    } catch (err) {
      console.error('Erro ao atualizar relatório:', err);
      throw err;
    }
  }, [carregarRelatorios]);

  const excluirRelatorio = useCallback(async (id, userId, casoId) => {
    try {
      await relatoriosService.deleteRelatorio(id, userId, casoId);
      // Recarregar lista após excluir
      await carregarRelatorios(true);
    } catch (err) {
      console.error('Erro ao excluir relatório:', err);
      throw err;
    }
  }, [carregarRelatorios]);

  const gerarRelatorioIA = useCallback(async (casoId, userId) => {
    try {
      const relatorioGerado = await relatoriosService.generateRelatorioWithGemini(casoId, userId);
      // Recarregar lista após gerar
      await carregarRelatorios(true);
      return relatorioGerado;
    } catch (err) {
      console.error('Erro ao gerar relatório com IA:', err);
      throw err;
    }
  }, [carregarRelatorios]);

  // Sincronização automática a cada 30 segundos
  const iniciarSincronizacao = useCallback(() => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
    }
    
    syncIntervalRef.current = setInterval(async () => {
      try {
        await carregarRelatorios(false); // Não forçar refresh
      } catch (err) {
        console.log('Erro na sincronização automática:', err);
      }
    }, 30000); // 30 segundos
  }, [carregarRelatorios]);

  const pararSincronizacao = useCallback(() => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
      syncIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    carregarRelatorios();
    iniciarSincronizacao();

    return () => {
      pararSincronizacao();
    };
  }, [carregarRelatorios, iniciarSincronizacao, pararSincronizacao]);

  return {
    relatorios,
    loading,
    error,
    lastSync,
    carregarRelatorios,
    carregarRelatorioPorId,
    criarRelatorio,
    atualizarRelatorio,
    excluirRelatorio,
    gerarRelatorioIA,
    iniciarSincronizacao,
    pararSincronizacao,
  };
}; 