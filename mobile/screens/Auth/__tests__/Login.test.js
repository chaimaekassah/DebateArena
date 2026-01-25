import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Login from '../Login';
import api from '../../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

jest.mock('../../../services/api', () => ({
  post: jest.fn(),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  removeItem: jest.fn(),
  multiSet: jest.fn(),
}));

jest.spyOn(Alert, 'alert');

describe('Login Screen - Unit Tests', () => {
  const navigation = { navigate: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('affiche une erreur si les champs sont vides', async () => {
    const { getByText } = render(<Login navigation={navigation} />);

    fireEvent.press(getByText('CONNEXION'));

    await waitFor(() => {
      expect(getByText('Tous les champs sont obligatoires')).toBeTruthy();
    });

    expect(api.post).not.toHaveBeenCalled();
    expect(navigation.navigate).not.toHaveBeenCalled();
  });

  it('affiche une alerte si les identifiants sont invalides', async () => {
    api.post.mockRejectedValueOnce({
      response: {
        status: 401,
        data: { message: 'Email ou mot de passe incorrect' },
      },
    });

    const { getByPlaceholderText, getByText } = render(
      <Login navigation={navigation} />,
    );

    fireEvent.changeText(
      getByPlaceholderText('votreemail@exemple.com'),
      'test@test.com',
    );
    fireEvent.changeText(
      getByPlaceholderText('*************'),
      'wrongpassword',
    );

    fireEvent.press(getByText('CONNEXION'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        '❌ Erreur de connexion',
        'Email ou mot de passe incorrect',
      );
    });

    expect(navigation.navigate).not.toHaveBeenCalled();
  });
});
