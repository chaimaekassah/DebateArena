import axios from 'axios';

// Créer une instance axios avec configuration de base
const api = axios.create({
  baseURL: 'http://192.168.11.109:8080/api',
  timeout: 10000, 
  headers: {
    'Content-Type': 'application/json',
  }
});

export default api;