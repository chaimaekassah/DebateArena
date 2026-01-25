import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Dashboard from '../Dashboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../../services/api';

jest.mock('@react-native-async-storage/async-storage');
jest.mock('../../../services/api');

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

describe('Dashboard – Tests d’intégration', () => {
  const navigationMock = {
    navigate: jest.fn(),
    replace: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('charge les données depuis l’API et les affiche', async () => {
    AsyncStorage.getItem
      .mockResolvedValueOnce('Doe')
      .mockResolvedValueOnce('John')
      .mockResolvedValueOnce('john@doe.com');

    api.get.mockResolvedValueOnce({
      data: {
        niveau: 'INTERMEDIAIRE',
        score: 150,
        progressionPourcentage: 50,
        badgeActuel: { nom: 'Orateur', categorie: 'ARGENT' },
        totalDebats: 10,
        debatsGagnes: 7,
        tauxReussite: 70,
        moyenneNotes: 14,
        meilleureNote: 18,
        debatsRecents: [],
      },
    });

    const { findByText } = render(<Dashboard navigation={navigationMock} />);

    expect(await findByText('Bienvenue John !')).toBeTruthy();
    expect(await findByText('150 points')).toBeTruthy();
    expect(await findByText('Orateur')).toBeTruthy();
  });

  it('affiche une erreur si l’API échoue', async () => {
    api.get.mockRejectedValueOnce({
      response: { status: 500 },
    });

    const { findByText } = render(<Dashboard navigation={navigationMock} />);

    expect(await findByText('Impossible de charger les données.')).toBeTruthy();
  });

  it('déconnecte l’utilisateur', async () => {
    const { findByText } = render(<Dashboard navigation={navigationMock} />);

    const logoutButton = await findByText('Déconnexion');
    fireEvent.press(logoutButton);

    await waitFor(() => {
      expect(AsyncStorage.clear).toHaveBeenCalled();
      expect(navigationMock.replace).toHaveBeenCalledWith('Login');
    });
  });
});
