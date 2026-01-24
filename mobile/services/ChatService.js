// services/chatService.js
import api from './api';
import { DebateService } from './debateService';

const getIntelligentMockResponse = (userMessage) => {
  const responses = {
    greetings: [
      'Bonjour ! Je suis prêt à débattre avec vous.',
      'Salut ! Commençons notre discussion.',
      'Enchanté ! Parlons de ce sujet intéressant.',
    ],
    music: [
      'La musique influence effectivement nos émotions de manière significative.',
      "L'impact de la musique sur la psychologie humaine est fascinant.",
      'La musique moderne classique fusionne tradition et innovation de manière unique.',
    ],
    questions: [
      "C'est une bonne question. Pouvez-vous développer votre pensée ?",
      'Je vois votre interrogation. Quel aspect vous intéresse particulièrement ?',
      'Question intéressante ! Avez-vous une hypothèse personnelle ?',
    ],
    arguments: [
      'Je comprends votre argument. Avez-vous des exemples concrets ?',
      'Votre point de vue est intéressant. Comment le défendriez-vous face à des objections ?',
      "C'est une position défendable. Quelles sont vos sources principales ?",
    ],
    default: [
      'Je comprends. Pouvez-vous en dire plus ?',
      'Intéressant. Poursuivons cette réflexion.',
      "Je vois. Avez-vous d'autres points à ajouter ?",
    ],
  };

  const lowerMessage = userMessage.toLowerCase();
  let category = 'default';

  if (
    lowerMessage.includes('bonjour') ||
    lowerMessage.includes('salut') ||
    lowerMessage.includes('hello')
  ) {
    category = 'greetings';
  } else if (
    lowerMessage.includes('musique') ||
    lowerMessage.includes('musical') ||
    lowerMessage.includes('son')
  ) {
    category = 'music';
  } else if (
    lowerMessage.includes('?') ||
    lowerMessage.includes('pourquoi') ||
    lowerMessage.includes('comment')
  ) {
    category = 'questions';
  } else if (
    lowerMessage.includes('je pense') ||
    lowerMessage.includes('à mon avis') ||
    lowerMessage.includes('argument')
  ) {
    category = 'arguments';
  }

  const categoryResponses = responses[category];
  const randomIndex = Math.floor(Math.random() * categoryResponses.length);
  return categoryResponses[randomIndex];
};

export const sendMessageToAI = async (debatId, message) => {
  // MOCK TEMPORAIRE
  const USE_MOCK = true; // À changer en false pour le backend réel

  if (USE_MOCK) {
    console.log('🎭 Mode simulation activé');
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: Date.now(),
          contenu: getIntelligentMockResponse(message),
          auteur: 'CHATBOT',
          timestamp: new Date().toISOString(),
          _simulated: true,
        });
      }, 1200);
    });
  }

  // BACKEND RÉEL
  try {
    console.log(`🤖 Envoi message réel au débat ${debatId}:`, message);
    const response = await DebateService.sendMessage(debatId, message);
    console.log('✅ Réponse IA reçue:', response);
    return response;
  } catch (error) {
    console.error('❌ Erreur avec le backend, fallback à la simulation');

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: Date.now(),
          contenu: getIntelligentMockResponse(message),
          auteur: 'CHATBOT',
          timestamp: new Date().toISOString(),
          _simulated: true,
          _error: error.message,
        });
      }, 800);
    });
  }
};

export const testChatbot = async () => {
  try {
    console.log('🧪 Test du chatbot...');
    const response = await api.post('/chatbot/test', {
      message: 'Bonjour, peux-tu débattre?',
    });
    console.log('✅ Test chatbot réussi:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Test chatbot échoué:', error);
    return {
      test_result: 'Test simulé - Backend non disponible',
      timestamp: new Date().toISOString(),
      _simulated: true,
    };
  }
};

export const checkChatbotHealth = async () => {
  try {
    console.log('🏥 Vérification santé chatbot...');
    const response = await api.get('/chatbot/health');
    console.log('✅ Santé chatbot:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Erreur santé chatbot:', error);
    return {
      status: 'unhealthy',
      service: 'chatbot',
      active_sessions: 0,
      _simulated: true,
    };
  }
};
