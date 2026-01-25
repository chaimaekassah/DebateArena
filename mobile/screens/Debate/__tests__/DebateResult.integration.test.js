import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import DebateResult from '../DebateResult';
import api from '../../../services/api';
import { Alert } from 'react-native';

/* --------- Mocks --------- */
jest.mock('../../../services/api', () => ({
  get: jest.fn(),
}));

jest.spyOn(Alert, 'alert');

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

const mockRoute = {
  params: {
    debatId: 2,
    note: 12,
  },
};

/* --------- Tests d’intégration --------- */
describe('DebateResult – Tests d’intégration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /* ✅ Chargement complet avec stats */
  it('charge les résultats et affiche les statistiques', async () => {
    api.get
      .mockResolvedValueOnce({
        data: {
          note: 12,
          sujet: { titre: 'IA et Société' },
          choixUtilisateur: 'POUR',
          type: 'ENTRAINEMENT',
        },
      })
      .mockResolvedValueOnce({
        data: {
          totalDebats: 10,
          debatsGagnes: 6,
          tauxReussite: 60,
          moyenneNotes: 13.5,
        },
      });

    const { findByText } = render(
      <DebateResult navigation={mockNavigation} route={mockRoute} />,
    );

    expect(await findByText('IA et Société')).toBeTruthy();
    expect(await findByText('10')).toBeTruthy();
    expect(await findByText('60%')).toBeTruthy();
  });

  /* ✅ Navigation Dashboard */
  it('redirige vers le Dashboard', async () => {
    api.get.mockResolvedValueOnce({ data: { note: 10 } });
    api.get.mockResolvedValueOnce({ data: null });

    const { findByText } = render(
      <DebateResult navigation={mockNavigation} route={mockRoute} />,
    );

    fireEvent.press(await findByText('Retour au Tableau de Bord'));

    expect(mockNavigation.navigate).toHaveBeenCalledWith('Dashboard');
  });

  /* ✅ Gestion erreur API */
  it('affiche une alerte si l’API échoue', async () => {
    api.get.mockRejectedValueOnce(new Error('API error'));

    render(<DebateResult navigation={mockNavigation} route={mockRoute} />);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Erreur',
        'Impossible de charger les résultats du débat.',
      );
    });
  });
});
