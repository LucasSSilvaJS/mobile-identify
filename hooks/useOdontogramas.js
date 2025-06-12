import { useState, useEffect, useCallback, useRef } from 'react';
import { odontogramasService } from '../services/api';

export const useOdontogramas = () => {
  const [odontogramas, setOdontogramas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastSync, setLastSync] = useState(null);
  const syncIntervalRef = useRef(null);

  const carregarOdontogramas = useCallback(async (forceRefresh = false) => {
    try {
      setError(null);
      setLoading(true);
      const data = await odontogramasService.getOdontogramas();
      setOdontogramas(data);
      setLastSync(new Date());
      return data;
    } catch (err) {
      console.error('Erro ao carregar odontogramas:', err);
      setError(err.error || 'Erro ao carregar odontogramas');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const carregarOdontogramaPorId = useCallback(async (id) => {
    try {
      const data = await odontogramasService.getOdontogramaById(id);
      return data;
    } catch (err) {
      console.error('Erro ao carregar odontograma:', err);
      throw err;
    }
  }, []);

  const criarOdontograma = useCallback(async (odontogramaData) => {
    try {
      const novoOdontograma = await odontogramasService.createOdontograma(odontogramaData);
      // Recarregar lista após criar
      await carregarOdontogramas(true);
      return novoOdontograma;
    } catch (err) {
      console.error('Erro ao criar odontograma:', err);
      throw err;
    }
  }, [carregarOdontogramas]);

  const atualizarOdontograma = useCallback(async (id, odontogramaData) => {
    try {
      const odontogramaAtualizado = await odontogramasService.updateOdontograma(id, odontogramaData);
      // Recarregar lista após atualizar
      await carregarOdontogramas(true);
      return odontogramaAtualizado;
    } catch (err) {
      console.error('Erro ao atualizar odontograma:', err);
      throw err;
    }
  }, [carregarOdontogramas]);

  const excluirOdontograma = useCallback(async (id, idVitima) => {
    try {
      await odontogramasService.deleteOdontograma(id, idVitima);
      // Recarregar lista após excluir
      await carregarOdontogramas(true);
    } catch (err) {
      console.error('Erro ao excluir odontograma:', err);
      throw err;
    }
  }, [carregarOdontogramas]);

  // Sincronização automática a cada 30 segundos
  const iniciarSincronizacao = useCallback(() => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
    }
    
    syncIntervalRef.current = setInterval(async () => {
      try {
        await carregarOdontogramas(false); // Não forçar refresh
      } catch (err) {
        console.log('Erro na sincronização automática:', err);
      }
    }, 30000); // 30 segundos
  }, [carregarOdontogramas]);

  const pararSincronizacao = useCallback(() => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
      syncIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    carregarOdontogramas();
    iniciarSincronizacao();

    return () => {
      pararSincronizacao();
    };
  }, [carregarOdontogramas, iniciarSincronizacao, pararSincronizacao]);

  return {
    odontogramas,
    loading,
    error,
    lastSync,
    carregarOdontogramas,
    carregarOdontogramaPorId,
    criarOdontograma,
    atualizarOdontograma,
    excluirOdontograma,
    iniciarSincronizacao,
    pararSincronizacao,
  };
}; 