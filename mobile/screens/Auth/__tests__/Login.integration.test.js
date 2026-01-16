import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Login from '../Login';
import api from '../../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('../../services/api');

describe('Login - Integration Test', () => {
  const navigation = { navigate: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('connexion réussie → stocke le token et navigue vers Dashboard', async () => {
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
    fireEvent.changeText(getByPlaceholderText('*************'), 'password123');

    fireEvent.press(getByText('CONNEXION'));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/signin', {
        email: 'test@test.com',
        password: 'password123',
      });

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'userToken',
        'fake-token',
      );
      expect(navigation.navigate).toHaveBeenCalledWith('Dashboard');
    });
  });
});
