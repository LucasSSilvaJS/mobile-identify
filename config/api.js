// Configuração da API
export const API_BASE_URL = 'https://backend-pi-26cz.onrender.com'; // URL do backend

// Configurações de timeout
export const API_TIMEOUT = 10000; // 10 segundos

// Headers padrão
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// Status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
}; 