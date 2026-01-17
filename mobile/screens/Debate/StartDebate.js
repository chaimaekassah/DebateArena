import { View, ScrollView } from "react-native";
import React, { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";

import {
  BackgroundContainer,
  InnerContainer,
  ButtonText,
  Colors,
  Label,
  StyledButton,
  Shadow,
  SubjectContainer,
} from "../../components/styles";

const { blue, dark, white, brand, yellow, pink, lightPink, grey } = Colors;

const StartDebate = ({ navigation, route }) => {
  const {
    sujet,
    choixUtilisateur,
    debatId,
    type,
    status,
    dateDebut,
    duree,
    note,
  } = route.params || {};

  useEffect(() => {
    if (!sujet || !choixUtilisateur) {
      console.log("Données manquantes:", { sujet, choixUtilisateur });
      navigation.navigate("Home");
    }
  }, []);

  const handleStartDebate = () => {
    navigation.navigate("Chat", {
      debatId: debatId,
      sujet: sujet,
      choixUtilisateur: choixUtilisateur,
      type: type || "ENTRAINEMENT",
      status: status || "EN_COURS",
      dateDebut: dateDebut,
      duree: duree,
      note: note,
    });
  };

  // Formater la difficulté
  const formatDifficulte = (difficulte) => {
    const map = {
      DEBUTANT: "Débutant",
      INTERMEDIAIRE: "Intermédiaire",
      AVANCE: "Avancé",
    };
    return map[difficulte] || difficulte;
  };

  // Formater le choix
  const formatChoix = (choix) => {
    return choix === "POUR" ? "POUR" : "CONTRE";
  };

  // Formater le type
  const formatType = (type) => {
    const map = {
      ENTRAINEMENT: "Entraînement",
      TEST: "Test évalué",
    };
    return map[type] || type;
  };

  // Couleur selon le choix
  const getChoixColor = (choix) => {
    return choix === "POUR" ? blue : pink;
  };

  // Couleur selon la difficulté
  const getDifficultyColor = (difficulte) => {
    switch (difficulte) {
      case "DEBUTANT":
        return yellow;
      case "INTERMEDIAIRE":
        return blue;
      case "AVANCE":
        return pink;
      default:
        return brand;
    }
  };

  // Formater le temps
  const formatTime = (seconds) => {
    if (!seconds) return "Aucune limite";
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minute${minutes > 1 ? "s" : ""}`;
  };

  if (!sujet || !choixUtilisateur) {
    return (
      <BackgroundContainer
        source={require("../../assets/img/fond.png")}
        resizeMode="cover"
      >
        <InnerContainer
          style={{
            marginTop: 70,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Label style={{ fontSize: 20, marginBottom: 20, color: white }}>
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
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 30,
        }}
        showsVerticalScrollIndicator={false}
        bounces={true}
        alwaysBounceVertical={true}
        keyboardShouldPersistTaps="handled"
      >
        <InnerContainer
          style={{
            marginTop: 70,
            justifyContent: "flex-start",
            alignItems: "center",
            paddingBottom: 40,
            paddingHorizontal: 20,
          }}
        >
          {/* Titre avec icon */}
          <View style={{ alignItems: "center", marginBottom: 30, width: "100%" }}>
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 15,
                borderWidth: 2,
                borderColor: white,
              }}
            >
              <Ionicons name="chatbubbles" size={30} color={white} />
            </View>
            <Label
              style={{
                fontSize: 28,
                color: white,
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              Récapitulatif
            </Label>
            <Label
              style={{ fontSize: 16, color: lightPink, marginTop: 5 }}
            >
              Prêt à débattre ?
            </Label>
          </View>

          {/* Carte du sujet */}
          <Shadow style={{ width: "100%", marginBottom: 25 }}>
            <SubjectContainer
              style={{
                backgroundColor: white,
                borderRadius: 20,
                padding: 25,
                borderLeftWidth: 5,
                borderLeftColor: getDifficultyColor(sujet.difficulte),
              }}
            >
              <View style={{ flexDirection: "row", marginBottom: 15 }}>
                <Ionicons name="document-text" size={24} color={brand} />
                <Label
                  style={{
                    fontSize: 18,
                    color: dark,
                    marginLeft: 10,
                    fontWeight: "600",
                    flex: 1,
                    flexWrap: "wrap",
                  }}
                >
                  {sujet.titre}
                </Label>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 15,
                  flexWrap: "wrap",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons name="pricetag" size={16} color={grey} />
                  <Label
                    style={{ fontSize: 14, color: grey, marginLeft: 5 }}
                  >
                    {sujet.categorie}
                  </Label>
                </View>

                <View
                  style={{
                    backgroundColor:
                      getDifficultyColor(sujet.difficulte) + "20",
                    paddingHorizontal: 12,
                    paddingVertical: 4,
                    borderRadius: 15,
                    borderWidth: 1,
                    borderColor: getDifficultyColor(sujet.difficulte) + "40",
                    marginTop: 5,
                  }}
                >
                  <Label
                    style={{
                      fontSize: 12,
                      color: getDifficultyColor(sujet.difficulte),
                      fontWeight: "600",
                    }}
                  >
                    {formatDifficulte(sujet.difficulte)}
                  </Label>
                </View>
              </View>

              <View
                style={{
                  backgroundColor:
                    type === "TEST" ? pink + "20" : blue + "20",
                  paddingHorizontal: 15,
                  paddingVertical: 8,
                  borderRadius: 15,
                  alignSelf: "center",
                  borderWidth: 1,
                  borderColor: type === "TEST" ? pink + "40" : blue + "40",
                  marginTop: 10,
                }}
              >
                <Label
                  style={{
                    fontSize: 13,
                    color: type === "TEST" ? pink : blue,
                    fontWeight: "600",
                  }}
                >
                  <Ionicons
                    name={type === "TEST" ? "school" : "rocket"}
                    size={14}
                    style={{ marginRight: 5 }}
                  />
                  {formatType(type)}
                </Label>
              </View>
            </SubjectContainer>
          </Shadow>

          {/* Votre position */}
          <Label
            style={{
              fontSize: 18,
              marginBottom: 15,
              color: white,
              textAlign: "center",
              width: "100%",
            }}
          >
            Vous défendez la position :
          </Label>

          <View
            style={{
              backgroundColor: getChoixColor(choixUtilisateur),
              borderRadius: 25,
              paddingVertical: 18,
              paddingHorizontal: 30,
              marginBottom: 30,
              shadowColor: getChoixColor(choixUtilisateur),
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
              flexDirection: "row",
              alignItems: "center",
              width: "100%",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name={
                choixUtilisateur === "POUR"
                  ? "checkmark-circle"
                  : "close-circle"
              }
              size={28}
              color={white}
              style={{ marginRight: 10 }}
            />
            <Label
              style={{
                fontSize: 26,
                color: white,
                fontWeight: "bold",
                letterSpacing: 1,
                textAlign: "center",
              }}
            >
              {formatChoix(choixUtilisateur)}
            </Label>
          </View>

          {/* Instructions avec icônes */}
          <View
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              borderRadius: 15,
              padding: 20,
              width: "100%",
              marginBottom: 30,
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.1)",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                marginBottom: 10,
              }}
            >
              <Ionicons
                name={type === "TEST" ? "bulb" : "flame"}
                size={22}
                color={type === "TEST" ? pink : blue}
                style={{ marginTop: 2 }}
              />
              <Label
                style={{
                  fontSize: 15,
                  color: white,
                  marginLeft: 10,
                  flex: 1,
                  lineHeight: 22,
                }}
              >
                {type === "TEST"
                  ? "🎯 Ce débat sera évalué. Structurez vos arguments et soyez convaincant !"
                  : "🚀 Ceci est un débat d'entraînement. Explorez vos idées librement !"}
              </Label>
            </View>

            <View
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.03)",
                padding: 12,
                borderRadius: 10,
                marginTop: 10,
              }}
            >
              <Label
                style={{
                  fontSize: 13,
                  color: lightPink,
                  fontStyle: "italic",
                  textAlign: "center",
                }}
              >
                <Ionicons name="chatbubble-ellipses" size={12} /> L'IA
                répondra à vos arguments en temps réel
              </Label>
            </View>
          </View>

          {/* Informations du débat (simplifiées) */}
          <View
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.03)",
              borderRadius: 15,
              padding: 15,
              width: "100%",
              marginBottom: 30,
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.05)",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <Ionicons name="information-circle-outline" size={18} color={lightPink} />
              <Label
                style={{
                  fontSize: 14,
                  color: lightPink,
                  marginLeft: 8,
                  fontWeight: "500",
                }}
              >
                Détails du débat
              </Label>
            </View>

            {duree && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 8,
                  marginLeft: 5,
                }}
              >
                <Ionicons name="time-outline" size={14} color={yellow} />
                <Label
                  style={{
                    fontSize: 13,
                    color: lightPink,
                    marginLeft: 8,
                  }}
                >
                  Durée:{" "}
                  <Label style={{ color: white }}>{formatTime(duree)}</Label>
                </Label>
              </View>
            )}

            {status && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 8,
                  marginLeft: 5,
                }}
              >
                <Ionicons
                  name={
                    status === "EN_COURS"
                      ? "play-circle-outline"
                      : "checkmark-done-circle-outline"
                  }
                  size={14}
                  color={status === "EN_COURS" ? blue : pink}
                />
                <Label
                  style={{
                    fontSize: 13,
                    color: lightPink,
                    marginLeft: 8,
                  }}
                >
                  Statut:{" "}
                  <Label
                    style={{
                      color: status === "EN_COURS" ? blue : pink,
                    }}
                  >
                    {status === "EN_COURS" ? "En cours" : "Terminé"}
                  </Label>
                </Label>
              </View>
            )}
          </View>

          {/* Bouton Commencer */}
          <StyledButton
            onPress={handleStartDebate}
            style={{
              width: "100%",
              backgroundColor: yellow,
              borderRadius: 15,
              paddingVertical: 18,
              shadowColor: yellow,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
              marginBottom: 15,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons
                name="play"
                size={22}
                color={dark}
                style={{ marginRight: 10 }}
              />
              <ButtonText
                style={{ fontSize: 18, color: dark, fontWeight: "bold" }}
              >
                COMMENCER LE DÉBAT
              </ButtonText>
            </View>
          </StyledButton>

          {/* Bouton retour */}
          <StyledButton
            style={{
              width: "100%",
              backgroundColor: "transparent",
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.3)",
              borderRadius: 15,
              paddingVertical: 15,
              marginBottom: 20,
            }}
            onPress={() => navigation.goBack()}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons
                name="arrow-back"
                size={18}
                color={white}
                style={{ marginRight: 8 }}
              />
              <ButtonText style={{ color: white, fontSize: 15 }}>
                Changer de position
              </ButtonText>
            </View>
          </StyledButton>

          {/* Indicateur de progression */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 25,
              paddingHorizontal: 10,
              width: "100%",
            }}
          >
            <View
              style={{
                height: 4,
                flex: 1,
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderRadius: 2,
              }}
            >
              <View
                style={{
                  height: "100%",
                  width: "66%",
                  backgroundColor: blue,
                  borderRadius: 2,
                }}
              />
            </View>
            <Label
              style={{ fontSize: 12, color: lightPink, marginLeft: 10 }}
            >
              Étape 2/3
            </Label>
          </View>
        </InnerContainer>
      </ScrollView>
    </BackgroundContainer>
  );
};

export default StartDebate;