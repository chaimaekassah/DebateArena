import { sendMessageToAI } from '../ChatService';

describe('sendMessageToAI', () => {
  jest.setTimeout(5000); // augmente le timeout si nécessaire à cause du setTimeout

  it('should return a simulated AI reply', async () => {
    const message = 'Bonjour IA';

    const response = await sendMessageToAI(message);

    // Vérifie que la réponse a la structure attendue
    expect(response).toHaveProperty('data');
    expect(response.data).toHaveProperty('reply');
    expect(response.data.reply).toBe('🤖 Réponse simulée de l’IA (Axios)');
  });
});
