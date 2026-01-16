jest.mock('../api', () => ({
  post: jest.fn(),
}));

import api from '../api';
import { sendMessageToAI } from '../ChatService';

describe('ChatService – faux test d’intégration', () => {
  it('does not call api.post because mock implementation is active', async () => {
    const response = await sendMessageToAI('Bonjour IA');

    // Vérifie que l’intégration backend est désactivée
    expect(api.post).not.toHaveBeenCalled();

    // Vérifie que la réponse vient bien du mock local
    expect(response.data.reply).toBe('🤖 Réponse simulée de l’IA (Axios)');
  });
});
