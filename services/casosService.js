import axios from 'axios';

const API_BASE_URL = 'https://backend-pi-26cz.onrender.com';

export const getCasos = async (token, page = 1, filters = {}) => {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', '10');

    // Adicionar filtros específicos
    if (filters.titulo) {
      params.append('titulo', filters.titulo);
    }
    
    if (filters.descricao) {
      params.append('descricao', filters.descricao);
    }
    
    if (filters.status) {
      params.append('status', filters.status);
    }

    const response = await axios.get(`${API_BASE_URL}/casos?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Erro ao buscar casos:', error);
    throw error;
  }
};

export const getCasoById = async (token, casoId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/casos/${casoId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Erro ao buscar caso:', error);
    throw error;
  }
};

export const createCaso = async (token, casoData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/casos`, casoData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Erro ao criar caso:', error);
    throw error;
  }
};

export const updateCaso = async (token, casoId, casoData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/casos/${casoId}`, casoData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar caso:', error);
    throw error;
  }
};

export const deleteCaso = async (token, casoId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/casos/${casoId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Erro ao deletar caso:', error);
    throw error;
  }
}; 