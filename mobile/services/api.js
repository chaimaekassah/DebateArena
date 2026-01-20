import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// Création de l'instance axios avec configuration
const api = axios.create({
  baseURL: 'http://192.168.11.180:8080/api',
  timeout: 10000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
});

// Intercepteur de requête pour ajouter le token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      if (token) {
        console.log(`📡 REQUÊTE API ===========================`);
        console.log(`URL: ${config.baseURL || ''}${config.url}`);
        console.log(`Méthode: ${config.method?.toUpperCase()}`);
        console.log(`Token présent: ${!!token}`);
        console.log(`Longueur token: ${token.length}`);
        console.log(`Début token: ${token.substring(0, 30)}...`);
        console.log(`Headers: ${JSON.stringify(config.headers, null, 2)}`);
        
        if (config.data) {
          // Gérer le data qui peut être string ou objet
          try {
            let dataObj;
            if (typeof config.data === 'string') {
              dataObj = JSON.parse(config.data);
            } else {
              dataObj = config.data;
            }
            console.log(`Data: ${JSON.stringify(dataObj, null, 2)}`);
          } catch (parseError) {
            console.log(`Data (raw): ${typeof config.data === 'string' ? config.data.substring(0, 100) + '...' : 'Non-string data'}`);
          }
        }
        
        // Log supplémentaire pour les messages
        if (config.url?.includes('/messages') && config.method === 'post') {
          console.log(`🎯 Envoi message vers débat: ${config.url}`);
          try {
            let dataObj;
            if (typeof config.data === 'string') {
              dataObj = JSON.parse(config.data);
            } else {
              dataObj = config.data;
            }
            console.log(`📝 Contenu: ${dataObj.contenu ? dataObj.contenu.substring(0, 50) : 'N/A'}`);
          } catch (error) {
            console.log(`📝 Contenu: (erreur parsing)`);
          }
        }
        
        console.log(`==========================================`);
        
        // AJOUTER LE TOKEN - TRÈS IMPORTANT
        config.headers.Authorization = `Bearer ${token}`;
        
        // Vérifier que le token est bien ajouté
        console.log(`✅ Token ajouté aux headers`);
      } else {
        console.log(`⚠️ Token non trouvé dans AsyncStorage`);
      }
    } catch (error) {
      console.log("❌ Erreur intercepteur requête:", error);
      // Continuer même en cas d'erreur
    }
    
    return config;
  },
  (error) => {
    console.log("❌ Erreur intercepteur requête:", error);
    return Promise.reject(error);
  }
);

// Intercepteur de réponse pour logging et gestion des erreurs
api.interceptors.response.use(
  (response) => {
    console.log(`✅ RÉPONSE API =========================`);
    console.log(`URL: ${response.config.url}`);
    console.log(`Status: ${response.status}`);
    console.log(`Headers: ${JSON.stringify(response.headers, null, 2)}`);
    
    if (response.data) {
      console.log(`Data: ${JSON.stringify(response.data, null, 2)}`);
    }
    
    console.log(`========================================`);
    return response;
  },
  async (error) => {
    if (error.response) {
      console.log(`❌ ERREUR API ==========================`);
      console.log(`URL: ${error.config?.url}`);
      console.log(`Method: ${error.config?.method?.toUpperCase()}`);
      console.log(`Status: ${error.response.status}`);
      console.log(`Status Text: ${error.response.statusText}`);
      console.log(`Headers réponse: ${JSON.stringify(error.response.headers, null, 2)}`);
      console.log(`Data erreur: ${JSON.stringify(error.response.data, null, 2) || '""'}`);
      
      // Afficher les headers de la requête pour vérifier le token
      console.log(`Headers requête: ${JSON.stringify(error.config?.headers, null, 2)}`);
      
      const token = await AsyncStorage.getItem('userToken');
      console.log(`Token dans storage: ${token ? 'Présent' : 'Absent'}`);
      if (token) {
        console.log(`Début token: ${token.substring(0, 30)}...`);
      }
      
      console.log(`========================================`);
      
      // Gestion spécifique des erreurs 403
      if (error.response.status === 403) {
        console.log(`🚫 Accès interdit - Analyse:`);
        
        // Vérifier si le token était présent dans la requête
        const authHeader = error.config?.headers?.Authorization;
        if (!authHeader) {
          console.log(`❌ Aucun header Authorization dans la requête!`);
        } else if (!authHeader.startsWith('Bearer ')) {
          console.log(`❌ Format Authorization incorrect: ${authHeader.substring(0, 20)}...`);
        } else {
          console.log(`✅ Header Authorization présent`);
        }
        
        // Extraire l'URL pour un diagnostic plus précis
        const url = error.config?.url || '';
        
        if (url.includes('/messages')) {
          console.log(`💡 Erreur d'envoi de message - Raisons possibles:`);
          console.log(`   • Débat terminé`);
          console.log(`   • Utilisateur n'est pas participant au débat`);
          console.log(`   • Débat n'existe plus`);
          console.log(`   • Token expiré/invalide`);
        } else if (url.includes('/debats/') && !url.includes('/messages')) {
          console.log(`💡 Accès au débat refusé - L'utilisateur n'y a pas accès`);
        }
      }
      
      // Gestion des erreurs 401 (non authentifié)
      if (error.response.status === 401) {
        console.log(`🔐 Session expirée - Déconnexion nécessaire`);
        try {
          await AsyncStorage.clear();
          // Vous devrez gérer la redirection vers le login depuis votre composant
        } catch (storageError) {
          console.log("Erreur lors de la déconnexion:", storageError);
        }
      }
    } else if (error.request) {
      console.log(`🌐 ERREUR RESEAU ======================`);
      console.log(`Aucune réponse reçue`);
      console.log(`Requête: ${JSON.stringify(error.request, null, 2)}`);
      console.log(`========================================`);
    } else {
      console.log(`⚙️ ERREUR CONFIGURATION ===============`);
      console.log(`Message: ${error.message}`);
      console.log(`========================================`);
    }
    
    return Promise.reject(error);
  }
);

// Fonction pour vérifier la validité du token
export const verifyToken = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      console.log('❌ Token non trouvé');
      return false;
    }
    
    // Vérifier la structure basique du token
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log('❌ Token mal formé');
      return false;
    }
    
    // Décoder le payload pour vérifier l'expiration
    try {
      const payload = JSON.parse(atob(parts[1]));
      const expiry = payload.exp * 1000; // Convertir en ms
      const now = Date.now();
      
      if (now >= expiry) {
        console.log('❌ Token expiré');
        await AsyncStorage.clear();
        return false;
      }
      
      console.log('✅ Token valide, rôle:', payload.role);
      return true;
    } catch (decodeError) {
      console.log('❌ Erreur décodage token:', decodeError);
      return false;
    }
  } catch (error) {
    console.log('❌ Erreur vérification token:', error);
    return false;
  }
};

export default api;