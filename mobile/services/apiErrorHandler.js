// services/apiErrorHandler.js
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const handleApiError = (error, navigation) => {
  console.error('API Error:', error);
  
  if (!error.response) {
    return {
      userMessage: "Erreur de connexion au serveur",
      shouldLogout: false
    };
  }
  
  const { status } = error.response;
  
  switch (status) {
    case 401:
      AsyncStorage.removeItem('userToken');
      if (navigation) {
        setTimeout(() => {
          Alert.alert(
            "Session expirée",
            "Votre session a expiré. Veuillez vous reconnecter.",
            [{ text: "OK", onPress: () => navigation.navigate("Login") }]
          );
        }, 100);
      }
      return {
        userMessage: "Session expirée",
        shouldLogout: true
      };
      
    case 403:
      return {
        userMessage: "Accès non autorisé à cette ressource",
        shouldLogout: false
      };
      
    case 404:
      return {
        userMessage: "Ressource non trouvée",
        shouldLogout: false
      };
      
    case 500:
      return {
        userMessage: "Erreur interne du serveur",
        shouldLogout: false
      };
      
    default:
      return {
        userMessage: `Erreur ${status}: ${error.response.data?.message || 'Erreur inconnue'}`,
        shouldLogout: false
      };
  }
};

export const showErrorAlert = (error, navigation) => {
  const { userMessage, shouldLogout } = handleApiError(error, navigation);
  
  if (!shouldLogout) {
    Alert.alert("Erreur", userMessage);
  }
};