import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Subject from '../Subject';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../../services/api';

jest.mock('@react-native-async-storage/async-storage');
jest.mock('../../../services/api');

describe('Subject - Test d’intégration', () => {
  const navigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
  };

  const sujet = {
    id: 10,
    titre: 'Les réseaux sociaux nuisent-ils à la démocratie ?',
    categorie: 'Société',
    difficulte: 'DEBUTANT',
  };

  const route = {
    params: {
      sujet,
      debateType: 'ENTRAINEMENT',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.getItem.mockResolvedValue('token123');
  });

  it('crée un débat et navigue vers StartDebate (POUR)', async () => {
    api.get.mockResolvedValue({
      data: { niveau: 'AVANCE' },
    });

    api.post.mockResolvedValue({
      data: {
        id: 99,
        sujet,
        type: 'ENTRAINEMENT',
        choixUtilisateur: 'POUR',
        status: 'EN_COURS',
        dateDebut: '2025-01-01',
        duree: 300,
        note: null,
      },
    });

    const { getByText } = render(
      <Subject navigation={navigation} route={route} />,
    );

    fireEvent.press(getByText('POUR'));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/debats', {
        sujetId: 10,
        type: 'ENTRAINEMENT',
        choix: 'POUR',
      });

      expect(navigation.navigate).toHaveBeenCalledWith(
        'StartDebate',
        expect.objectContaining({
          debatId: 99,
          choixUtilisateur: 'POUR',
          sujet,
        }),
      );
    });
  });
});
