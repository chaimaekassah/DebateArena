// __tests__/chatService.test.js
import {
  sendMessageToAI,
  testChatbot,
  checkChatbotHealth,
} from '../chatService';
import api from '../api';
import { DebateService } from '../debateService';

jest.useFakeTimers(); // pour gérer setTimeout

// Mock api
jest.mock('../api', () => ({
  post: jest.fn(),
  get: jest.fn(),
}));

// Mock DebateService
jest.mock('../debateService', () => ({
  DebateService: {
    sendMessage: jest.fn(),
  },
}));

describe('ChatService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendMessageToAI (simulation)', () => {
    it('should return a simulated AI message with correct structure', async () => {
      const message = 'Bonjour IA';
      const debatId = 1;

      const promise = sendMessageToAI(debatId, message);

      // avancer le timer pour le setTimeout
      jest.advanceTimersByTime(1200);

      const response = await promise;

      expect(response).toHaveProperty('id');
      expect(response).toHaveProperty('contenu');
      expect(response).toHaveProperty('auteur', 'CHATBOT');
      expect(response).toHaveProperty('timestamp');
      expect(response).toHaveProperty('_simulated', true);

      // Le contenu doit être une des réponses possibles
      expect(typeof response.contenu).toBe('string');
      expect(response.contenu.length).toBeGreaterThan(0);
    });
  });

  describe('testChatbot', () => {
    it('should return API response if backend works', async () => {
      const mockData = { reply: 'OK' };
      api.post.mockResolvedValue({ data: mockData });

      const result = await testChatbot();

      expect(api.post).toHaveBeenCalledWith('/chatbot/test', {
        message: 'Bonjour, peux-tu débattre?',
      });
      expect(result).toEqual(mockData);
    });

    it('should fallback to simulated response if API fails', async () => {
      api.post.mockRejectedValue(new Error('Network error'));

      const result = await testChatbot();

      expect(result).toHaveProperty(
        'test_result',
        'Test simulé - Backend non disponible',
      );
      expect(result).toHaveProperty('_simulated', true);
      expect(result).toHaveProperty('timestamp');
    });
  });

  describe('checkChatbotHealth', () => {
    it('should return API health data if backend works', async () => {
      const mockHealth = { status: 'healthy', active_sessions: 2 };
      api.get.mockResolvedValue({ data: mockHealth });

      const result = await checkChatbotHealth();

      expect(api.get).toHaveBeenCalledWith('/chatbot/health');
      expect(result).toEqual(mockHealth);
    });

    it('should return simulated health if API fails', async () => {
      api.get.mockRejectedValue(new Error('Network error'));

      const result = await checkChatbotHealth();

      expect(result).toHaveProperty('status', 'unhealthy');
      expect(result).toHaveProperty('service', 'chatbot');
      expect(result).toHaveProperty('active_sessions', 0);
      expect(result).toHaveProperty('_simulated', true);
    });
  });
});
