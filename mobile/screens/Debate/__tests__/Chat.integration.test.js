import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Chat from '../Chat';
import api, { verifyToken } from '../../../services/api';
import { Alert } from 'react-native';

/* ---------------- Mocks ---------------- */

jest.mock('../../../services/api', () => ({
  get: jest.fn(),
  post: jest.fn(),
  delete: jest.fn(),
  verifyToken: jest.fn(),
}));

jest.spyOn(Alert, 'alert');

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

const mockRoute = {
  params: {
    debatId: 1,
    sujet: { titre: 'Climat' },
    type: 'ENTRAINEMENT',
    choixUtilisateur: 'POUR',
  },
};

/* ---------------- Tests ---------------- */
describe('Chat – Tests d’intégration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    verifyToken.mockResolvedValue(true);
  });

  /* ✅ 1. Chargement débat + message de bienvenue */
  it('charge le débat et affiche le message de bienvenue', async () => {
    api.get
      .mockResolvedValueOnce({
        data: {
          sujet: { titre: 'Climat' },
          status: 'EN_COURS',
          choixUtilisateur: 'POUR',
        },
      })
      .mockResolvedValueOnce({ data: [] });

    const { findByText } = render(
      <Chat navigation={mockNavigation} route={mockRoute} />,
    );

    expect(
      await findByText(/Commençons notre débat sur "Climat"/),
    ).toBeTruthy();
  });

  /* ✅ 2. Envoi message utilisateur + réponse IA */
  it('envoie un message et affiche la réponse du chatbot', async () => {
    api.get
      .mockResolvedValueOnce({
        data: {
          sujet: { titre: 'Climat' },
          status: 'EN_COURS',
          choixUtilisateur: 'POUR',
        },
      })
      .mockResolvedValueOnce({ data: [] });

    api.post.mockResolvedValueOnce({
      data: {
        id: 10,
        contenu: 'Réponse du chatbot',
        timestamp: new Date().toISOString(),
      },
    });

    const { findByPlaceholderText, findByText } = render(
      <Chat navigation={mockNavigation} route={mockRoute} />,
    );

    const input = await findByPlaceholderText('Écrivez votre message...');
    fireEvent.changeText(input, 'Bonjour');

    fireEvent.press(await findByText('send'));

    expect(await findByText('Bonjour')).toBeTruthy();
    expect(await findByText('Réponse du chatbot')).toBeTruthy();
  });

  /* ✅ 3. Envoi impossible si débat terminé */
  it('bloque l’envoi si le débat est terminé', async () => {
    api.get
      .mockResolvedValueOnce({
        data: {
          sujet: { titre: 'Climat' },
          status: 'TERMINE',
          choixUtilisateur: 'POUR',
        },
      })
      .mockResolvedValueOnce({ data: [] });

    const { findByPlaceholderText } = render(
      <Chat navigation={mockNavigation} route={mockRoute} />,
    );

    const input = await findByPlaceholderText('Écrivez votre message...');
    fireEvent.changeText(input, 'Test');

    expect(Alert.alert).toHaveBeenCalledWith(
      'Débat terminé',
      expect.any(String),
    );
  });

  /* ✅ 4. Terminer débat → navigation */
  it('termine le débat et redirige', async () => {
    api.get
      .mockResolvedValueOnce({
        data: {
          sujet: { titre: 'Climat' },
          status: 'EN_COURS',
          type: 'ENTRAINEMENT',
        },
      })
      .mockResolvedValueOnce({ data: [] });

    api.post.mockResolvedValueOnce({
      data: { status: 'TERMINE', type: 'ENTRAINEMENT' },
    });

    const { findByText } = render(
      <Chat navigation={mockNavigation} route={mockRoute} />,
    );

    fireEvent.press(await findByText('Terminer'));
    fireEvent.press(await findByText('Terminer'));

    await waitFor(() => {
      expect(mockNavigation.navigate).toHaveBeenCalledWith('Dashboard');
    });
  });
});
