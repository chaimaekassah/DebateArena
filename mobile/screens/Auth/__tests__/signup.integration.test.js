import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SignUp from '../signup';
import api from '../../../services/api';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('../../../services/api', () => ({
  post: jest.fn(),
}));

jest.spyOn(Alert, 'alert');

jest.mock('@react-native-async-storage/async-storage', () => ({
  multiSet: jest.fn(),
}));

describe('SignUp - Integration Test', () => {
  const navigation = { navigate: jest.fn() };

  it('inscription complète → stockage + navigation Login', async () => {
    api.post.mockResolvedValueOnce({
      status: 200,
      data: {
        id: 1,
        nom: 'Doe',
        prenom: 'John',
        email: 'john@test.com',
        score: 0,
        badgeNom: 'Débutant',
      },
    });

    const navigation = { navigate: jest.fn() };

    const { getByPlaceholderText, getByText, getAllByPlaceholderText } = render(
      <SignUp navigation={navigation} />,
    );

    fireEvent.changeText(getByPlaceholderText('Nom'), 'Doe');
    fireEvent.changeText(getByPlaceholderText('Prénom'), 'John');
    fireEvent.changeText(
      getByPlaceholderText('votreemail@exemple.com'),
      'john@test.com',
    );
    fireEvent.changeText(
      getAllByPlaceholderText('*************')[0],
      'password123',
    );
    fireEvent.changeText(
      getAllByPlaceholderText('*************')[1],
      'password123',
    );

    fireEvent.press(getByText("S'INSCRIRE"));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalled();
      expect(AsyncStorage.multiSet).toHaveBeenCalled();
      expect(navigation.navigate).toHaveBeenCalledWith('Login', {
        preFilledEmail: 'john@test.com',
      });
    });
  });
});
