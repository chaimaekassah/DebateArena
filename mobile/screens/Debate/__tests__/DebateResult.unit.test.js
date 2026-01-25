import React from 'react';
import { render } from '@testing-library/react-native';
import DebateResult from '../DebateResult';
import api from '../../../services/api';

/* --------- Mocks --------- */
jest.mock('../../../services/api', () => ({
  get: jest.fn(),
}));

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

const mockRoute = {
  params: {
    debatId: 1,
    note: 14,
  },
};

/* --------- Tests unitaires --------- */
describe('DebateResult – Tests unitaires', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /* ✅ Loader */
  it('affiche le loader pendant le chargement', () => {
    const { getByText } = render(
      <DebateResult navigation={mockNavigation} route={mockRoute} />,
    );

    expect(getByText('Chargement des résultats...')).toBeTruthy();
  });

  /* ✅ Affichage note */
  it('affiche la note du débat', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        note: 14,
        sujet: { titre: 'Climat' },
      },
    });

    api.get.mockResolvedValueOnce({ data: null });

    const { findByText } = render(
      <DebateResult navigation={mockNavigation} route={mockRoute} />,
    );

    expect(await findByText('14/20')).toBeTruthy();
  });

  /* ✅ Feedback correct selon la note */
  it('affiche un feedback positif pour une bonne note', async () => {
    api.get.mockResolvedValueOnce({
      data: { note: 16 },
    });
    api.get.mockResolvedValueOnce({ data: null });

    const { findByText } = render(
      <DebateResult navigation={mockNavigation} route={mockRoute} />,
    );

    expect(await findByText(/Excellent travail/i)).toBeTruthy();
  });

  /* ✅ Boutons d’action présents */
  it('affiche les boutons de navigation', async () => {
    api.get.mockResolvedValueOnce({ data: { note: 10 } });
    api.get.mockResolvedValueOnce({ data: null });

    const { findByText } = render(
      <DebateResult navigation={mockNavigation} route={mockRoute} />,
    );

    expect(await findByText('Retour au Tableau de Bord')).toBeTruthy();
    expect(await findByText("Voir l'Historique")).toBeTruthy();
    expect(await findByText('Nouveau Débat')).toBeTruthy();
  });
});
