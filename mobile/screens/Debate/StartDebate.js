import { View } from "react-native";
import React, {useState, useEffect} from "react";

import {
    BackgroundContainer,
    InnerContainer, 
    ButtonText,
    Colors, 
    Label, 
    StyledButton,
    Shadow,
    SubjectContainer
} from "../../components/styles"

const {blue, dark, white, brand, green, pink} = Colors;

const StartDebate = ({ navigation, route }) => {
  const { 
    sujet, 
    choixUtilisateur,
    debatId,
    type,
    status,
    dateDebut,
    duree,
    note 
  } = route.params || {};

  useEffect(() => {
    // Vérifier si les données nécessaires sont présentes
    if (!sujet || !choixUtilisateur) {
      console.log("Données manquantes:", { sujet, choixUtilisateur });
      // Rediriger vers l'accueil si données manquantes
      navigation.navigate("Home");
    }
  }, []);

  const handleStartDebate = () => {
    // Naviguer vers le chat avec toutes les données du débat
    navigation.navigate("Chat", {
      debatId: debatId,
      sujet: sujet,
      choixUtilisateur: choixUtilisateur,
      type: type || "ENTRAINEMENT",
      status: status || "EN_COURS",
      dateDebut: dateDebut,
      duree: duree,
      note: note
    });
  };

  // Formater la difficulté pour l'affichage
  const formatDifficulte = (difficulte) => {
    const map = {
      'DEBUTANT': 'Débutant',
      'INTERMEDIAIRE': 'Intermédiaire',
      'AVANCE': 'Avancé'
    };
    return map[difficulte] || difficulte;
  };

  // Formater le choix pour l'affichage
  const formatChoix = (choix) => {
    return choix === "POUR" ? "POUR" : "CONTRE";
  };

  // Formater le type de débat
  const formatType = (type) => {
    const map = {
      'ENTRAINEMENT': "Entraînement",
      'TEST': "Test évalué"
    };
    return map[type] || type;
  };

  // Couleur selon le choix
  const getChoixColor = (choix) => {
    return choix === "POUR" ? green : pink;
  };

  if (!sujet || !choixUtilisateur) {
    return (
      <BackgroundContainer
        source={require("../../assets/img/fond.png")}
        resizeMode="cover"
      >
        <InnerContainer style={{marginTop:70, justifyContent: "center", alignItems: "center"}}>
          <Label style={{fontSize: 20, marginBottom: 20, color: white}}>
            Données manquantes
          </Label>
          <StyledButton onPress={() => navigation.navigate("Home")}>
            <ButtonText>Retour à l'accueil</ButtonText>
          </StyledButton>
        </InnerContainer>
      </BackgroundContainer>
    );
  }

  return (
    <BackgroundContainer
      source={require("../../assets/img/fond.png")}
      resizeMode="cover"
    >
      <InnerContainer style={{marginTop:70, justifyContent: "center", alignItems: "center"}}>
        
        <Label style={{fontSize: 24, marginBottom: 30, color: white, textAlign: 'center'}}>
          Récapitulatif du débat
        </Label>

        {/* Carte du sujet */}
        <View style={{ 
          backgroundColor: white, 
          borderRadius: 15, 
          padding: 20, 
          width: '100%',
          marginBottom: 25,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}>
          <Label style={{fontSize: 18, marginBottom: 15, color: dark, textAlign: 'center', fontWeight: 'bold'}}>
            Sujet :
          </Label>
          <Label style={{fontSize: 16, marginBottom: 15, color: dark, textAlign: 'center', lineHeight: 22}}>
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
          
          <Label style={{
            fontSize: 14, 
            color: type === "TEST" ? pink : blue,
            fontStyle: 'italic',
            textAlign: 'center',
            marginTop: 10
          }}>
            {formatType(type)}
          </Label>
        </View>

        {/* Votre position */}
        <Label style={{fontSize: 20, marginBottom: 20, color: white}}>
          Votre position :
        </Label>
        
        <View style={{ 
          backgroundColor: getChoixColor(choixUtilisateur),
          borderRadius: 50,
          paddingVertical: 15,
          paddingHorizontal: 40,
          marginBottom: 30,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}>
          <Label style={{fontSize: 24, color: white, fontWeight: 'bold'}}>
            {formatChoix(choixUtilisateur)}
          </Label>
        </View>

        {/* Informations supplémentaires */}
        {debatId && (
          <View style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.1)', 
            borderRadius: 10, 
            padding: 15, 
            width: '100%',
            marginBottom: 30 
          }}>
            <Label style={{fontSize: 14, color: white, textAlign: 'center', marginBottom: 5}}>
              ID du débat : {debatId}
            </Label>
            {status && (
              <Label style={{fontSize: 14, color: status === "EN_COURS" ? green : blue, textAlign: 'center'}}>
                Statut : {status === "EN_COURS" ? "En cours" : "Terminé"}
              </Label>
            )}
          </View>
        )}

        {/* Instructions */}
        <Label style={{
          fontSize: 16, 
          color: white, 
          textAlign: 'center', 
          marginBottom: 30,
          lineHeight: 22,
          fontStyle: 'italic'
        }}>
          {type === "TEST" 
            ? "Ce débat sera évalué. Préparez vos arguments !" 
            : "Ceci est un débat d'entraînement. Profitez-en pour vous améliorer !"}
        </Label>

        {/* Bouton Commencer */}
        <Shadow style={{width: '80%'}}>
          <StyledButton onPress={handleStartDebate}>
            <ButtonText style={{fontSize: 18}}>COMMENCER LE DÉBAT</ButtonText>
          </StyledButton>
        </Shadow>

        {/* Bouton retour */}
        <StyledButton 
          style={{ 
            marginTop: 20, 
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: white
          }}
          onPress={() => navigation.goBack()}
        >
          <ButtonText style={{color: white}}>Modifier mon choix</ButtonText>
        </StyledButton>

      </InnerContainer>
    </BackgroundContainer>
  );
};

export default StartDebate;