import { View, Alert, ActivityIndicator } from "react-native";
import React, {useState, useEffect} from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';

import {
    BackgroundContainer,
    InnerContainer,
    Colors,
    SubjectContainer,
    Label,
    Quote,
    WhiteButton,
    ButtonText,
    Shadow
} from "../../components/styles"

const {blue, dark, white, brand} = Colors;

const Subject = ({ navigation, route }) => {
  const [loading, setLoading] = useState(false);
  const { sujet, debateType } = route.params || {};
  
  // Vérifier si l'utilisateur est connecté et si le sujet est présent
  useEffect(() => {
    checkAuth();
    
    if (!sujet) {
      Alert.alert("Erreur", "Aucun sujet sélectionné.");
      navigation.goBack();
    }
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

  const handleChoice = async (choix) => {
    try {
      setLoading(true);
      
      // Vérifier si le sujet est toujours accessible (au cas où)
      if (!sujet.accessible) {
        Alert.alert(
          "Accès refusé",
          "Ce sujet n'est pas accessible avec votre niveau actuel.",
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
        return;
      }
      
      // Créer le débat avec le choix de l'utilisateur
      const debatData = {
        sujetId: sujet.id,
        type: debateType || "ENTRAINEMENT",
        choix: choix
      };

      console.log("Création débat:", debatData);
      
      const response = await api.post('/api/debats', debatData);
      
      if (response.data) {
        const debat = response.data;
        console.log("Débat créé:", debat);
        
        // Naviguer vers l'écran de débat avec toutes les informations
        navigation.navigate("StartDebate", { 
          debatId: debat.id,
          sujet: debat.sujet || sujet,
          type: debat.type || debateType,
          choixUtilisateur: debat.choixUtilisateur || choix,
          status: debat.status || "EN_COURS",
          dateDebut: debat.dateDebut,
          duree: debat.duree,
          note: debat.note
        });
      }
    } catch (error) {
      console.log("Erreur création débat:", error.response?.data || error.message);
      
      let errorMessage = "Impossible de créer le débat.";
      let actions = [{ text: "OK" }];
      
      if (error.response?.status === 400) {
        errorMessage = "Données invalides ou débat déjà en cours sur ce sujet.";
      } else if (error.response?.status === 403) {
        errorMessage = `Niveau insuffisant pour accéder à ce sujet (${sujet.difficulte}).`;
        actions = [{ text: "Changer de sujet", onPress: () => navigation.goBack() }];
      } else if (error.response?.status === 401) {
        errorMessage = "Session expirée. Veuillez vous reconnecter.";
        navigation.navigate("Login");
        return;
      } else if (error.response?.status === 404) {
        errorMessage = "Sujet non trouvé.";
        actions = [{ text: "Changer de sujet", onPress: () => navigation.goBack() }];
      }
      
      Alert.alert("Erreur", errorMessage, actions);
    } finally {
      setLoading(false);
    }
  };

  // Afficher le chargement si pas de sujet
  if (!sujet) {
    return (
      <BackgroundContainer
        source={require("../../assets/img/fond.png")}
        resizeMode="cover"
      >
        <InnerContainer style={{marginTop:70, alignItems: 'center', justifyContent: 'center'}}>
          <ActivityIndicator size="large" color={white} />
          <Label style={{color: white, marginTop: 20}}>Chargement du sujet...</Label>
        </InnerContainer>
      </BackgroundContainer>
    );
  }

  // Formater la difficulté pour l'affichage
  const formatDifficulte = (difficulte) => {
    const map = {
      'DEBUTANT': 'Débutant',
      'INTERMEDIAIRE': 'Intermédiaire',
      'AVANCE': 'Avancé'
    };
    return map[difficulte] || difficulte;
  };

  return (
    <BackgroundContainer
      source={require("../../assets/img/fond.png")}
      resizeMode="cover"
    >
      <InnerContainer style={{marginTop:70}}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start'}}>
          <Quote source={require("../../assets/img/quote.png")}
          style={{top: -30, left: -30, zIndex: 10, transform: [{ rotate: '180deg' }]}}/>
          
          <Shadow>
            <SubjectContainer>
              <Label style={{fontSize: 24, marginBottom: 15, color: dark, textAlign: 'center'}}>
                {sujet.titre}
              </Label>
              
              <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10}}>
                <Label style={{fontSize: 14, color: dark, opacity: 0.7}}>
                  Catégorie: {sujet.categorie}
                </Label>
                <Label style={{
                  fontSize: 14,
                  color: sujet.difficulte === 'DEBUTANT' ? brand : 
                         sujet.difficulte === 'INTERMEDIAIRE' ? blue : 
                         dark,
                  fontWeight: '600'
                }}>
                  {formatDifficulte(sujet.difficulte)}
                </Label>
              </View>
              
              <Label style={{fontSize: 16, color: dark, fontStyle: 'italic', marginTop: 10, textAlign: 'center'}}>
                {debateType === "TEST" ? "Débat évalué" : "Débat d'entraînement"}
              </Label>
            </SubjectContainer>
          </Shadow>
          
          <Quote source={require("../../assets/img/quote.png")}
          style={{bottom: -10, right: -20}}/>
        </View>

        <Label style={{marginBottom: 30, marginTop: 30, color: white, fontSize: 20}}>
          Êtes-vous :
        </Label>

        {loading ? (
          <View style={{alignItems: 'center'}}>
            <ActivityIndicator size="large" color={white} />
            <Label style={{color: white, marginTop: 20}}>Création du débat en cours...</Label>
          </View>
        ) : (
          <>
            <WhiteButton 
              style={{marginBottom: 20, backgroundColor: '#4CAF50'}} 
              onPress={() => handleChoice("POUR")}
            >
              <ButtonText style={{color: white, fontSize: 18, fontWeight: 'bold'}}>
                POUR
              </ButtonText>
            </WhiteButton>
            
            <Label style={{color: white, marginBottom: 20}}>ou</Label>
            
            <WhiteButton 
              style={{backgroundColor: '#f44336'}} 
              onPress={() => handleChoice("CONTRE")}
            >
              <ButtonText style={{color: white, fontSize: 18, fontWeight: 'bold'}}>
                CONTRE
              </ButtonText>
            </WhiteButton>

            <WhiteButton 
              style={{marginTop: 40, backgroundColor: 'transparent', borderWidth: 1, borderColor: white}}
              onPress={() => navigation.goBack()}
            >
              <ButtonText style={{color: white}}>Changer de sujet</ButtonText>
            </WhiteButton>
          </>
        )}
      </InnerContainer>
    </BackgroundContainer>
  );
};

export default Subject;