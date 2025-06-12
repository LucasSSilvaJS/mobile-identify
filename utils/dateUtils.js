/**
 * Utilitários para formatação de datas
 */

/**
 * Formata uma data string para o formato brasileiro (dd/mm/aaaa)
 * @param {string} dataString - String da data (ISO, timestamp, etc.)
 * @returns {string} Data formatada no padrão brasileiro
 */
export const formatarData = (dataString) => {
  if (!dataString) return 'Não informado';
  
  try {
    const data = new Date(dataString);
    
    // Verifica se a data é válida
    if (isNaN(data.getTime())) {
      return 'Data inválida';
    }
    
    // Formata para o padrão brasileiro
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return 'Data inválida';
  }
};

/**
 * Formata uma data string para o formato brasileiro com hora (dd/mm/aaaa HH:mm)
 * @param {string} dataString - String da data (ISO, timestamp, etc.)
 * @returns {string} Data e hora formatada no padrão brasileiro
 */
export const formatarDataHora = (dataString) => {
  if (!dataString) return 'Não informado';
  
  try {
    const data = new Date(dataString);
    
    // Verifica se a data é válida
    if (isNaN(data.getTime())) {
      return 'Data inválida';
    }
    
    // Formata para o padrão brasileiro com hora
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Erro ao formatar data e hora:', error);
    return 'Data inválida';
  }
};

/**
 * Formata uma data string para o formato brasileiro completo (dd/mm/aaaa HH:mm:ss)
 * @param {string} dataString - String da data (ISO, timestamp, etc.)
 * @returns {string} Data, hora e segundos formatada no padrão brasileiro
 */
export const formatarDataHoraCompleta = (dataString) => {
  if (!dataString) return 'Não informado';
  
  try {
    const data = new Date(dataString);
    
    // Verifica se a data é válida
    if (isNaN(data.getTime())) {
      return 'Data inválida';
    }
    
    // Formata para o padrão brasileiro completo
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch (error) {
    console.error('Erro ao formatar data e hora completa:', error);
    return 'Data inválida';
  }
};

/**
 * Retorna a data atual formatada no padrão brasileiro
 * @returns {string} Data atual formatada
 */
export const dataAtual = () => {
  return formatarData(new Date());
};

/**
 * Retorna a data e hora atual formatada no padrão brasileiro
 * @returns {string} Data e hora atual formatada
 */
export const dataHoraAtual = () => {
  return formatarDataHora(new Date());
};

/**
 * Verifica se uma data é válida
 * @param {string} dataString - String da data
 * @returns {boolean} True se a data é válida, false caso contrário
 */
export const isDataValida = (dataString) => {
  if (!dataString) return false;
  
  try {
    const data = new Date(dataString);
    return !isNaN(data.getTime());
  } catch (error) {
    return false;
  }
};

/**
 * Calcula a diferença em dias entre duas datas
 * @param {string} dataInicial - Data inicial
 * @param {string} dataFinal - Data final
 * @returns {number} Diferença em dias
 */
export const diferencaEmDias = (dataInicial, dataFinal) => {
  try {
    const inicio = new Date(dataInicial);
    const fim = new Date(dataFinal);
    
    if (isNaN(inicio.getTime()) || isNaN(fim.getTime())) {
      return 0;
    }
    
    const diferenca = fim.getTime() - inicio.getTime();
    return Math.floor(diferenca / (1000 * 60 * 60 * 24));
  } catch (error) {
    console.error('Erro ao calcular diferença em dias:', error);
    return 0;
  }
}; 