import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: 'http://192.168.11.169:8080/api', // Votre backend Spring Boot
  timeout: 10000,
});

// Intercepteur pour ajouter automatiquement le token JWT
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('userToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      await AsyncStorage.clear();
      // Vous pouvez rediriger vers le login ici si nécessaire
    }
    return Promise.reject(error);
  }
);

export default api;