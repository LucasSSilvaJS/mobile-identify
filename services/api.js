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
  // Listar vítimas
  getVitimas: async () => {
    try {
      const response = await api.get('/vitimas');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erro ao buscar vítimas' };
    }
  },

  // Criar vítima
  createVitima: async (vitimaData) => {
    try {
      const response = await api.post('/vitimas', vitimaData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erro ao criar vítima' };
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

export default api; 