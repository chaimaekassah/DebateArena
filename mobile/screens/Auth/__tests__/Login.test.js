import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Login from '../Login';
import api from '../../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const mockNavigate = jest.fn();

const navigation = {
  navigate: mockNavigate,
};

jest.mock('../../../services/api');

describe('Login Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('affiche les champs email et mot de passe', () => {
    const { getByPlaceholderText } = render(<Login navigation={navigation} />);

    expect(getByPlaceholderText('votreemail@exemple.com')).toBeTruthy();
    expect(getByPlaceholderText('*************')).toBeTruthy();
  });

  it('affiche une erreur si les champs sont vides', async () => {
    const { getByText } = render(<Login navigation={navigation} />);

    fireEvent.press(getByText('CONNEXION'));

    await waitFor(() => {
      expect(getByText('Tous les champs sont obligatoires')).toBeTruthy();
    });
  });

  it('connexion réussie → stocke le token et navigue', async () => {
    api.post.mockResolvedValueOnce({
      data: {
        token: 'fake-token',
        role: 'USER',
      },
    });

    const { getByPlaceholderText, getByText } = render(
      <Login navigation={navigation} />,
    );

    fireEvent.changeText(
      getByPlaceholderText('votreemail@exemple.com'),
      'test@test.com',
    );
    fireEvent.changeText(getByPlaceholderText('*************'), '123456');

    fireEvent.press(getByText('CONNEXION'));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/signin', {
        email: 'test@test.com',
        password: '123456',
      });

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'userToken',
        'fake-token',
      );

      expect(mockNavigate).toHaveBeenCalledWith('Dashboard');
    });
  });
});
