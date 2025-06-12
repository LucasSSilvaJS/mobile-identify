import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const authenticated = await authService.isAuthenticated();
      if (authenticated) {
        const userData = await authService.getUserData();
        setUser(userData);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Erro ao verificar status de autenticação:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await authService.login(email, password);
      setUser(response.user);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função para obter o token de autenticação
  const getAuthToken = async () => {
    try {
      const token = await AsyncStorage.getItem('@auth_token');
      console.log('getAuthToken - Token encontrado:', !!token);
      return token;
    } catch (error) {
      console.error('getAuthToken - Erro ao recuperar token:', error);
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        logout,
        checkAuthStatus,
        getAuthToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}; 