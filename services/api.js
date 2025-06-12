import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuração base do axios
const api = axios.create({
  baseURL: 'https://backend-pi-26cz.onrender.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('@auth_token');
      
      if (token && token.trim() !== '') {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      return config;
    } catch (error) {
      console.error('Erro ao recuperar token:', error);
      return config;
    }
  },
  (error) => {
    console.error('Erro na requisição:', error);
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      await AsyncStorage.removeItem('@auth_token');
      await AsyncStorage.removeItem('@user_data');
    }
    return Promise.reject(error);
  }
);

// Funções de autenticação
export const authService = {
  // Login
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });
      
      // Extrair dados da estrutura correta da resposta
      let token = null;
      let userData = null;
      
      if (response.data.user && response.data.user.token) {
        token = response.data.user.token;
        userData = response.data.user;
      }
      
      if (token) {
        // Salvar token e dados do usuário
        await AsyncStorage.setItem('@auth_token', token);
        await AsyncStorage.setItem('@user_data', JSON.stringify(userData));
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erro de conexão' };
    }
  },

  // Logout
  logout: async () => {
    try {
      await AsyncStorage.removeItem('@auth_token');
      await AsyncStorage.removeItem('@user_data');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  },

  // Verificar se está logado
  isAuthenticated: async () => {
    try {
      const token = await AsyncStorage.getItem('@auth_token');
      return !!token;
    } catch (error) {
      return false;
    }
  },

  // Obter dados do usuário
  getUserData: async () => {
    try {
      const userData = await AsyncStorage.getItem('@user_data');
      
      if (userData) {
        return JSON.parse(userData);
      } else {
        return null;
      }
    } catch (error) {
      console.error('Erro ao recuperar dados do usuário:', error);
      return null;
    }
  },
};

// Funções para casos
export const casosService = {
  // Listar casos com filtros e paginação
  getCasos: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Adicionar parâmetros de filtro
      if (params.titulo) queryParams.append('titulo', params.titulo);
      if (params.descricao) queryParams.append('descricao', params.descricao);
      if (params.status) queryParams.append('status', params.status);
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);

      const response = await api.get(`/casos?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erro ao buscar casos' };
    }
  },

  // Obter caso por ID
  getCasoById: async (id) => {
    try {
      const response = await api.get(`/casos/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erro ao buscar caso' };
    }
  },

  // Criar caso
  createCaso: async (casoData) => {
    try {
      const response = await api.post('/casos', casoData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erro ao criar caso' };
    }
  },

  // Atualizar caso
  updateCaso: async (id, casoData) => {
    try {
      const response = await api.put(`/casos/${id}`, casoData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erro ao atualizar caso' };
    }
  },

  // Excluir caso
  deleteCaso: async (id) => {
    try {
      const response = await api.delete(`/casos/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erro ao excluir caso' };
    }
  },
};

// Funções para vítimas
export const vitimasService = {
  // Buscar todas as vítimas
  getVitimas: async () => {
    try {
      const response = await api.get('/vitimas');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar vítimas:', error);
      throw error.response?.data || { error: 'Erro ao buscar vítimas' };
    }
  },

  // Buscar vítima por ID
  getVitimaById: async (id) => {
    try {
      const response = await api.get(`/vitimas/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar vítima:', error);
      throw error.response?.data || { error: 'Erro ao buscar vítima' };
    }
  },

  // Criar nova vítima
  createVitima: async (vitimaData) => {
    try {
      const response = await api.post('/vitimas', vitimaData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar vítima:', error);
      throw error.response?.data || { error: 'Erro ao criar vítima' };
    }
  },

  // Atualizar vítima
  updateVitima: async (id, vitimaData) => {
    try {
      const response = await api.put(`/vitimas/${id}`, vitimaData);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar vítima:', error);
      throw error.response?.data || { error: 'Erro ao atualizar vítima' };
    }
  },

  // Excluir vítima
  deleteVitima: async (id, idCaso) => {
    try {
      const response = await api.delete(`/vitimas/${id}`, {
        data: { idCaso }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao excluir vítima:', error);
      throw error.response?.data || { error: 'Erro ao excluir vítima' };
    }
  },

  // Adicionar odontograma à vítima
  addOdontogramaToVitima: async (id, odontogramaId) => {
    try {
      const response = await api.post(`/vitimas/${id}/odontograma`, {
        odontogramaId
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao adicionar odontograma:', error);
      throw error.response?.data || { error: 'Erro ao adicionar odontograma' };
    }
  },

  // Remover odontograma da vítima
  removeOdontogramaFromVitima: async (id, odontogramaId) => {
    try {
      const response = await api.delete(`/vitimas/${id}/odontograma`, {
        data: { odontogramaId }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao remover odontograma:', error);
      throw error.response?.data || { error: 'Erro ao remover odontograma' };
    }
  },
};

// Funções para evidências
export const evidenciasService = {
  // Listar evidências
  getEvidencias: async () => {
    try {
      const response = await api.get('/evidencias');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erro ao buscar evidências' };
    }
  },

  // Criar evidência
  createEvidencia: async (evidenciaData) => {
    try {
      const response = await api.post('/evidencias', evidenciaData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erro ao criar evidência' };
    }
  },
};

// Funções para dashboard
export const dashboardService = {
  // Obter estatísticas gerais do dashboard
  getEstatisticasGerais: async () => {
    try {
      const response = await api.get('/dashboard/estatisticas-gerais');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erro ao buscar estatísticas do dashboard' };
    }
  },
};

// Cache local para relatórios
let relatoriosCache = {
  data: null,
  timestamp: null,
  expiresIn: 5 * 60 * 1000 // 5 minutos
};

// Funções para relatórios
export const relatoriosService = {
  // Listar relatórios com cache
  getRelatorios: async (forceRefresh = false) => {
    try {
      // Verificar cache
      const now = Date.now();
      if (!forceRefresh && 
          relatoriosCache.data && 
          relatoriosCache.timestamp && 
          (now - relatoriosCache.timestamp) < relatoriosCache.expiresIn) {
        console.log('Retornando relatórios do cache');
        return relatoriosCache.data;
      }

      const response = await api.get('/relatorios');
      
      // Atualizar cache
      relatoriosCache.data = response.data;
      relatoriosCache.timestamp = now;
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erro ao buscar relatórios' };
    }
  },

  // Limpar cache
  clearCache: () => {
    relatoriosCache = {
      data: null,
      timestamp: null,
      expiresIn: 5 * 60 * 1000
    };
  },

  // Obter relatório por ID
  getRelatorioById: async (id) => {
    try {
      const response = await api.get(`/relatorios/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erro ao buscar relatório' };
    }
  },

  // Criar relatório
  createRelatorio: async (relatorioData) => {
    try {
      const response = await api.post('/relatorios', relatorioData);
      
      // Limpar cache após criar novo relatório
      relatoriosService.clearCache();
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erro ao criar relatório' };
    }
  },

  // Atualizar relatório
  updateRelatorio: async (id, relatorioData) => {
    try {
      const response = await api.put(`/relatorios/${id}`, relatorioData);
      
      // Limpar cache após atualizar relatório
      relatoriosService.clearCache();
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erro ao atualizar relatório' };
    }
  },

  // Excluir relatório
  deleteRelatorio: async (id, userId, casoId) => {
    try {
      const response = await api.delete(`/relatorios/${id}`, {
        data: { userId, casoId }
      });
      
      // Limpar cache após excluir relatório
      relatoriosService.clearCache();
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erro ao excluir relatório' };
    }
  },

  // Gerar relatório com Gemini
  generateRelatorioWithGemini: async (casoId, userId) => {
    try {
      const response = await api.post('/relatorios/generate', {
        casoId,
        userId
      });
      
      // Limpar cache após gerar relatório
      relatoriosService.clearCache();
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erro ao gerar relatório com IA' };
    }
  },
};

export default api; 