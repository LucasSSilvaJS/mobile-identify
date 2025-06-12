import { useState, useCallback, useEffect } from 'react';
import { evidenciasService } from '../services/api';

// Cache local para evidências
let evidenciasCache = {
  data: null,
  timestamp: null,
  expiresIn: 5 * 60 * 1000 // 5 minutos
};

export const useEvidencias = () => {
  const [evidencias, setEvidencias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Buscar evidências com cache
  const getEvidencias = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      // Verificar cache
      const now = Date.now();
      if (!forceRefresh && 
          evidenciasCache.data && 
          evidenciasCache.timestamp && 
          (now - evidenciasCache.timestamp) < evidenciasCache.expiresIn) {
        console.log('Retornando evidências do cache');
        setEvidencias(evidenciasCache.data);
        return evidenciasCache.data;
      }

      const data = await evidenciasService.getEvidencias();
      
      // Atualizar cache
      evidenciasCache.data = data;
      evidenciasCache.timestamp = now;
      
      setEvidencias(data);
      return data;
    } catch (err) {
      console.error('Erro ao buscar evidências:', err);
      setError(err.error || 'Erro ao buscar evidências');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar evidência por ID
  const getEvidenciaById = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await evidenciasService.getEvidenciaById(id);
      return data;
    } catch (err) {
      console.error('Erro ao buscar evidência:', err);
      setError(err.error || 'Erro ao buscar evidência');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Criar evidência
  const criarEvidencia = useCallback(async (evidenciaData) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await evidenciasService.createEvidencia(evidenciaData);
      
      // Limpar cache após criar nova evidência
      evidenciasCache.data = null;
      evidenciasCache.timestamp = null;
      
      // Atualizar lista local
      setEvidencias(prev => [...prev, data.evidencia]);
      
      return data;
    } catch (err) {
      console.error('Erro ao criar evidência:', err);
      setError(err.error || 'Erro ao criar evidência');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Atualizar evidência
  const atualizarEvidencia = useCallback(async (id, evidenciaData) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await evidenciasService.updateEvidencia(id, evidenciaData);
      
      // Limpar cache após atualizar evidência
      evidenciasCache.data = null;
      evidenciasCache.timestamp = null;
      
      // Atualizar lista local
      setEvidencias(prev => 
        prev.map(evidencia => 
          evidencia._id === id ? data.evidencia : evidencia
        )
      );
      
      return data;
    } catch (err) {
      console.error('Erro ao atualizar evidência:', err);
      setError(err.error || 'Erro ao atualizar evidência');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Excluir evidência
  const excluirEvidencia = useCallback(async (id, userId, casoId) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await evidenciasService.deleteEvidencia(id, userId, casoId);
      
      // Limpar cache após excluir evidência
      evidenciasCache.data = null;
      evidenciasCache.timestamp = null;
      
      // Atualizar lista local
      setEvidencias(prev => prev.filter(evidencia => evidencia._id !== id));
      
      return data;
    } catch (err) {
      console.error('Erro ao excluir evidência:', err);
      setError(err.error || 'Erro ao excluir evidência');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Adicionar imagem à evidência
  const adicionarImagem = useCallback(async (evidenciaId, imagemId) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await evidenciasService.addImagemToEvidencia(evidenciaId, imagemId);
      
      // Atualizar evidência na lista local
      setEvidencias(prev => 
        prev.map(evidencia => 
          evidencia._id === evidenciaId ? data.evidencia : evidencia
        )
      );
      
      return data;
    } catch (err) {
      console.error('Erro ao adicionar imagem:', err);
      setError(err.error || 'Erro ao adicionar imagem');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Remover imagem da evidência
  const removerImagem = useCallback(async (evidenciaId, imagemId) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await evidenciasService.removeImagemFromEvidencia(evidenciaId, imagemId);
      
      // Atualizar evidência na lista local
      setEvidencias(prev => 
        prev.map(evidencia => 
          evidencia._id === evidenciaId ? data.evidencia : evidencia
        )
      );
      
      return data;
    } catch (err) {
      console.error('Erro ao remover imagem:', err);
      setError(err.error || 'Erro ao remover imagem');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Adicionar texto à evidência
  const adicionarTexto = useCallback(async (evidenciaId, textoId) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await evidenciasService.addTextoToEvidencia(evidenciaId, textoId);
      
      // Atualizar evidência na lista local
      setEvidencias(prev => 
        prev.map(evidencia => 
          evidencia._id === evidenciaId ? data.evidencia : evidencia
        )
      );
      
      return data;
    } catch (err) {
      console.error('Erro ao adicionar texto:', err);
      setError(err.error || 'Erro ao adicionar texto');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Remover texto da evidência
  const removerTexto = useCallback(async (evidenciaId, textoId) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await evidenciasService.removeTextoFromEvidencia(evidenciaId, textoId);
      
      // Atualizar evidência na lista local
      setEvidencias(prev => 
        prev.map(evidencia => 
          evidencia._id === evidenciaId ? data.evidencia : evidencia
        )
      );
      
      return data;
    } catch (err) {
      console.error('Erro ao remover texto:', err);
      setError(err.error || 'Erro ao remover texto');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Adicionar laudo à evidência
  const adicionarLaudo = useCallback(async (evidenciaId, laudoId) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await evidenciasService.addLaudoToEvidencia(evidenciaId, laudoId);
      
      // Atualizar evidência na lista local
      setEvidencias(prev => 
        prev.map(evidencia => 
          evidencia._id === evidenciaId ? data.evidencia : evidencia
        )
      );
      
      return data;
    } catch (err) {
      console.error('Erro ao adicionar laudo:', err);
      setError(err.error || 'Erro ao adicionar laudo');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Remover laudo da evidência
  const removerLaudo = useCallback(async (evidenciaId) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await evidenciasService.removeLaudoFromEvidencia(evidenciaId);
      
      // Atualizar evidência na lista local
      setEvidencias(prev => 
        prev.map(evidencia => 
          evidencia._id === evidenciaId ? data.evidencia : evidencia
        )
      );
      
      return data;
    } catch (err) {
      console.error('Erro ao remover laudo:', err);
      setError(err.error || 'Erro ao remover laudo');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Limpar cache
  const limparCache = useCallback(() => {
    evidenciasCache = {
      data: null,
      timestamp: null,
      expiresIn: 5 * 60 * 1000
    };
  }, []);

  // Limpar erro
  const limparErro = useCallback(() => {
    setError(null);
  }, []);

  return {
    evidencias,
    loading,
    error,
    getEvidencias,
    getEvidenciaById,
    criarEvidencia,
    atualizarEvidencia,
    excluirEvidencia,
    adicionarImagem,
    removerImagem,
    adicionarTexto,
    removerTexto,
    adicionarLaudo,
    removerLaudo,
    limparCache,
    limparErro,
  };
}; 