import { View, Alert, ActivityIndicator, ScrollView } from "react-native";
import React, { useState, useEffect } from "react";
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
} from "../../components/styles";

const { blue, dark, white, brand, pink } = Colors;

const Subject = ({ navigation, route }) => {
  const [loading, setLoading] = useState(false);
  const { sujet, debateType } = route.params || {};
  const [userLevel, setUserLevel] = useState(null);

  useEffect(() => {
    checkAuth();

    if (!sujet) {
      Alert.alert("Erreur", "Aucun sujet sélectionné.");
      navigation.goBack();
    } else {
      fetchUserLevel();
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

  const fetchUserLevel = async () => {
    try {
      const response = await api.get('/dashboard');
      if (response.data && response.data.niveau) {
        setUserLevel(response.data.niveau);
      }
    } catch (error) {
      console.log("Erreur récupération niveau:", error);
    }
  };

  const handleChoice = async (choix) => {
    try {
      setLoading(true);

      if (userLevel) {
        const levelOrder = { 'DEBUTANT': 1, 'INTERMEDIAIRE': 2, 'AVANCE': 3 };
        const userLevelOrder = levelOrder[userLevel] || 0;
        const sujetLevelOrder = levelOrder[sujet.difficulte] || 0;

        if (userLevelOrder < sujetLevelOrder) {
          Alert.alert(
            "Niveau insuffisant",
            `Ce sujet nécessite le niveau ${sujet.difficulte}. Votre niveau actuel: ${userLevel}`,
            [{ text: "OK" }]
          );
          setLoading(false);
          return;
        }
      }

      const debatData = {
        sujetId: sujet.id,
        type: debateType || "ENTRAINEMENT",
        choix: choix
      };

      console.log("Création débat:", debatData);

      const response = await api.post('/debats', debatData);

      if (response.data) {
        const debat = response.data;
        console.log("Débat créé:", debat);

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
        actions = [{
          text: "Changer de sujet",
          onPress: () => navigation.goBack()
        }];
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

  if (!sujet) {
    return (
      <BackgroundContainer
        source={require("../../assets/img/fond.png")}
        resizeMode="cover"
      >
        <InnerContainer style={{ marginTop: 70, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={white} />
          <Label style={{ color: white, marginTop: 20 }}>Chargement du sujet...</Label>
        </InnerContainer>
      </BackgroundContainer>
    );
  }

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
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 30
        }}
        showsVerticalScrollIndicator={false}
        bounces={true}
        alwaysBounceVertical={true}
        keyboardShouldPersistTaps="handled"
      >
        <InnerContainer style={{ 
          marginTop: 70, 
          paddingBottom: 40,
          paddingHorizontal: 20 // Ajout de padding horizontal
        }}>
          {/* Conteneur principal avec alignement centré */}
          <View style={{ 
            alignItems: 'center', 
            width: '100%',
            maxWidth: 500, // Limite la largeur maximale
            alignSelf: 'center' // Centre le conteneur
          }}>
            
            {/* Section Sujet avec guillemets */}
            <View style={{ 
              width: '100%', 
              position: 'relative',
              alignItems: 'center',
              marginBottom: 40
            }}>
              {/* Guillemet gauche */}
              <Quote 
                source={require("../../assets/img/quote.png")}
                style={{
                  position: 'absolute',
                  top: -25,
                  left: 5,
                  zIndex: 10,
                  transform: [{ rotate: '180deg' }],
                  width: 40,
                  height: 40
                }}
              />
              
              {/* Carte du sujet */}
              <Shadow style={{ width: '100%' }}>
                <SubjectContainer style={{ 
                  padding: 20,
                  overflow: 'hidden' // Empêche le contenu de déborder
                }}>
                  <Label style={{
                    fontSize: 22,
                    marginBottom: 20,
                    color: dark,
                    textAlign: 'center',
                    lineHeight: 28,
                    flexWrap: 'wrap', // Permet au texte de passer à la ligne
                    width: '100%' // Assure que le texte utilise toute la largeur disponible
                  }}>
                    {sujet.titre}
                  </Label>

                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 15,
                    width: '100%',
                    flexWrap: 'wrap' // Permet le retour à la ligne si nécessaire
                  }}>
                    <View style={{ 
                      flex: 1,
                      minWidth: '45%', // Minimum de largeur
                      marginBottom: 10
                    }}>
                      <Label style={{ 
                        fontSize: 14, 
                        color: dark, 
                        opacity: 0.7,
                        marginBottom: 5
                      }}>
                        Catégorie:
                      </Label>
                      <Label style={{ 
                        fontSize: 16, 
                        color: dark, 
                        fontWeight: '600',
                        flexWrap: 'wrap'
                      }}>
                        {sujet.categorie}
                      </Label>
                    </View>

                    <View style={{ 
                      alignItems: 'flex-end',
                      minWidth: '45%', // Minimum de largeur
                      marginBottom: 10
                    }}>
                      <Label style={{ 
                        fontSize: 14, 
                        color: dark, 
                        opacity: 0.7,
                        marginBottom: 5
                      }}>
                        Difficulté:
                      </Label>
                      <Label style={{
                        fontSize: 16,
                        color: sujet.difficulte === 'DEBUTANT' ? brand :
                          sujet.difficulte === 'INTERMEDIAIRE' ? blue : dark,
                        fontWeight: '600'
                      }}>
                        {formatDifficulte(sujet.difficulte)}
                      </Label>
                    </View>
                  </View>

                  {userLevel && (
                    <View style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.05)',
                      padding: 10,
                      borderRadius: 10,
                      marginTop: 15,
                      width: '100%'
                    }}>
                      <Label style={{
                        fontSize: 14,
                        color: dark,
                        textAlign: 'center',
                        flexWrap: 'wrap'
                      }}>
                        Votre niveau: <Label style={{ fontWeight: '600' }}>
                          {formatDifficulte(userLevel)}
                        </Label>
                      </Label>
                    </View>
                  )}

                  <View style={{
                    backgroundColor: debateType === "TEST" ? pink + '20' : blue + '20',
                    padding: 12,
                    borderRadius: 10,
                    marginTop: 20,
                    width: '100%',
                    borderWidth: 1,
                    borderColor: debateType === "TEST" ? pink + '40' : blue + '40'
                  }}>
                    <Label style={{
                      fontSize: 14,
                      color: dark,
                      fontStyle: 'italic',
                      fontWeight: '500',
                      textAlign: 'center'
                    }}>
                      {debateType === "TEST" ? "🎯 Débat évalué" : "🏋️ Débat d'entraînement"}
                    </Label>
                  </View>
                </SubjectContainer>
              </Shadow>

              {/* Guillemet droit */}
              <Quote
                source={require("../../assets/img/quote.png")}
                style={{
                  position: 'absolute',
                  bottom: -20,
                  right: 5,
                  zIndex: 10,
                  width: 40,
                  height: 40
                }}
              />
            </View>

            {/* Section Choix */}
            <View style={{ width: '100%', alignItems: 'center' }}>
              <Label style={{
                marginBottom: 30,
                color: white,
                fontSize: 22,
                fontWeight: '600',
                textAlign: 'center',
                width: '100%'
              }}>
                Êtes-vous :
              </Label>

              {loading ? (
                <View style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 40,
                  width: '100%'
                }}>
                  <ActivityIndicator size="large" color={white} />
                  <Label style={{
                    color: white,
                    marginTop: 20,
                    fontSize: 16,
                    textAlign: 'center'
                  }}>
                    Création du débat en cours...
                  </Label>
                </View>
              ) : (
                <>
                  {/* Bouton POUR */}
                  <WhiteButton
                    style={{
                      width: '100%',
                      marginBottom: 20,
                      backgroundColor: blue,
                      borderRadius: 12,
                      paddingVertical: 16,
                      shadowColor: blue,
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      elevation: 5
                    }}
                    onPress={() => handleChoice("POUR")}
                    disabled={loading}
                  >
                    <ButtonText style={{
                      color: white,
                      fontSize: 20,
                      fontWeight: 'bold',
                      textAlign: 'center'
                    }}>
                      POUR
                    </ButtonText>
                  </WhiteButton>

                  {/* Séparateur */}
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    width: '100%',
                    marginBottom: 20
                  }}>
                    <View style={{ 
                      flex: 1, 
                      height: 1, 
                      backgroundColor: 'rgba(255, 255, 255, 0.3)' 
                    }} />
                    <Label style={{
                      color: white,
                      marginHorizontal: 15,
                      fontSize: 16,
                      opacity: 0.7
                    }}>
                      ou
                    </Label>
                    <View style={{ 
                      flex: 1, 
                      height: 1, 
                      backgroundColor: 'rgba(255, 255, 255, 0.3)' 
                    }} />
                  </View>

                  {/* Bouton CONTRE */}
                  <WhiteButton
                    style={{
                      width: '100%',
                      backgroundColor: pink,
                      borderRadius: 12,
                      paddingVertical: 16,
                      marginBottom: 40,
                      shadowColor: pink,
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      elevation: 5
                    }}
                    onPress={() => handleChoice("CONTRE")}
                    disabled={loading}
                  >
                    <ButtonText style={{
                      color: white,
                      fontSize: 20,
                      fontWeight: 'bold',
                      textAlign: 'center'
                    }}>
                      CONTRE
                    </ButtonText>
                  </WhiteButton>

                  {/* Bouton Retour */}
                  <WhiteButton
                    style={{
                      width: '100%',
                      backgroundColor: 'transparent',
                      borderWidth: 1,
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                      borderRadius: 12,
                      paddingVertical: 14
                    }}
                    onPress={() => navigation.goBack()}
                    disabled={loading}
                  >
                    <ButtonText style={{
                      color: white,
                      fontSize: 16,
                      textAlign: 'center'
                    }}>
                      Changer de sujet
                    </ButtonText>
                  </WhiteButton>
                </>
              )}
            </View>
          </View>
        </InnerContainer>
      </ScrollView>
    </BackgroundContainer>
  );
};

export default Subject;