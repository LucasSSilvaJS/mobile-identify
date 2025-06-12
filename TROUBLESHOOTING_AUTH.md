# 🔧 Troubleshooting - Autenticação

## 🚨 Problema: getAuthToken is not a function

### **Descrição do Erro**
```
TypeError: getAuthToken is not a function
```

### **Causa**
A função `getAuthToken` não estava implementada no contexto de autenticação.

### **Solução Implementada**
✅ **Adicionada função `getAuthToken` ao AuthContext**

```javascript
// contexts/AuthContext.js
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
```

### **Como Usar Corretamente**
```javascript
// ✅ CORRETO - Função é assíncrona
const { getAuthToken } = useAuth();

const carregarDados = async () => {
  const token = await getAuthToken();
  // ... usar token
};

// ❌ ERRADO - Não usar await
const token = getAuthToken(); // Isso retorna uma Promise, não o token
```

## 🔍 Verificação de Implementação

### **1. Verificar se a função está disponível**
```javascript
const { getAuthToken, user, isAuthenticated } = useAuth();

console.log('getAuthToken disponível:', typeof getAuthToken === 'function');
console.log('Usuário autenticado:', isAuthenticated);
```

### **2. Verificar se o token está sendo salvo**
```javascript
// No login
const response = await authService.login(email, password);
console.log('Token salvo:', !!response.user?.token);

// Verificar AsyncStorage
const token = await AsyncStorage.getItem('@auth_token');
console.log('Token no AsyncStorage:', !!token);
```

### **3. Verificar se o token está sendo recuperado**
```javascript
const token = await getAuthToken();
console.log('Token recuperado:', !!token);
console.log('Token completo:', token);
```

## 🛠️ Debug Detalhado

### **Logs de Autenticação**
O sistema inclui logs detalhados para debug:

```javascript
// No interceptor do axios
console.log('Interceptor - Token encontrado:', !!token);
console.log('Interceptor - URL da requisição:', config.url);

// Na função getAuthToken
console.log('getAuthToken - Token encontrado:', !!token);

// No login
console.log('Login - Token extraído:', !!token);
console.log('Login - Token salvo no AsyncStorage');
```

### **Verificar AsyncStorage**
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

const verificarAsyncStorage = async () => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    console.log('Chaves no AsyncStorage:', allKeys);
    
    const token = await AsyncStorage.getItem('@auth_token');
    const userData = await AsyncStorage.getItem('@user_data');
    
    console.log('Token:', !!token);
    console.log('User data:', !!userData);
  } catch (error) {
    console.error('Erro ao verificar AsyncStorage:', error);
  }
};
```

## 🔄 Fluxo de Autenticação

### **1. Login**
```javascript
// 1. Usuário faz login
const response = await authService.login(email, password);

// 2. Token é extraído da resposta
const token = response.user.token;

// 3. Token é salvo no AsyncStorage
await AsyncStorage.setItem('@auth_token', token);

// 4. Dados do usuário são salvos
await AsyncStorage.setItem('@user_data', JSON.stringify(response.user));
```

### **2. Recuperação do Token**
```javascript
// 1. Função getAuthToken é chamada
const token = await getAuthToken();

// 2. Token é recuperado do AsyncStorage
const token = await AsyncStorage.getItem('@auth_token');

// 3. Token é retornado para uso nas requisições
return token;
```

### **3. Uso em Requisições**
```javascript
// 1. Token é obtido
const token = await getAuthToken();

// 2. Token é passado para o serviço
const dados = await casoService.getCasoById(id, token);

// 3. Serviço adiciona token ao header
headers: {
  'Authorization': `Bearer ${token}`
}
```

## 🚨 Problemas Comuns e Soluções

### **Problema 1: Token não encontrado**
**Sintomas:**
- `getAuthToken()` retorna `null`
- Requisições retornam 401

**Soluções:**
1. Verificar se o login foi bem-sucedido
2. Verificar se o token foi salvo no AsyncStorage
3. Fazer logout e login novamente

### **Problema 2: Token expirado**
**Sintomas:**
- Requisições retornam 401
- Token existe mas é inválido

**Soluções:**
1. O interceptor remove automaticamente tokens expirados
2. Fazer logout e login novamente
3. Verificar se o backend está funcionando

### **Problema 3: Erro de rede**
**Sintomas:**
- Timeout nas requisições
- Erro de conexão

**Soluções:**
1. Verificar conexão com internet
2. Verificar se o backend está online
3. Verificar URL da API

## 📋 Checklist de Verificação

### **Antes de Usar getAuthToken**
- [ ] Usuário está logado (`isAuthenticated === true`)
- [ ] Função `getAuthToken` está disponível no contexto
- [ ] AsyncStorage está funcionando

### **Ao Fazer Requisições**
- [ ] Usar `await` com `getAuthToken()`
- [ ] Verificar se token não é `null`
- [ ] Passar token para o serviço
- [ ] Tratar erros adequadamente

### **Debug**
- [ ] Verificar logs no console
- [ ] Verificar AsyncStorage
- [ ] Verificar resposta do backend

## 🔧 Comandos de Debug

### **Verificar Estado da Autenticação**
```javascript
const debugAuth = async () => {
  const { isAuthenticated, user, getAuthToken } = useAuth();
  
  console.log('=== DEBUG AUTENTICAÇÃO ===');
  console.log('isAuthenticated:', isAuthenticated);
  console.log('user:', user);
  
  const token = await getAuthToken();
  console.log('token:', !!token);
  console.log('token completo:', token);
  
  const allKeys = await AsyncStorage.getAllKeys();
  console.log('AsyncStorage keys:', allKeys);
};
```

### **Limpar Dados de Autenticação**
```javascript
const limparAuth = async () => {
  await AsyncStorage.removeItem('@auth_token');
  await AsyncStorage.removeItem('@user_data');
  console.log('Dados de autenticação limpos');
};
```

## 📞 Suporte

Se o problema persistir:

1. **Verificar logs** no console do Metro bundler
2. **Testar login** com credenciais válidas
3. **Verificar backend** se está respondendo
4. **Limpar dados** e fazer login novamente
5. **Verificar versões** das dependências

### **Informações para Debug**
- Versão do React Native
- Versão do Expo
- Versão do AsyncStorage
- URL do backend
- Logs de erro completos 