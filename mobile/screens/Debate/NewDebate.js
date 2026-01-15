import { View, Alert, ActivityIndicator } from "react-native";
import React, {useState, useEffect} from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';

import {
    BackgroundContainer,
    InnerContainer,
    PageLogo,
    Choice,
    Label,
    Colors,
    StyledButton,
    ButtonText
} from "../../components/styles"

const {blue, dark, yellow, lightPink, white} = Colors;

const NewDebate = ({ navigation, route }) => {
  const [debateType, setDebateType] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Vérifier si l'utilisateur est connecté
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        navigation.navigate("Login");
      }
    } catch (error) {
      console.log("Erreur vérification auth:", error);
    }
  };

  const handleChoice = (type) => {
    setDebateType(type);
    // Naviguer vers les catégories avec le type sélectionné
    navigation.navigate("Categories", { debateType: type });
  };

  const handleQuickDebate = async (type) => {
    try {
      setLoading(true);
      
      // Pour l'instant, on utilise un sujetId fixe
      // À remplacer par un sujet aléatoire plus tard
      const sujetId = 1;
      
      const debatData = {
        sujetId: sujetId,
        type: type,
        choix: "POUR" // Choix par défaut
      };

      const response = await api.post('/debats', debatData);
      
      if (response.data) {
        const debat = response.data;
        // Naviguer vers l'écran de débat
        navigation.navigate("DebateScreen", { 
          debatId: debat.id,
          sujet: debat.sujet,
          type: debat.type,
          choixUtilisateur: debat.choixUtilisateur,
          status: debat.status
        });
      }
    } catch (error) {
      console.log("Erreur création débat:", error);
      
      let errorMessage = "Impossible de créer le débat.";
      
      if (error.response?.status === 400) {
        errorMessage = "Données invalides ou débat déjà en cours sur ce sujet.";
      } else if (error.response?.status === 403) {
        errorMessage = "Niveau insuffisant pour accéder à ce sujet.";
      } else if (error.response?.status === 401) {
        errorMessage = "Session expirée. Veuillez vous reconnecter.";
        navigation.navigate("Login");
      }
      
      Alert.alert("Erreur", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BackgroundContainer
      source={require("../../assets/img/fond.png")}
      resizeMode="cover"
    >
      <InnerContainer style={{marginTop:70}}>
      
        <PageLogo
          resizeMode="contain"
          source={require("../../assets/img/logoCoupe.png")}
        />
        <Label style={{fontSize: 32, marginBottom: 30, color: dark}}>Commencer un débat ?</Label>
        
        <Choice 
          onPress={() => handleChoice("ENTRAINEMENT")}
          style={{marginBottom: 20}}
        >
            <Label style={{fontSize: 16, color: dark}}>Entraînement</Label>
            <Label style={{fontSize: 12, color: dark, opacity: 0.7, marginTop: 5}}>
              Pratiquez sans évaluation
            </Label>
        </Choice>
        
        <Choice 
          style={{backgroundColor: blue}} 
          onPress={() => handleChoice("TEST")}
        >
            <Label style={{fontSize: 16, color: 'white'}}>Test</Label>
            <Label style={{fontSize: 12, color: 'white', opacity: 0.9, marginTop: 5}}>
              Débat évalué avec note
            </Label>
        </Choice>

        {/* Bouton débat rapide optionnel */}
        {loading && (
          <View style={{ marginTop: 20 }}>
            <ActivityIndicator size="large" color={white} />
            <Label style={{ color: white, marginTop: 10 }}>Création du débat...</Label>
          </View>
        )}

      </InnerContainer>
    </BackgroundContainer>
  );
};

export default NewDebate;