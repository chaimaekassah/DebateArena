import React, { useState, useRef, useEffect } from "react";
import { 
  ScrollView, 
  TextInput, 
  View, 
  KeyboardAvoidingView, 
  Platform,
  Alert,
  ActivityIndicator,
  TouchableOpacity
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { verifyToken } from '../../services/api';

import {
  BackgroundContainer,
  InnerContainer,
  Colors, 
  Label
} from "../../components/styles";

const { dark, white, brand, blue, green, pink, grey, lightPink, yellow } = Colors;

const Chat = ({ navigation, route }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [debateInfo, setDebateInfo] = useState(null);
  const [fetchingMessages, setFetchingMessages] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const scrollViewRef = useRef();
  
  const { debatId, sujet, type, choixUtilisateur } = route.params || {};

  useEffect(() => {
    const initializeChat = async () => {
      try {
        console.log("🚀 Initialisation chat pour débat:", debatId);
        
        if (!debatId) {
          Alert.alert("Erreur", "Aucun débat spécifié.");
          navigation.goBack();
          return;
        }
        
        // 0. Vérifier le token d'abord
        const isTokenValid = await verifyToken();
        if (!isTokenValid) {
          Alert.alert(
            "Session expirée",
            "Votre session a expiré. Veuillez vous reconnecter.",
            [
              {
                text: "Se reconnecter",
                onPress: async () => {
                  await AsyncStorage.clear();
                  navigation.navigate('Login');
                }
              }
            ]
          );
          return;
        }
        
        // 1. Récupérer les informations du débat
        await fetchDebateInfo();
        
        // 2. Récupérer les messages existants
        await fetchMessages();
        
        // 3. Démarrer le timer si nécessaire
        startTimer();
        
      } catch (error) {
        console.error("💥 Erreur initialisation chat:", error);
        Alert.alert("Erreur", "Impossible de charger le débat.");
        navigation.goBack();
      }
    };

    initializeChat();
  }, [debatId]);

  // Récupérer les informations du débat
  const fetchDebateInfo = async () => {
    try {
      setFetchingMessages(true);
      console.log(`🔍 Récupération infos débat ${debatId}...`);
      
      const response = await api.get(`/debats/${debatId}`);
      const debatData = response.data;
      setDebateInfo(debatData);
      
      console.log("✅ Débat chargé:", debatData);
      
      // Vérifier si le débat est terminé
      if (debatData.status === "TERMINE") {
        console.log("📌 Débat terminé - mode lecture seule");
      }
      
      return debatData;
    } catch (error) {
      console.error("❌ Erreur récupération débat:", error);
      
      if (error.response?.status === 404) {
        Alert.alert(
          "Débat non trouvé",
          "Ce débat n'existe pas ou a été supprimé.",
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
        return null;
      } else if (error.response?.status === 403) {
        Alert.alert(
          "Accès refusé",
          "Vous n'avez pas accès à ce débat.",
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
        return null;
      }
      
      throw error;
    } finally {
      setFetchingMessages(false);
    }
  };

  // Récupérer les messages existants
  const fetchMessages = async () => {
    try {
      console.log(`📨 Récupération messages débat ${debatId}...`);
      
      const response = await api.get(`/debats/${debatId}/messages`);
      const apiMessages = response.data || [];
      
      console.log(`📊 ${apiMessages.length} messages récupérés depuis l'API`);
      
      // Transformer les messages de l'API selon le bon format
      const formattedMessages = apiMessages.map(msg => ({
        id: msg.id?.toString() || `msg-${Date.now()}-${Math.random()}`,
        role: msg.auteur === "CHATBOT" ? "ai" : "user",
        text: msg.contenu || "",
        timestamp: msg.timestamp
      }));
      
      setMessages(formattedMessages);
      
      // Si pas de messages, ajouter un message de bienvenue
      if (formattedMessages.length === 0) {
        const currentInfo = debateInfo || { sujet: { titre: "ce sujet" }, choixUtilisateur: "POUR" };
        const welcomeMessage = {
          id: 'welcome-1',
          role: "ai",
          text: `Bonjour ! Commençons notre débat sur "${currentInfo.sujet?.titre || 'ce sujet'}"\n\nVous défendez la position ${currentInfo.choixUtilisateur === "POUR" ? "POUR" : "CONTRE"}.`,
          timestamp: new Date().toISOString()
        };
        setMessages([welcomeMessage]);
      }
      
    } catch (error) {
      console.error("❌ Erreur récupération messages:", error);
      
      if (error.response?.status === 404) {
        Alert.alert(
          "Débat non trouvé",
          "Ce débat n'existe plus.",
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
        return;
      } else if (error.response?.status === 403) {
        Alert.alert(
          "Accès refusé",
          "Vous n'avez pas accès aux messages de ce débat.",
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
        return;
      }
      
      // Si erreur mais qu'on a des infos, afficher un message d'accueil
      if (debateInfo || sujet) {
        const welcomeMessage = {
          id: 'welcome-error',
          role: "ai",
          text: `Bonjour ! Commençons notre débat sur "${debateInfo?.sujet?.titre || sujet?.titre || 'ce sujet'}"\n\nVous défendez la position ${debateInfo?.choixUtilisateur || choixUtilisateur || "POUR" === "POUR" ? "POUR" : "CONTRE"}.`,
          timestamp: new Date().toISOString()
        };
        setMessages([welcomeMessage]);
      }
    }
  };

  // Timer
  const startTimer = () => {
    if (debateInfo?.dateDebut && debateInfo?.duree) {
      try {
        const startTime = new Date(debateInfo.dateDebut).getTime();
        const endTime = startTime + (debateInfo.duree * 1000);
        const now = new Date().getTime();
        
        if (now < endTime) {
          const remainingSeconds = Math.floor((endTime - now) / 1000);
          setTimeRemaining(remainingSeconds);
          
          const timer = setInterval(() => {
            setTimeRemaining(prev => {
              if (prev <= 1) {
                clearInterval(timer);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
          
          return () => clearInterval(timer);
        } else {
          setTimeRemaining(0);
        }
      } catch (error) {
        console.error("❌ Erreur timer:", error);
      }
    }
  };

  // Formater le temps
  const formatTime = (seconds) => {
    if (seconds === null || seconds === undefined || seconds < 0) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Envoyer un message
  const sendMessage = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;
    
    if (!debatId) {
      Alert.alert("Erreur", "Aucun débat actif.");
      return;
    }

    // Vérifier si le débat est terminé
    if (debateInfo?.status === "TERMINE") {
      Alert.alert("Débat terminé", "Vous ne pouvez plus envoyer de messages.");
      return;
    }

    // Créer le message utilisateur local
    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: trimmedInput,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      console.log(`📤 Envoi message au débat ${debatId}:`, trimmedInput.substring(0, 50) + '...');
      
      // Envoyer au backend
      const response = await api.post(`/debats/${debatId}/messages`, {
        contenu: trimmedInput
      });
      
      console.log("✅ Réponse backend reçue:", response.data);
      
      // La réponse du backend contient le message du chatbot
      const aiMessage = {
        id: response.data.id?.toString() || `ai-${Date.now()}`,
        role: "ai",
        text: response.data.contenu || "",
        timestamp: response.data.timestamp || new Date().toISOString()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
    } catch (error) {
      console.error("❌ Erreur envoi message:", error);
      
      // Annuler l'affichage du message utilisateur en cas d'erreur
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
      
      let errorMessage = "Impossible d'envoyer le message.";
      
      if (error.response?.status === 400) {
        errorMessage = "Message vide ou débat terminé.";
      } else if (error.response?.status === 404) {
        errorMessage = "Débat non trouvé.";
      } else if (error.response?.status === 403) {
        errorMessage = "Accès refusé. Vous n'avez pas la permission d'envoyer des messages à ce débat.";
      }
      
      Alert.alert("Erreur", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Terminer le débat
  const handleFinishDebate = async () => {
    if (debateInfo?.status === "TERMINE") {
      Alert.alert("Débat déjà terminé", "Ce débat est déjà terminé.");
      return;
    }

    Alert.alert(
      "Terminer le débat",
      "Êtes-vous sûr de vouloir terminer ce débat ?",
      [
        { 
          text: "Annuler", 
          style: "cancel" 
        },
        { 
          text: "Terminer", 
          onPress: async () => {
            try {
              setLoading(true);
              
              // Appel API pour terminer le débat
              console.log(`🏁 Terminaison du débat ${debatId}...`);
              const response = await api.post(`/debats/${debatId}/terminer`);
              const updatedDebat = response.data;
              setDebateInfo(updatedDebat);
              
              console.log("✅ Débat terminé:", updatedDebat);
              
              // Si c'est un test, évaluer automatiquement
              const debatType = updatedDebat.type || type;
              if (debatType === "TEST") {
                console.log("🎯 C'est un test - lancement de l'évaluation...");
                await handleEvaluation();
              } else {
                Alert.alert(
                  "✅ Débat terminé",
                  "Votre débat d'entraînement est terminé.",
                  [
                    { 
                      text: "OK", 
                      onPress: () => navigation.navigate("Dashboard") 
                    }
                  ]
                );
              }
            } catch (error) {
              console.error("❌ Erreur terminaison débat:", error);
              
              if (error.response?.status === 400) {
                Alert.alert("Erreur", "Ce débat est déjà terminé.");
              } else if (error.response?.status === 404) {
                Alert.alert("Erreur", "Débat non trouvé.");
              } else if (error.response?.status === 403) {
                Alert.alert("Erreur", "Vous n'avez pas la permission de terminer ce débat.");
              } else {
                Alert.alert("Erreur", "Impossible de terminer le débat.");
              }
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // Évaluation pour les tests - CORRIGÉ
  const handleEvaluation = async () => {
    try {
      console.log(`📝 Évaluation du test ${debatId}...`);
      const response = await api.post(`/debats/${debatId}/evaluation`);
      
      console.log("✅ Évaluation reçue:", response.data);
      
      // Rafraîchir les infos du débat pour avoir la note
      const updatedInfo = await fetchDebateInfo();
      const note = updatedInfo?.note || response.data?.note || "N/A";
      
      // Rediriger vers la page de résultats
      navigation.navigate("DebateResult", { 
        debatId, 
        note,
        sujet: updatedInfo?.sujet || sujet,
        type: updatedInfo?.type || type,
        choixUtilisateur: updatedInfo?.choixUtilisateur || choixUtilisateur
      });
      
    } catch (error) {
      console.error("❌ Erreur évaluation:", error);
      
      if (error.response?.status === 400) {
        Alert.alert("Erreur", "Ce débat n'est pas un TEST et ne peut pas être évalué.");
      } else if (error.response?.status === 404) {
        Alert.alert("Erreur", "Débat non trouvé pour l'évaluation.");
      } else {
        // Rediriger quand même vers les résultats avec la note existante
        const note = debateInfo?.note || "N/A";
        navigation.navigate("DebateResult", { 
          debatId, 
          note,
          sujet: debateInfo?.sujet || sujet,
          type: debateInfo?.type || type,
          choixUtilisateur: debateInfo?.choixUtilisateur || choixUtilisateur
        });
      }
    }
  };

  // Annuler le débat
  const handleCancelDebate = async () => {
    if (debateInfo?.status === "TERMINE") {
      Alert.alert("Débat terminé", "Impossible d'annuler un débat déjà terminé.");
      return;
    }

    Alert.alert(
      "Annuler le débat",
      "Êtes-vous sûr de vouloir annuler ce débat ? Cette action est irréversible.",
      [
        { 
          text: "Non", 
          style: "cancel" 
        },
        { 
          text: "Oui, annuler", 
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              
              console.log(`🗑️ Annulation du débat ${debatId}...`);
              await api.delete(`/debats/${debatId}`);
              
              Alert.alert(
                "✅ Débat annulé",
                "Le débat a été annulé avec succès.",
                [
                  { 
                    text: "OK", 
                    onPress: () => navigation.navigate("Home") 
                  }
                ]
              );
            } catch (error) {
              console.error("❌ Erreur annulation débat:", error);
              
              if (error.response?.status === 400) {
                Alert.alert("Erreur", "Impossible d'annuler un débat déjà terminé.");
              } else if (error.response?.status === 404) {
                Alert.alert("Erreur", "Débat non trouvé.");
              } else if (error.response?.status === 403) {
                Alert.alert("Erreur", "Vous n'avez pas la permission d'annuler ce débat.");
              } else {
                Alert.alert("Erreur", "Impossible d'annuler le débat.");
              }
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // Formater la difficulté
  const getDifficultyText = (difficulte) => {
    if (!difficulte) return '';
    const map = {
      'DEBUTANT': 'Débutant',
      'INTERMEDIAIRE': 'Intermédiaire',
      'AVANCE': 'Avancé',
      'FACILE': 'Facile',
      'DIFFICILE': 'Difficile'
    };
    return map[difficulte] || difficulte;
  };

  // Couleur selon la difficulté
  const getDifficultyColor = (difficulte) => {
    if (!difficulte) return grey;
    switch(difficulte.toUpperCase()) {
      case 'DEBUTANT':
      case 'FACILE': return green;
      case 'INTERMEDIAIRE': return yellow;
      case 'AVANCE':
      case 'DIFFICILE': return pink;
      default: return grey;
    }
  };

  // Obtenir le titre du sujet
  const getDebateTitle = () => {
    return debateInfo?.sujet?.titre || sujet?.titre || "Débat";
  };

  // Obtenir la position de l'utilisateur
  const getUserPosition = () => {
    return debateInfo?.choixUtilisateur || choixUtilisateur || "POUR";
  };

  // Obtenir la difficulté
  const getDebateDifficulty = () => {
    return debateInfo?.sujet?.difficulte || sujet?.difficulte;
  };

  // Obtenir le type de débat
  const getDebateType = () => {
    return debateInfo?.type || type || "ENTRAINEMENT";
  };

  // Fonction pour scroller vers le bas
  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // Scroller vers le bas quand les messages changent
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (fetchingMessages && messages.length === 0) {
    return (
      <BackgroundContainer 
        source={require("../../assets/img/fond.png")} 
        style={{ flex: 1 }}
      >
        <InnerContainer style={{
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center',
          padding: 20
        }}>
          <ActivityIndicator size="large" color={white} />
          <Label style={{
            color: white, 
            marginTop: 20,
            fontSize: 18,
            textAlign: 'center'
          }}>
            Chargement du débat...
          </Label>
        </InnerContainer>
      </BackgroundContainer>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <BackgroundContainer 
        source={require("../../assets/img/fond.png")} 
        style={{ flex: 1 }}
      >
        {/* Bouton retour en haut à gauche */}
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={{
            position: 'absolute',
            top: 50,
            left: 10, // RAPPROCHÉ DU BORD
            zIndex: 100,
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.3)'
          }}
        >
          <Ionicons name="arrow-back" size={24} color={white} />
        </TouchableOpacity>

        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={{ 
            padding: 8, // TRÈS RÉDUIT
            paddingTop: 90, // RÉDUIT
            paddingBottom: 140 // RÉDUIT
          }}
          showsVerticalScrollIndicator={false}
        >
          <InnerContainer>
            {/* En-tête avec informations du débat - PADDING MINIMAL */}
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              marginBottom: 16, // RÉDUIT
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              borderRadius: 12, // RÉDUIT
              padding: 10, // TRÈS RÉDUIT
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.1)'
            }}>
              {/* Icône type de débat */}
              <View style={{
                width: 36, // RÉDUIT
                height: 36, // RÉDUIT
                borderRadius: 18, // RÉDUIT
                backgroundColor: getDebateType() === "TEST" ? pink + '20' : blue + '20',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 10, // RÉDUIT
                borderWidth: 1,
                borderColor: getDebateType() === "TEST" ? pink + '40' : blue + '40'
              }}>
                <Ionicons 
                  name={getDebateType() === "TEST" ? "school" : "rocket"} 
                  size={18} // RÉDUIT
                  color={getDebateType() === "TEST" ? pink : blue} 
                />
              </View>
              
              <View style={{ flex: 1 }}>
                {/* Titre du sujet */}
                <Label style={{
                  fontSize: 16, // RÉDUIT
                  color: white, 
                  fontWeight: '600',
                  marginBottom: 3 // RÉDUIT
                }}>
                  {getDebateTitle()}
                </Label>
                
                {/* Informations du débat */}
                <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                  {/* Position */}
                  <View style={{
                    backgroundColor: getUserPosition() === "POUR" ? blue + '30' : pink + '30',
                    paddingHorizontal: 8, // RÉDUIT
                    paddingVertical: 3, // RÉDUIT
                    borderRadius: 10, // RÉDUIT
                    marginRight: 6, // RÉDUIT
                    marginBottom: 3, // RÉDUIT
                    borderWidth: 1,
                    borderColor: getUserPosition() === "POUR" ? blue + '50' : pink + '50'
                  }}>
                    <Label style={{
                      fontSize: 11, // RÉDUIT
                      color: getUserPosition() === "POUR" ? blue : pink,
                      fontWeight: '600'
                    }}>
                      {getUserPosition() === "POUR" ? "POUR" : "CONTRE"}
                    </Label>
                  </View>
                  
                  {/* Difficulté */}
                  {getDebateDifficulty() && (
                    <View style={{
                      backgroundColor: getDifficultyColor(getDebateDifficulty()) + '30',
                      paddingHorizontal: 8, // RÉDUIT
                      paddingVertical: 3, // RÉDUIT
                      borderRadius: 10, // RÉDUIT
                      marginRight: 6, // RÉDUIT
                      marginBottom: 3, // RÉDUIT
                      borderWidth: 1,
                      borderColor: getDifficultyColor(getDebateDifficulty()) + '50'
                    }}>
                      <Label style={{
                        fontSize: 10, // RÉDUIT
                        color: getDifficultyColor(getDebateDifficulty()),
                        fontWeight: '600'
                      }}>
                        {getDifficultyText(getDebateDifficulty())}
                      </Label>
                    </View>
                  )}
                  
                  {/* Statut */}
                  <View style={{
                    backgroundColor: debateInfo?.status === "TERMINE" ? grey + '30' : green + '30',
                    paddingHorizontal: 6, // RÉDUIT
                    paddingVertical: 3, // RÉDUIT
                    borderRadius: 10, // RÉDUIT
                    marginBottom: 3, // RÉDUIT
                    borderWidth: 1,
                    borderColor: debateInfo?.status === "TERMINE" ? grey + '50' : green + '50'
                  }}>
                    <Label style={{
                      fontSize: 10, // RÉDUIT
                      color: debateInfo?.status === "TERMINE" ? grey : green,
                      fontWeight: '600'
                    }}>
                      {debateInfo?.status === "TERMINE" ? "TERMINÉ" : "EN COURS"}
                    </Label>
                  </View>
                </View>
                
                {/* Timer si présent */}
                {timeRemaining !== null && debateInfo?.status !== "TERMINE" && (
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: 6, // RÉDUIT
                    backgroundColor: timeRemaining < 60 ? pink + '20' : yellow + '20',
                    paddingHorizontal: 6, // RÉDUIT
                    paddingVertical: 3, // RÉDUIT
                    borderRadius: 10, // RÉDUIT
                    borderWidth: 1,
                    borderColor: timeRemaining < 60 ? pink + '40' : yellow + '40',
                    alignSelf: 'flex-start'
                  }}>
                    <Ionicons 
                      name="time-outline" 
                      size={10} // RÉDUIT
                      color={timeRemaining < 60 ? pink : yellow} 
                    />
                    <Label style={{
                      fontSize: 10, // RÉDUIT
                      color: timeRemaining < 60 ? pink : yellow,
                      fontWeight: '600',
                      marginLeft: 3 // RÉDUIT
                    }}>
                      {formatTime(timeRemaining)}
                    </Label>
                  </View>
                )}
                
                {/* Note si disponible */}
                {debateInfo?.note && (
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: 6, // RÉDUIT
                    backgroundColor: green + '20',
                    paddingHorizontal: 6, // RÉDUIT
                    paddingVertical: 3, // RÉDUIT
                    borderRadius: 10, // RÉDUIT
                    borderWidth: 1,
                    borderColor: green + '40',
                    alignSelf: 'flex-start'
                  }}>
                    <Ionicons name="ribbon" size={10} color={green} />
                    <Label style={{
                      fontSize: 10, // RÉDUIT
                      color: green,
                      fontWeight: '600',
                      marginLeft: 3 // RÉDUIT
                    }}>
                      Note: {debateInfo.note}/20
                    </Label>
                  </View>
                )}
              </View>
            </View>

            {/* Messages - PADDING MINIMAL */}
            <View style={{ marginBottom: 16 }}>
              {messages.map((msg, index) => (
                <View
                  key={msg.id || index}
                  style={{
                    marginBottom: 12, // RÉDUIT
                    maxWidth: "100%",
                    alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                    width: "100%"
                  }}
                >
                  <View style={{ 
                    flexDirection: "row",
                    alignItems: "flex-start",
                    justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                    width: "100%"
                  }}>
                    {msg.role === "ai" && (
                      <View style={{
                        width: 28, // RÉDUIT
                        height: 28, // RÉDUIT
                        borderRadius: 14, // RÉDUIT
                        backgroundColor: blue + '30',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginRight: 6, // RÉDUIT
                        borderWidth: 1,
                        borderColor: blue + '50'
                      }}>
                        <Ionicons name="chatbubble" size={14} color={blue} />
                      </View>
                    )}

                    <View style={{
                      backgroundColor: msg.role === "user" ? blue : white,
                      borderRadius: 16, // RÉDUIT
                      borderTopLeftRadius: msg.role === "user" ? 16 : 4,
                      borderTopRightRadius: msg.role === "user" ? 4 : 16,
                      paddingHorizontal: 14, // RÉDUIT
                      paddingVertical: 10, // RÉDUIT
                      maxWidth: "80%",
                      minWidth: "20%",
                      borderWidth: 1,
                      borderColor: msg.role === "user" ? blue + '50' : grey + '30',
                      shadowColor: "#000",
                      shadowOffset: {
                        width: 0,
                        height: 1,
                      },
                      shadowOpacity: 0.1,
                      shadowRadius: 2,
                      elevation: 2
                    }}>
                      <Label style={{
                        color: msg.role === "user" ? white : dark,
                        fontSize: 14, // LÉGÈREMENT RÉDUIT
                        lineHeight: 18 // RÉDUIT
                      }}>
                        {msg.text}
                      </Label>
                    </View>

                    {msg.role === "user" && (
                      <View style={{
                        width: 28, // RÉDUIT
                        height: 28, // RÉDUIT
                        borderRadius: 14, // RÉDUIT
                        backgroundColor: lightPink + '30',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginLeft: 6, // RÉDUIT
                        borderWidth: 1,
                        borderColor: lightPink + '50'
                      }}>
                        <Ionicons name="person" size={14} color={lightPink} />
                      </View>
                    )}
                  </View>
                </View>
              ))}

              {loading && (
                <View style={{ 
                  flexDirection: "row", 
                  alignSelf: "flex-start", 
                  alignItems: "center",
                  marginBottom: 12 // RÉDUIT
                }}>
                  <View style={{
                    width: 28, // RÉDUIT
                    height: 28, // RÉDUIT
                    borderRadius: 14, // RÉDUIT
                    backgroundColor: blue + '30',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 6, // RÉDUIT
                    borderWidth: 1,
                    borderColor: blue + '50'
                  }}>
                    <Ionicons name="chatbubble" size={14} color={blue} />
                  </View>
                  
                  <View style={{
                    backgroundColor: white,
                    borderRadius: 16, // RÉDUIT
                    borderTopLeftRadius: 4,
                    paddingHorizontal: 14, // RÉDUIT
                    paddingVertical: 10, // RÉDUIT
                    borderWidth: 1,
                    borderColor: grey + '30',
                    shadowColor: "#000",
                    shadowOffset: {
                      width: 0,
                      height: 1,
                    },
                    shadowOpacity: 0.1,
                    shadowRadius: 2,
                    elevation: 2
                  }}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <ActivityIndicator size="small" color={blue} />
                      <Label style={{
                        color: dark,
                        marginLeft: 8, // RÉDUIT
                        fontSize: 13, // RÉDUIT
                        fontStyle: 'italic'
                      }}>
                        Réflexion...
                      </Label>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </InnerContainer>
        </ScrollView>

        {/* Zone de saisie et actions - PADDING MINIMAL */}
        <View style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: dark + 'E6',
          padding: 10, // TRÈS RÉDUIT
          paddingBottom: Platform.OS === 'ios' ? 25 : 12, // RÉDUIT
          borderTopWidth: 1,
          borderTopColor: 'rgba(255, 255, 255, 0.1)'
        }}>
          <View style={{
            flexDirection: "row",
            alignItems: "center"
          }}>
            <View style={{
              flex: 1,
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              borderRadius: 20, // RÉDUIT
              paddingHorizontal: 12, // RÉDUIT
              paddingVertical: 6, // RÉDUIT
              marginRight: 10, // RÉDUIT
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.1)'
            }}>
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder="Écrivez votre message..."
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                style={{
                  fontSize: 14, // RÉDUIT
                  color: white,
                  minHeight: 32, // RÉDUIT
                  maxHeight: 80 // RÉDUIT
                }}
                multiline
                onSubmitEditing={sendMessage}
                returnKeyType="send"
                editable={!loading && debateInfo?.status !== "TERMINE"}
              />
            </View>
            
            <TouchableOpacity 
              onPress={sendMessage}
              disabled={loading || !input.trim() || debateInfo?.status === "TERMINE"}
              style={{
                width: 44, // RÉDUIT
                height: 44, // RÉDUIT
                borderRadius: 22, // RÉDUIT
                backgroundColor: input.trim() && debateInfo?.status !== "TERMINE" ? blue : 'rgba(255, 255, 255, 0.2)',
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: input.trim() && debateInfo?.status !== "TERMINE" ? blue + '50' : 'rgba(255, 255, 255, 0.1)'
              }}
            >
              {loading ? (
                <ActivityIndicator size="small" color={white} />
              ) : (
                <Ionicons 
                  name="send" 
                  size={20} // RÉDUIT
                  color={input.trim() && debateInfo?.status !== "TERMINE" ? white : 'rgba(255, 255, 255, 0.5)'} 
                />
              )}
            </TouchableOpacity>
          </View>

          {/* Boutons d'actions */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 10 // RÉDUIT
          }}>
            {/* Bouton annuler (seulement si débat en cours et pas terminé) */}
            {debateInfo?.status !== "TERMINE" && (
              <TouchableOpacity 
                style={{
                  flex: 1,
                  marginRight: 5, // RÉDUIT
                  backgroundColor: pink + '20',
                  paddingVertical: 10, // RÉDUIT
                  borderRadius: 10, // RÉDUIT
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: pink + '40'
                }}
                onPress={handleCancelDebate}
                disabled={loading || debateInfo?.status === "TERMINE"}
              >
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Ionicons 
                    name="close-circle" 
                    size={16} // RÉDUIT
                    color={pink} 
                  />
                  <Label style={{
                    color: pink, 
                    fontSize: 13, // RÉDUIT
                    fontWeight: '600',
                    marginLeft: 6 // RÉDUIT
                  }}>
                    Annuler
                  </Label>
                </View>
              </TouchableOpacity>
            )}
            
            {/* Bouton terminer */}
            <TouchableOpacity 
              style={{
                flex: 1,
                marginLeft: debateInfo?.status !== "TERMINE" ? 5 : 0, // RÉDUIT
                backgroundColor: debateInfo?.status === "TERMINE" ? 'rgba(255, 255, 255, 0.1)' : green + '30',
                paddingVertical: 10, // RÉDUIT
                borderRadius: 10, // RÉDUIT
                alignItems: 'center',
                borderWidth: 1,
                borderColor: debateInfo?.status === "TERMINE" ? 'rgba(255, 255, 255, 0.1)' : green + '50'
              }}
              onPress={handleFinishDebate}
              disabled={loading || debateInfo?.status === "TERMINE"}
            >
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Ionicons 
                  name={debateInfo?.status === "TERMINE" ? "checkmark-done" : "flag"} 
                  size={16} // RÉDUIT
                  color={debateInfo?.status === "TERMINE" ? 'rgba(255, 255, 255, 0.5)' : green} 
                />
                <Label style={{
                  color: debateInfo?.status === "TERMINE" ? 'rgba(255, 255, 255, 0.5)' : green, 
                  fontSize: 13, // RÉDUIT
                  fontWeight: '600',
                  marginLeft: 6 // RÉDUIT
                }}>
                  {debateInfo?.status === "TERMINE" ? "Terminé" : "Terminer"}
                </Label>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </BackgroundContainer>
    </KeyboardAvoidingView>
  );
};

export default Chat;