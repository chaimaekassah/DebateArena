import React from 'react';
import { render } from '@testing-library/react-native';
import Chat from '../Chat';
import api, { verifyToken } from '../../../services/api';

/* ---------------- Mocks ---------------- */

jest.mock('../../../services/api', () => ({
  get: jest.fn(),
  post: jest.fn(),
  delete: jest.fn(),
  verifyToken: jest.fn(),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  clear: jest.fn(),
}));

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

describe('Chat – Tests unitaires', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    verifyToken.mockResolvedValue(true);
    api.get.mockResolvedValue({ data: [] });
  });

  /* ✅ 1. Rendu du loader initial */
  it('affiche le loader au chargement du débat', () => {
    const { getByText } = render(
      <Chat navigation={mockNavigation} route={mockRoute} />,
    );

    expect(getByText('Chargement du débat...')).toBeTruthy();
  });

  /* ✅ 2. Affichage du titre du sujet */
  it('affiche le titre du sujet du débat', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        sujet: { titre: 'Climat' },
        status: 'EN_COURS',
        choixUtilisateur: 'POUR',
      },
    });

    const { findByText } = render(
      <Chat navigation={mockNavigation} route={mockRoute} />,
    );

    expect(await findByText('Climat')).toBeTruthy();
  });

  /* ✅ 3. Champ de saisie présent */
  it('affiche le champ de saisie du message', async () => {
    const { findByPlaceholderText } = render(
      <Chat navigation={mockNavigation} route={mockRoute} />,
    );

    expect(
      await findByPlaceholderText('Écrivez votre message...'),
    ).toBeTruthy();
  });

  /* ✅ 4. Boutons Annuler / Terminer présents */
  it('affiche les boutons d’action du débat', async () => {
    const { findByText } = render(
      <Chat navigation={mockNavigation} route={mockRoute} />,
    );

    expect(await findByText('Annuler')).toBeTruthy();
    expect(await findByText('Terminer')).toBeTruthy();
  });
});
