import React, { useState, useRef, useEffect } from "react";
import { 
  ScrollView, 
  TextInput, 
  View, 
  Image, 
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
  TextBubble,
  Quote,
  Colors, 
  Shadow,
  Label, 
  SubjectContainer,
  StyledTextInput
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
  
  const { debatId, sujet, type, choixUtilisateur, status, dateDebut, duree } = route.params || {};

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
        
        // 1. Vérifier l'accès au débat - SI ÉCHEC, ARRÊTER
        const hasAccess = await checkDebateAccess();
        if (!hasAccess) {
          // La fonction checkDebateAccess affiche déjà une alerte
          return;
        }
        
        // 2. Récupérer les informations du débat
        await fetchDebateInfo();
        
        // 3. Récupérer les messages existants
        await fetchMessages();
        
        // 4. Démarrer le timer si nécessaire
        startTimer();
        
      } catch (error) {
        console.error("💥 Erreur initialisation chat:", error);
        Alert.alert("Erreur", "Impossible de charger le débat.");
        navigation.goBack();
      }
    };

    initializeChat();
  }, [debatId]);

  // Vérifier l'accès au débat
  const checkDebateAccess = async () => {
    try {
      console.log(`🔍 Vérification accès pour débat ${debatId}...`);
      
      // 1. Vérifier d'abord dans mes débats
      const mesDebatsResponse = await api.get('/debats/mes-debats');
      const mesDebats = mesDebatsResponse.data || [];
      const debatTrouve = mesDebats.find(d => d.id === parseInt(debatId));
      
      if (debatTrouve) {
        console.log('✅ Débat trouvé dans mes débats');
        return true;
      }
      
      // 2. Si non trouvé, vérifier accès direct
      console.log('⚠️ Débat non trouvé dans mes débats, vérification accès direct...');
      try {
        const response = await api.get(`/debats/${debatId}`);
        console.log('✅ Accès autorisé au débat');
        return true;
      } catch (directError) {
        if (directError.response?.status === 403 || directError.response?.status === 404) {
          console.log('❌ Accès direct refusé');
          showAccessDeniedAlert();
          return false;
        }
        throw directError;
      }
        
    } catch (error) {
      console.error("❌ Erreur vérification accès:", error);
      
      // Si erreur 401 (token invalide)
      if (error.response?.status === 401) {
        Alert.alert(
          "Session expirée",
          "Votre session a expiré. Veuillez vous reconnecter.",
          [
            {
              text: "OK",
              onPress: async () => {
                await AsyncStorage.clear();
                navigation.navigate('Login');
              }
            }
          ]
        );
        return false;
      }
      
      showAccessDeniedAlert();
      return false;
    }
  };

  const showAccessDeniedAlert = () => {
    Alert.alert(
      "Accès refusé",
      "Vous n'avez pas accès à ce débat.",
      [
        {
          text: "Voir mes débats",
          onPress: () => navigation.navigate('DebatsList')
        },
        {
          text: "Retour",
          onPress: () => navigation.goBack()
        }
      ]
    );
  };

  // Récupérer les informations du débat
  const fetchDebateInfo = async () => {
    try {
      setFetchingMessages(true);
      console.log(`🔍 Récupération infos débat ${debatId}...`);
      
      const response = await api.get(`/debats/${debatId}`);
      setDebateInfo(response.data);
      
      console.log("✅ Débat chargé:", response.data);
      
      if (response.data.status === "TERMINE") {
        Alert.alert(
          "Débat terminé",
          "Ce débat est terminé. Vous ne pouvez plus envoyer de messages.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("❌ Erreur récupération débat:", error);
      throw error;
    } finally {
      setFetchingMessages(false);
    }
  };

  // Récupérer les messages existants
  const fetchMessages = async () => {
    try {
      setFetchingMessages(true);
      console.log(`📨 Récupération messages débat ${debatId}...`);
      
      const response = await api.get(`/debats/${debatId}/messages`);
      
      // Transformer les messages de l'API
      const formattedMessages = response.data.map(msg => ({
        id: msg.id.toString(),
        role: msg.auteur === "CHATBOT" ? "ai" : "user",
        text: msg.contenu,
        timestamp: msg.timestamp
      }));
      
      console.log(`✅ ${formattedMessages.length} messages récupérés`);
      setMessages(formattedMessages);
      
    } catch (error) {
      console.error("❌ Erreur récupération messages:", error);
      
      // Si 403, c'est que l'utilisateur n'a pas accès aux messages
      if (error.response?.status === 403) {
        Alert.alert(
          "Permission refusée",
          "Vous n'avez pas la permission d'accéder aux messages de ce débat.",
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
        return;
      }
      
      // Si pas de messages, ajouter un message de bienvenue
      if (messages.length === 0) {
        const welcomeMessage = {
          id: 'welcome-1',
          role: "ai",
          text: `Bonjour ! Commençons notre débat sur "${sujet?.titre || 'ce sujet'}"\n\nVous défendez la position ${choixUtilisateur === "POUR" ? "POUR" : "CONTRE"}.`,
          timestamp: new Date().toISOString()
        };
        setMessages([welcomeMessage]);
      }
    } finally {
      setFetchingMessages(false);
    }
  };

  // Timer
  const startTimer = () => {
    if (dateDebut && duree) {
      const startTime = new Date(dateDebut).getTime();
      const endTime = startTime + (duree * 1000);
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
    }
  };

  // Formater le temps
  const formatTime = (seconds) => {
    if (seconds === null || seconds === undefined) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Envoyer un message
  const sendMessage = async () => {
    if (!input.trim()) return;
    if (!debatId) {
      Alert.alert("Erreur", "Aucun débat actif.");
      return;
    }

    // Vérifier si le débat est terminé
    if (debateInfo?.status === "TERMINE") {
      Alert.alert("Débat terminé", "Vous ne pouvez plus envoyer de messages.");
      return;
    }

    // Vérifier si l'utilisateur a toujours accès
    try {
      // Vérification rapide avant envoi
      await api.get(`/debats/${debatId}`);
    } catch (accessError) {
      if (accessError.response?.status === 403 || accessError.response?.status === 404) {
        Alert.alert(
          "Accès perdu",
          "Vous n'avez plus accès à ce débat. Redirection...",
          [
            { 
              text: "OK", 
              onPress: () => {
                navigation.navigate('DebatsList');
              }
            }
          ]
        );
        return;
      }
    }

    // Créer le message utilisateur local
    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = input;
    setInput("");
    setLoading(true);

    try {
      console.log(`📤 Envoi message réel au débat ${debatId}:`, messageToSend);
      
      // Envoyer au backend
      const response = await api.post(`/debats/${debatId}/messages`, {
        contenu: messageToSend
      });
      
      console.log("✅ Réponse backend:", response.data);
      
      // Ajouter la réponse du chatbot
      const aiMessage = {
        id: response.data.id.toString(),
        role: "ai",
        text: response.data.contenu,
        timestamp: response.data.timestamp
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
    } catch (error) {
      console.error("❌ Erreur envoi message:", error);
      
      // Annuler l'affichage du message utilisateur en cas d'erreur
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
      
      let errorMessage = "Impossible d'envoyer le message.";
      
      if (error.response?.status === 403) {
        errorMessage = "Accès refusé au débat.";
      } else if (error.response?.status === 400) {
        errorMessage = "Message invalide ou débat terminé.";
      } else if (error.response?.status === 404) {
        errorMessage = "Débat non trouvé.";
      }
      
      Alert.alert("Erreur", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Terminer le débat
  const handleFinishDebate = async () => {
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
              
              const response = await api.post(`/debats/${debatId}/terminer`);
              setDebateInfo(response.data);
              
              if (type === "TEST") {
                // Pour un test, évaluer
                await handleEvaluation();
              } else {
                Alert.alert(
                  "✅ Débat terminé",
                  "Votre débat d'entraînement est terminé.",
                  [
                    { 
                      text: "OK", 
                      onPress: () => navigation.navigate("Home") 
                    }
                  ]
                );
              }
            } catch (error) {
              console.error("❌ Erreur terminaison débat:", error);
              
              if (error.response?.status === 403) {
                Alert.alert("Permission refusée", "Vous n'avez pas la permission de terminer ce débat.");
              } else if (error.response?.status === 400) {
                Alert.alert("Débat déjà terminé", "Ce débat est déjà terminé.");
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

  // Évaluation pour les tests
  const handleEvaluation = async () => {
    try {
      const response = await api.post(`/debats/${debatId}/evaluation`);
      const note = debateInfo?.note || response.data?.note || "Non évalué";
      
      Alert.alert(
        "🎯 Test terminé !",
        `Votre note: ${note}/20`,
        [
          { 
            text: "OK", 
            onPress: () => navigation.navigate("Home") 
          }
        ]
      );
    } catch (error) {
      console.error("❌ Erreur évaluation:", error);
      Alert.alert(
        "Test terminé",
        `Votre note: ${debateInfo?.note || "Non évalué"}/20`,
        [{ text: "OK", onPress: () => navigation.navigate("Home") }]
      );
    }
  };

  // Formater la difficulté
  const getDifficultyText = (difficulte) => {
    if (!difficulte) return '';
    const map = {
      'DEBUTANT': 'Débutant',
      'INTERMEDIAIRE': 'Intermédiaire',
      'AVANCE': 'Avancé'
    };
    return map[difficulte] || difficulte;
  };

  // Couleur selon la difficulté
  const getDifficultyColor = (difficulte) => {
    if (!difficulte) return grey;
    switch(difficulte.toUpperCase()) {
      case 'DEBUTANT': return yellow;
      case 'INTERMEDIAIRE': return blue;
      case 'AVANCE': return pink;
      default: return grey;
    }
  };

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
        {/* Bouton retour en haut à gauche - Design minimaliste */}
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={{
            position: 'absolute',
            top: 50,
            left: 20,
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
            padding: 20, 
            paddingTop: 100, // Espace pour le bouton retour
            paddingBottom: 150 
          }}
          showsVerticalScrollIndicator={false}
        >
          <InnerContainer>
            {/* En-tête minimaliste */}
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              marginBottom: 25,
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.1)'
            }}>
              {/* Icône type de débat */}
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: type === "TEST" ? pink + '20' : blue + '20',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 12,
                borderWidth: 1,
                borderColor: type === "TEST" ? pink + '40' : blue + '40'
              }}>
                <Ionicons 
                  name={type === "TEST" ? "school" : "rocket"} 
                  size={20} 
                  color={type === "TEST" ? pink : blue} 
                />
              </View>
              
              <View style={{ flex: 1 }}>
                {/* Titre du sujet */}
                <Label style={{
                  fontSize: 18, 
                  color: white, 
                  fontWeight: '600',
                  marginBottom: 4
                }}>
                  {sujet?.titre || "Débat"}
                </Label>
                
                {/* Informations minimalistes */}
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {/* Position */}
                  <View style={{
                    backgroundColor: choixUtilisateur === "POUR" ? blue + '30' : pink + '30',
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 12,
                    marginRight: 8,
                    borderWidth: 1,
                    borderColor: choixUtilisateur === "POUR" ? blue + '50' : pink + '50'
                  }}>
                    <Label style={{
                      fontSize: 12,
                      color: choixUtilisateur === "POUR" ? blue : pink,
                      fontWeight: '600'
                    }}>
                      {choixUtilisateur === "POUR" ? "POUR" : "CONTRE"}
                    </Label>
                  </View>
                  
                  {/* Difficulté */}
                  {sujet?.difficulte && (
                    <View style={{
                      backgroundColor: getDifficultyColor(sujet.difficulte) + '30',
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: getDifficultyColor(sujet.difficulte) + '50'
                    }}>
                      <Label style={{
                        fontSize: 11,
                        color: getDifficultyColor(sujet.difficulte),
                        fontWeight: '600'
                      }}>
                        {getDifficultyText(sujet.difficulte)}
                      </Label>
                    </View>
                  )}
                  
                  {/* Timer si présent */}
                  {timeRemaining !== null && (
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginLeft: 'auto',
                      backgroundColor: timeRemaining < 60 ? pink + '20' : green + '20',
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: timeRemaining < 60 ? pink + '40' : green + '40'
                    }}>
                      <Ionicons 
                        name="time-outline" 
                        size={12} 
                        color={timeRemaining < 60 ? pink : green} 
                      />
                      <Label style={{
                        fontSize: 11,
                        color: timeRemaining < 60 ? pink : green,
                        fontWeight: '600',
                        marginLeft: 4
                      }}>
                        {formatTime(timeRemaining)}
                      </Label>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* Messages - Design minimaliste */}
            <View style={{ marginBottom: 20 }}>
              {messages.map((msg, index) => (
                <View
                  key={msg.id || index}
                  style={{
                    marginBottom: 16,
                    maxWidth: "85%",
                    alignSelf: msg.role === "user" ? "flex-end" : "flex-start"
                  }}
                >
                  <View style={{ 
                    flexDirection: "row",
                    alignItems: "flex-start",
                    justifyContent: msg.role === "user" ? "flex-end" : "flex-start"
                  }}>
                    {msg.role === "ai" && (
                      <View style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: blue + '30',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginRight: 8,
                        borderWidth: 1,
                        borderColor: blue + '50'
                      }}>
                        <Ionicons name="chatbubble" size={16} color={blue} />
                      </View>
                    )}

                    <View style={{
                      backgroundColor: msg.role === "user" ? blue : 'rgba(255, 255, 255, 0.1)',
                      borderRadius: 18,
                      borderTopLeftRadius: msg.role === "user" ? 18 : 4,
                      borderTopRightRadius: msg.role === "user" ? 4 : 18,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      maxWidth: "100%",
                      borderWidth: 1,
                      borderColor: msg.role === "user" ? blue + '30' : 'rgba(255, 255, 255, 0.1)'
                    }}>
                      <Label style={{
                        color: msg.role === "user" ? white : white,
                        fontSize: 15,
                        lineHeight: 20
                      }}>
                        {msg.text}
                      </Label>
                    </View>

                    {msg.role === "user" && (
                      <View style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: lightPink + '30',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginLeft: 8,
                        borderWidth: 1,
                        borderColor: lightPink + '50'
                      }}>
                        <Ionicons name="person" size={16} color={lightPink} />
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
                  marginBottom: 16
                }}>
                  <View style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: blue + '30',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 8,
                    borderWidth: 1,
                    borderColor: blue + '50'
                  }}>
                    <Ionicons name="chatbubble" size={16} color={blue} />
                  </View>
                  
                  <View style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: 18,
                    borderTopLeftRadius: 4,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.1)'
                  }}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <ActivityIndicator size="small" color={blue} />
                      <Label style={{
                        color: white, 
                        marginLeft: 10, 
                        fontSize: 14,
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

        {/* Zone de saisie minimaliste */}
        <View style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          padding: 16,
          paddingBottom: Platform.OS === 'ios' ? 30 : 16,
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
              borderRadius: 24,
              paddingHorizontal: 16,
              paddingVertical: 8,
              marginRight: 12,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.1)'
            }}>
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder="Écrivez votre message..."
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                style={{
                  fontSize: 15,
                  color: white,
                  minHeight: 36,
                  maxHeight: 100
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
                width: 48,
                height: 48,
                borderRadius: 24,
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
                  size={22} 
                  color={input.trim() && debateInfo?.status !== "TERMINE" ? white : 'rgba(255, 255, 255, 0.5)'} 
                />
              )}
            </TouchableOpacity>
          </View>

          {/* Bouton terminer le débat */}
          <TouchableOpacity 
            style={{
              marginTop: 12,
              backgroundColor: debateInfo?.status === "TERMINE" ? 'rgba(255, 255, 255, 0.1)' : green + '30',
              paddingVertical: 12,
              borderRadius: 12,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: debateInfo?.status === "TERMINE" ? 'rgba(255, 255, 255, 0.1)' : green + '50'
            }}
            onPress={handleFinishDebate}
            disabled={debateInfo?.status === "TERMINE"}
          >
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Ionicons 
                name={debateInfo?.status === "TERMINE" ? "checkmark-done" : "flag"} 
                size={18} 
                color={debateInfo?.status === "TERMINE" ? 'rgba(255, 255, 255, 0.5)' : green} 
              />
              <Label style={{
                color: debateInfo?.status === "TERMINE" ? 'rgba(255, 255, 255, 0.5)' : green, 
                fontSize: 14, 
                fontWeight: '600',
                marginLeft: 8
              }}>
                {debateInfo?.status === "TERMINE" ? "Débat terminé" : "Terminer le débat"}
              </Label>
            </View>
          </TouchableOpacity>
        </View>
      </BackgroundContainer>
    </KeyboardAvoidingView>
  );
};

export default Chat;