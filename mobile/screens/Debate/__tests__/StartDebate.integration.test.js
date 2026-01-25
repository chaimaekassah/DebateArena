import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import StartDebate from '../StartDebate';

describe('StartDebate - Test d’intégration', () => {
  const navigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
  };

  const route = {
    params: {
      debatId: 42,
      type: 'ENTRAINEMENT',
      status: 'EN_COURS',
      choixUtilisateur: 'CONTRE',
      dateDebut: '2025-01-01',
      duree: null,
      sujet: {
        titre: 'Faut-il interdire l’IA à l’école ?',
        categorie: 'Éducation',
        difficulte: 'DEBUTANT',
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('navigue vers Chat avec les bons paramètres', async () => {
    const { getByText } = render(
      <StartDebate navigation={navigation} route={route} />,
    );

    fireEvent.press(getByText('COMMENCER LE DÉBAT'));

    await waitFor(() => {
      expect(navigation.navigate).toHaveBeenCalledWith(
        'Chat',
        expect.objectContaining({
          debatId: 42,
          sujet: route.params.sujet,
          choixUtilisateur: 'CONTRE',
          type: 'ENTRAINEMENT',
          status: 'EN_COURS',
        }),
      );
    });
  });
});
