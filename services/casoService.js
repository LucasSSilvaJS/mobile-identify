import { API_BASE_URL } from '../config/api';

// Função para fazer requisições HTTP com autenticação
const makeRequest = async (endpoint, options = {}, token = null) => {
  const authToken = token;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(authToken && { Authorization: `Bearer ${authToken}` }),
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  const fullUrl = `${API_BASE_URL}${endpoint}`;
  
  console.log('🌐 Requisição HTTP:', {
    url: fullUrl,
    method: options.method || 'GET',
    headers: config.headers,
    hasToken: !!authToken,
    body: options.body ? JSON.parse(options.body) : undefined
  });

  try {
    const response = await fetch(fullUrl, config);
    
    console.log('📡 Resposta HTTP:', {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
      }
      
      console.error('❌ Erro na resposta:', errorData);
      throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Dados recebidos:', data);
    return data;
  } catch (error) {
    console.error('❌ Erro na requisição:', {
      message: error.message,
      stack: error.stack,
      url: fullUrl,
      config: config
    });
    
    // Melhorar mensagens de erro
    if (error.message.includes('Network request failed')) {
      throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
    } else if (error.message.includes('timeout')) {
      throw new Error('Tempo limite excedido. Tente novamente.');
    } else {
      throw error;
    }
  }
};

// Serviços para casos
export const casoService = {
  // Obter um caso específico por ID
  getCasoById: async (id, token = null) => {
    console.log('🔍 Buscando caso por ID:', id);
    if (!id) {
      throw new Error('ID do caso é obrigatório');
    }
    return makeRequest(`/casos/${id}`, {}, token);
  },

  // Atualizar um caso
  updateCaso: async (id, dados, token = null) => {
    console.log('✏️ Atualizando caso:', id, dados);
    if (!id) {
      throw new Error('ID do caso é obrigatório');
    }
    return makeRequest(`/casos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dados),
    }, token);
  },

  // Excluir um caso
  deleteCaso: async (id, userId, token = null) => {
    console.log('🗑️ Excluindo caso:', id, 'userId:', userId);
    if (!id) {
      throw new Error('ID do caso é obrigatório');
    }
    if (!userId) {
      throw new Error('ID do usuário é obrigatório');
    }
    return makeRequest(`/casos/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({ userId }),
    }, token);
  },

  // Listar todos os casos
  getCasos: async (filtros = {}, token = null) => {
    console.log('📋 Buscando casos com filtros:', filtros);
    const queryParams = new URLSearchParams(filtros).toString();
    return makeRequest(`/casos?${queryParams}`, {}, token);
  },

  // Criar um novo caso
  createCaso: async (dados, token = null) => {
    console.log('➕ Criando novo caso:', dados);
    return makeRequest('/casos', {
      method: 'POST',
      body: JSON.stringify(dados),
    }, token);
  },

  // Adicionar evidência ao caso
  addEvidenciaToCaso: async (idCaso, idEvidencia, token = null) => {
    console.log('📎 Adicionando evidência ao caso:', idCaso, idEvidencia);
    return makeRequest(`/casos/${idCaso}/evidencias`, {
      method: 'POST',
      body: JSON.stringify({ idEvidencia }),
    }, token);
  },

  // Remover evidência do caso
  removeEvidenciaFromCaso: async (idCaso, idEvidencia, token = null) => {
    console.log('🗑️ Removendo evidência do caso:', idCaso, idEvidencia);
    return makeRequest(`/casos/${idCaso}/evidencias`, {
      method: 'DELETE',
      body: JSON.stringify({ idEvidencia }),
    }, token);
  },

  // Adicionar relatório ao caso
  addRelatorioToCaso: async (idCaso, idRelatorio, token = null) => {
    console.log('📄 Adicionando relatório ao caso:', idCaso, idRelatorio);
    return makeRequest('/casos/relatorio', {
      method: 'POST',
      body: JSON.stringify({ idCaso, idRelatorio }),
    }, token);
  },

  // Remover relatório do caso
  removeRelatorioFromCaso: async (idCaso, idRelatorio, token = null) => {
    console.log('🗑️ Removendo relatório do caso:', idCaso, idRelatorio);
    return makeRequest('/casos/relatorio', {
      method: 'DELETE',
      body: JSON.stringify({ idCaso, idRelatorio }),
    }, token);
  },

  // Adicionar vítima ao caso
  addVitimaToCaso: async (idCaso, idVitima, token = null) => {
    console.log('👤 Adicionando vítima ao caso:', idCaso, idVitima);
    return makeRequest(`/casos/${idCaso}/vitimas`, {
      method: 'POST',
      body: JSON.stringify({ idVitima }),
    }, token);
  },

  // Remover vítima do caso
  removeVitimaFromCaso: async (idCaso, idVitima, token = null) => {
    console.log('🗑️ Removendo vítima do caso:', idCaso, idVitima);
    return makeRequest(`/casos/${idCaso}/vitimas`, {
      method: 'DELETE',
      body: JSON.stringify({ idVitima }),
    }, token);
  },
}; 