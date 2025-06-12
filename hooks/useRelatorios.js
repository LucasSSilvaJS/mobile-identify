import { useState, useEffect, useCallback } from 'react';
import { relatoriosService } from '../services/api';

export const useRelatorios = () => {
  const [relatorios, setRelatorios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const carregarRelatorios = useCallback(async (forceRefresh = false) => {
    try {
      setError(null);
      setLoading(true);
      const data = await relatoriosService.getRelatorios(forceRefresh);
      setRelatorios(data);
      return data;
    } catch (err) {
      console.error('Erro ao carregar relatórios:', err);
      setError(err.error || 'Erro ao carregar relatórios');
      throw err;
    } finally {
      setLoading(false);
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

  useEffect(() => {
    carregarRelatorios();
  }, [carregarRelatorios]);

  return {
    relatorios,
    loading,
    error,
    carregarRelatorios,
    criarRelatorio,
    atualizarRelatorio,
    excluirRelatorio,
    gerarRelatorioIA,
  };
}; 