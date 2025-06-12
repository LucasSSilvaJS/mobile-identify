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
      console.log('Interceptor - Token encontrado:', !!token);
      console.log('Interceptor - Token completo:', token);
      console.log('Interceptor - URL da requisição:', config.url);
      console.log('Interceptor - Método:', config.method);
      
      if (token && token.trim() !== '') {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Interceptor - Token adicionado ao header:', `Bearer ${token.substring(0, 20)}...`);
      } else {
        console.log('Interceptor - Nenhum token encontrado ou token vazio');
        // Verificar se há outros tokens salvos
        const allKeys = await AsyncStorage.getAllKeys();
        console.log('Interceptor - Todas as chaves no AsyncStorage:', allKeys);
      }
      
      console.log('Interceptor - Headers finais:', config.headers);
      return config;
    } catch (error) {
      console.error('Interceptor - Erro ao recuperar token:', error);
      return config;
    }
  },
  (error) => {
    console.error('Interceptor - Erro na requisição:', error);
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
  (response) => {
    console.log('Interceptor - Resposta recebida:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    console.error('Interceptor - Erro na resposta:', error.response?.status, error.response?.config?.url);
    console.error('Interceptor - Dados do erro:', error.response?.data);
    
    if (error.response?.status === 401) {
      console.log('Interceptor - Token expirado ou inválido, removendo dados de autenticação');
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
      console.log('Login - Iniciando login para:', email);
      const response = await api.post('/auth/login', {
        email,
        password,
      });
      
      console.log('Login - Resposta completa:', response.data);
      console.log('Login - Status da resposta:', response.status);
      
      // Extrair dados da estrutura correta da resposta
      let token = null;
      let userData = null;
      
      if (response.data.user && response.data.user.token) {
        token = response.data.user.token;
        userData = response.data.user;
        console.log('Login - Token encontrado em response.data.user.token');
        console.log('Login - ID do usuário encontrado em response.data.user.id:', userData.id);
      } else {
        console.log('Login - Estrutura da resposta não reconhecida');
        console.log('Login - Chaves disponíveis:', Object.keys(response.data));
      }
      
      console.log('Login - Token extraído:', !!token);
      console.log('Login - Token completo:', token);
      
      if (token) {
        // Salvar token e dados do usuário
        await AsyncStorage.setItem('@auth_token', token);
        await AsyncStorage.setItem('@user_data', JSON.stringify(userData));
        
        console.log('Login - Token salvo no AsyncStorage');
        console.log('Login - Dados do usuário salvos:', userData);
        console.log('Login - ID do usuário:', userData.id);
        
        // Verificar se foi salvo corretamente
        const savedToken = await AsyncStorage.getItem('@auth_token');
        const savedUserData = await AsyncStorage.getItem('@user_data');
        console.log('Login - Token verificado após salvar:', !!savedToken);
        console.log('Login - Token verificado completo:', savedToken);
        console.log('Login - Dados do usuário verificados após salvar:', savedUserData);
        
        if (savedUserData) {
          const parsedSavedUserData = JSON.parse(savedUserData);
          console.log('Login - Dados do usuário parseados após salvar:', parsedSavedUserData);
          console.log('Login - ID do usuário após salvar:', parsedSavedUserData.id);
        }
      } else {
        console.log('Login - ERRO: Nenhum token encontrado na resposta');
      }
      
      return response.data;
    } catch (error) {
      console.error('Login - Erro:', error.response?.data || error.message);
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
      console.log('getUserData - Iniciando recuperação dos dados do usuário');
      const userData = await AsyncStorage.getItem('@user_data');
      console.log('getUserData - Dados brutos recuperados:', userData);
      
      if (userData) {
        const parsedUserData = JSON.parse(userData);
        console.log('getUserData - Dados parseados:', parsedUserData);
        console.log('getUserData - ID do usuário:', parsedUserData._id);
        return parsedUserData;
      } else {
        console.log('getUserData - Nenhum dado de usuário encontrado');
        return null;
      }
    } catch (error) {
      console.error('getUserData - Erro ao recuperar dados do usuário:', error);
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

  // Criar caso
  createCaso: async (casoData) => {
    try {
      console.log('createCaso - Iniciando criação do caso');
      console.log('createCaso - Dados a serem enviados:', casoData);
      
      const response = await api.post('/casos', casoData);
      
      console.log('createCaso - Resposta recebida:', response.status);
      console.log('createCaso - Dados retornados:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('createCaso - Erro:', error.response?.data || error.message);
      console.error('createCaso - Status do erro:', error.response?.status);
      throw error.response?.data || { error: 'Erro ao criar caso' };
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