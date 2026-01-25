import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SignUp from '../signup';
import api from '../../../services/api';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const mockNavigate = jest.fn();

const navigation = {
  navigate: mockNavigate,
};

jest.mock('@react-native-async-storage/async-storage', () => ({
  multiSet: jest.fn(),
}));

jest.mock('../../../services/api', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  },
}));

jest.spyOn(Alert, 'alert');

describe('SignUp Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('affiche une alerte si les mots de passe ne correspondent pas', async () => {
    const { getByPlaceholderText, getByText, getByTestId } = render(
      <SignUp navigation={navigation} />,
    );

    fireEvent.changeText(getByPlaceholderText('Nom'), 'Test');
    fireEvent.changeText(getByPlaceholderText('Prénom'), 'User');
    fireEvent.changeText(
      getByPlaceholderText('votreemail@exemple.com'),
      'test@test.com',
    );
    fireEvent.changeText(getByTestId('password-input'), '123456');
    fireEvent.changeText(getByTestId('confirm-password-input'), '000000');

    fireEvent.press(getByText("S'INSCRIRE"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Mots de passe différents',
        'Les mots de passe ne correspondent pas',
      );
    });

    expect(navigation.navigate).not.toHaveBeenCalled();
  });

  it('inscription réussie → sauvegarde et navigation', async () => {
    api.post.mockResolvedValueOnce({
      status: 200,
      data: {
        id: 1,
        nom: 'Test',
        prenom: 'User',
        email: 'test@test.com',
        score: 0,
        badgeNom: 'Débutant',
        imageUrl: 'uploads/avatars/default.png',
      },
    });

    const { getByPlaceholderText, getByText, getByTestId } = render(
      <SignUp navigation={navigation} />,
    );

    fireEvent.changeText(getByPlaceholderText('Nom'), 'Test');
    fireEvent.changeText(getByPlaceholderText('Prénom'), 'User');
    fireEvent.changeText(
      getByPlaceholderText('votreemail@exemple.com'),
      'test@test.com',
    );
    fireEvent.changeText(getByTestId('password-input'), '123456');
    fireEvent.changeText(getByTestId('confirm-password-input'), '123456');

    fireEvent.press(getByText("S'INSCRIRE"));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalled();
      expect(AsyncStorage.multiSet).toHaveBeenCalled();
      expect(Alert.alert).toHaveBeenCalled();
      expect(navigation.navigate).toHaveBeenCalledWith('Login', {
        preFilledEmail: 'test@test.com',
      });
    });
  });
});
