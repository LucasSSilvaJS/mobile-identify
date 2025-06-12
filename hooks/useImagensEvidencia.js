import { useState, useCallback, useRef } from 'react';
import { imagensEvidenciaService } from '../services/api';

// Cache local para imagens de evidências
let imagensCache = {
  data: {},
  timestamp: {},
  expiresIn: 5 * 60 * 1000 // 5 minutos
};

export const useImagensEvidencia = () => {
  const [imagens, setImagens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const loadingRef = useRef(false);

  // Buscar imagens de uma evidência com cache
  const getImagensEvidencia = useCallback(async (evidenciaId, forceRefresh = false) => {
    if (!evidenciaId || loadingRef.current) return;
    
    try {
      loadingRef.current = true;
      setLoading(true);
      setError(null);

      // Verificar cache
      const now = Date.now();
      if (!forceRefresh && 
          imagensCache.data[evidenciaId] && 
          imagensCache.timestamp[evidenciaId] && 
          (now - imagensCache.timestamp[evidenciaId]) < imagensCache.expiresIn) {
        console.log('Retornando imagens do cache para evidência:', evidenciaId);
        setImagens(imagensCache.data[evidenciaId]);
        return imagensCache.data[evidenciaId];
      }

      const data = await imagensEvidenciaService.getImagensEvidencia(evidenciaId);
      
      // Atualizar cache
      imagensCache.data[evidenciaId] = data;
      imagensCache.timestamp[evidenciaId] = now;
      
      setImagens(data);
      return data;
    } catch (err) {
      console.error('Erro ao buscar imagens da evidência:', err);
      setError(err.error || 'Erro ao buscar imagens da evidência');
      throw err;
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []);

  // Buscar imagem específica por ID
  const getImagemEvidenciaById = useCallback(async (evidenciaId, imagemId) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await imagensEvidenciaService.getImagemEvidenciaById(evidenciaId, imagemId);
      return data;
    } catch (err) {
      console.error('Erro ao buscar imagem da evidência:', err);
      setError(err.error || 'Erro ao buscar imagem da evidência');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Criar nova imagem para evidência
  const criarImagemEvidencia = useCallback(async (evidenciaId, formData) => {
    if (!evidenciaId || loadingRef.current) return;
    
    try {
      loadingRef.current = true;
      setLoading(true);
      setError(null);
      
      const data = await imagensEvidenciaService.createImagemEvidencia(evidenciaId, formData);
      
      // Limpar cache da evidência após criar nova imagem
      delete imagensCache.data[evidenciaId];
      delete imagensCache.timestamp[evidenciaId];
      
      // Atualizar lista local
      setImagens(prev => [...prev, data]);
      
      return data;
    } catch (err) {
      console.error('Erro ao criar imagem da evidência:', err);
      setError(err.error || 'Erro ao criar imagem da evidência');
      throw err;
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []);

  // Atualizar imagem de evidência
  const atualizarImagemEvidencia = useCallback(async (evidenciaId, imagemId, formData) => {
    if (!evidenciaId || !imagemId || loadingRef.current) return;
    
    try {
      loadingRef.current = true;
      setLoading(true);
      setError(null);
      
      const data = await imagensEvidenciaService.updateImagemEvidencia(evidenciaId, imagemId, formData);
      
      // Limpar cache da evidência após atualizar imagem
      delete imagensCache.data[evidenciaId];
      delete imagensCache.timestamp[evidenciaId];
      
      // Atualizar lista local
      setImagens(prev => 
        prev.map(imagem => 
          imagem._id === imagemId ? data : imagem
        )
      );
      
      return data;
    } catch (err) {
      console.error('Erro ao atualizar imagem da evidência:', err);
      setError(err.error || 'Erro ao atualizar imagem da evidência');
      throw err;
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []);

  // Excluir imagem de evidência
  const excluirImagemEvidencia = useCallback(async (evidenciaId, imagemId) => {
    if (!evidenciaId || !imagemId || loadingRef.current) return;
    
    try {
      loadingRef.current = true;
      setLoading(true);
      setError(null);
      
      const data = await imagensEvidenciaService.deleteImagemEvidencia(evidenciaId, imagemId);
      
      // Limpar cache da evidência após excluir imagem
      delete imagensCache.data[evidenciaId];
      delete imagensCache.timestamp[evidenciaId];
      
      // Atualizar lista local
      setImagens(prev => prev.filter(imagem => imagem._id !== imagemId));
      
      return data;
    } catch (err) {
      console.error('Erro ao excluir imagem da evidência:', err);
      setError(err.error || 'Erro ao excluir imagem da evidência');
      throw err;
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []);

  // Limpar cache de uma evidência específica
  const limparCacheEvidencia = useCallback((evidenciaId) => {
    delete imagensCache.data[evidenciaId];
    delete imagensCache.timestamp[evidenciaId];
  }, []);

  // Limpar todo o cache
  const limparCache = useCallback(() => {
    imagensCache = {
      data: {},
      timestamp: {},
      expiresIn: 5 * 60 * 1000
    };
  }, []);

  // Limpar erro
  const limparErro = useCallback(() => {
    setError(null);
  }, []);

  return {
    imagens,
    loading,
    error,
    getImagensEvidencia,
    getImagemEvidenciaById,
    criarImagemEvidencia,
    atualizarImagemEvidencia,
    excluirImagemEvidencia,
    limparCacheEvidencia,
    limparCache,
    limparErro,
  };
}; 