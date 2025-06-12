import { useState, useEffect, useCallback, useRef } from 'react';
import { vitimasService } from '../services/api';

export const useVitimas = () => {
  const [vitimas, setVitimas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastSync, setLastSync] = useState(null);
  const syncIntervalRef = useRef(null);

  const carregarVitimas = useCallback(async (forceRefresh = false) => {
    try {
      setError(null);
      setLoading(true);
      const data = await vitimasService.getVitimas();
      setVitimas(data);
      setLastSync(new Date());
      return data;
    } catch (err) {
      console.error('Erro ao carregar vítimas:', err);
      setError(err.error || 'Erro ao carregar vítimas');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const carregarVitimaPorId = useCallback(async (id) => {
    try {
      const data = await vitimasService.getVitimaById(id);
      return data;
    } catch (err) {
      console.error('Erro ao carregar vítima:', err);
      throw err;
    }
  }, []);

  const criarVitima = useCallback(async (vitimaData) => {
    try {
      const novaVitima = await vitimasService.createVitima(vitimaData);
      // Recarregar lista após criar
      await carregarVitimas(true);
      return novaVitima;
    } catch (err) {
      console.error('Erro ao criar vítima:', err);
      throw err;
    }
  }, [carregarVitimas]);

  const atualizarVitima = useCallback(async (id, vitimaData) => {
    try {
      const vitimaAtualizada = await vitimasService.updateVitima(id, vitimaData);
      // Recarregar lista após atualizar
      await carregarVitimas(true);
      return vitimaAtualizada;
    } catch (err) {
      console.error('Erro ao atualizar vítima:', err);
      throw err;
    }
  }, [carregarVitimas]);

  const excluirVitima = useCallback(async (id, idCaso) => {
    try {
      await vitimasService.deleteVitima(id, idCaso);
      // Recarregar lista após excluir
      await carregarVitimas(true);
    } catch (err) {
      console.error('Erro ao excluir vítima:', err);
      throw err;
    }
  }, [carregarVitimas]);

  const adicionarOdontograma = useCallback(async (id, odontogramaId) => {
    try {
      const vitimaAtualizada = await vitimasService.addOdontogramaToVitima(id, odontogramaId);
      // Recarregar lista após adicionar
      await carregarVitimas(true);
      return vitimaAtualizada;
    } catch (err) {
      console.error('Erro ao adicionar odontograma:', err);
      throw err;
    }
  }, [carregarVitimas]);

  const removerOdontograma = useCallback(async (id, odontogramaId) => {
    try {
      const vitimaAtualizada = await vitimasService.removeOdontogramaFromVitima(id, odontogramaId);
      // Recarregar lista após remover
      await carregarVitimas(true);
      return vitimaAtualizada;
    } catch (err) {
      console.error('Erro ao remover odontograma:', err);
      throw err;
    }
  }, [carregarVitimas]);

  // Sincronização automática a cada 30 segundos
  const iniciarSincronizacao = useCallback(() => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
    }
    
    syncIntervalRef.current = setInterval(async () => {
      try {
        await carregarVitimas(false); // Não forçar refresh
      } catch (err) {
        console.log('Erro na sincronização automática:', err);
      }
    }, 30000); // 30 segundos
  }, [carregarVitimas]);

  const pararSincronizacao = useCallback(() => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
      syncIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    carregarVitimas();
    iniciarSincronizacao();

    return () => {
      pararSincronizacao();
    };
  }, [carregarVitimas, iniciarSincronizacao, pararSincronizacao]);

  return {
    vitimas,
    loading,
    error,
    lastSync,
    carregarVitimas,
    carregarVitimaPorId,
    criarVitima,
    atualizarVitima,
    excluirVitima,
    adicionarOdontograma,
    removerOdontograma,
    iniciarSincronizacao,
    pararSincronizacao,
  };
}; 