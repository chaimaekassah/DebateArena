// services/__tests__/ChatService.fake.integration.test.js
import {
  sendMessageToAI,
  testChatbot,
  checkChatbotHealth,
} from '../chatService';
import api from '../api';
import { DebateService } from '../debateService';

jest.useFakeTimers();

// --------------------
// MOCKS
// --------------------

jest.mock('../api', () => ({
  post: jest.fn(),
  get: jest.fn(),
}));

jest.mock('../debateService', () => ({
  DebateService: {
    sendMessage: jest.fn(),
  },
}));

describe('ChatService – Faux Test d’intégration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --------------------
  // sendMessageToAI
  // --------------------
  it('sendMessageToAI – renvoie un message simulé', async () => {
    const message = 'Bonjour, je teste';
    const debatId = 42;

    const promise = sendMessageToAI(debatId, message);

    // Avancer le timer pour le setTimeout simulé
    jest.advanceTimersByTime(1200);

    const response = await promise;

    expect(response).toHaveProperty('id');
    expect(response).toHaveProperty('contenu');
    expect(response).toHaveProperty('auteur', 'CHATBOT');
    expect(response).toHaveProperty('timestamp');
    expect(response).toHaveProperty('_simulated', true);
  });

  it('sendMessageToAI – fallback si DebateService échoue (mode simulation)', async () => {
    // Même si DebateService échoue, USE_MOCK=true donc on reçoit la simulation
    DebateService.sendMessage.mockRejectedValue(new Error('Backend down'));

    const message = 'Test fallback';
    const debatId = 99;

    const promise = sendMessageToAI(debatId, message);

    jest.advanceTimersByTime(1200);

    const response = await promise;

    // Vérifie uniquement la simulation
    expect(response).toHaveProperty('_simulated', true);
    expect(response).toHaveProperty('contenu');
    expect(response).toHaveProperty('auteur', 'CHATBOT');
    expect(response).toHaveProperty('timestamp');
  });

  // --------------------
  // testChatbot
  // --------------------
  it('testChatbot – succès backend', async () => {
    const mockData = { reply: 'Chatbot OK' };
    api.post.mockResolvedValue({ data: mockData });

    const result = await testChatbot();

    expect(api.post).toHaveBeenCalledWith('/chatbot/test', {
      message: 'Bonjour, peux-tu débattre?',
    });
    expect(result).toEqual(mockData);
  });

  it('testChatbot – fallback simulation', async () => {
    api.post.mockRejectedValue(new Error('Network error'));

    const result = await testChatbot();

    expect(result).toHaveProperty('_simulated', true);
    expect(result).toHaveProperty(
      'test_result',
      'Test simulé - Backend non disponible',
    );
  });

  // --------------------
  // checkChatbotHealth
  // --------------------
  it('checkChatbotHealth – succès backend', async () => {
    const mockHealth = { status: 'healthy', active_sessions: 5 };
    api.get.mockResolvedValue({ data: mockHealth });

    const result = await checkChatbotHealth();

    expect(api.get).toHaveBeenCalledWith('/chatbot/health');
    expect(result).toEqual(mockHealth);
  });

  it('checkChatbotHealth – fallback simulation', async () => {
    api.get.mockRejectedValue(new Error('Network error'));

    const result = await checkChatbotHealth();

    expect(result).toHaveProperty('_simulated', true);
    expect(result).toHaveProperty('status', 'unhealthy');
  });
});
