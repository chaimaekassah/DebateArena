import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SignUp from '../signup';
import api from '../../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('../../../services/api');

describe('SignUp - Integration Test', () => {
  const navigation = { navigate: jest.fn() };

  it('inscription réussie → stocke les infos et redirige vers Login', async () => {
    api.post.mockResolvedValueOnce({
      data: {
        id: 1,
        nom: 'Doe',
        prenom: 'John',
        email: 'john@test.com',
        score: 0,
        badgeNom: 'Débutant',
        badgeCategorie: 'Newbie',
      },
    });

    const { getByPlaceholderText, getByText, getByTestId } = render(
      <SignUp navigation={navigation} />,
    );

    fireEvent.changeText(getByPlaceholderText('Nom'), 'Doe');
    fireEvent.changeText(getByPlaceholderText('Prénom'), 'John');
    fireEvent.changeText(
      getByPlaceholderText('votreemail@exemple.com'),
      'john@test.com',
    );
    fireEvent.changeText(getByTestId('password-input'), 'password123');
    fireEvent.changeText(getByTestId('confirm-password-input'), 'password123');

    fireEvent.press(getByText('INSCRIPTION'));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalled();
      expect(AsyncStorage.setItem).toHaveBeenCalled();
      expect(navigation.navigate).toHaveBeenCalledWith('Login');
    });
  });
});
