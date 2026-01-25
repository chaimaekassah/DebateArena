import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Subject from '../Subject';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../../services/api';
import { Alert } from 'react-native';

jest.mock('@react-native-async-storage/async-storage');
jest.mock('../../../services/api');
describe('Subject - Tests unitaires', () => {
  const navigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
  };

  const sujet = {
    id: 1,
    titre: 'Faut-il interdire l’IA à l’école ?',
    categorie: 'Éducation',
    difficulte: 'INTERMEDIAIRE',
  };

  const route = {
    params: {
      sujet,
      debateType: 'TEST',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.getItem.mockResolvedValue('token123');
  });

  it('redirige vers Login si aucun token', async () => {
    AsyncStorage.getItem.mockResolvedValue(null);

    render(<Subject navigation={navigation} route={route} />);

    await waitFor(() => {
      expect(navigation.navigate).toHaveBeenCalledWith('Login');
    });
  });

  it('affiche une alerte si aucun sujet', async () => {
    jest.spyOn(Alert, 'alert');

    render(<Subject navigation={navigation} route={{ params: {} }} />);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Erreur',
        'Aucun sujet sélectionné.',
      );
      expect(navigation.goBack).toHaveBeenCalled();
    });
  });

  it('bloque la création si niveau insuffisant', async () => {
    jest.spyOn(Alert, 'alert');

    api.get.mockResolvedValue({
      data: { niveau: 'DEBUTANT' },
    });

    const { getByText } = render(
      <Subject navigation={navigation} route={route} />,
    );

    fireEvent.press(getByText('POUR'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Erreur',
        'Impossible de créer le débat.',
      );
    });
  });

  it('affiche le loader pendant la création', async () => {
    api.get.mockResolvedValue({
      data: { niveau: 'AVANCE' },
    });

    api.post.mockImplementation(() => new Promise(() => {}));

    const { getByText, getByTestId } = render(
      <Subject navigation={navigation} route={route} />,
    );

    fireEvent.press(getByText('POUR'));

    await waitFor(() => {
      expect(getByText('Création du débat en cours...')).toBeTruthy();
    });
  });
});
