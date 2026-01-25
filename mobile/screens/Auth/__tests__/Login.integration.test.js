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

describe('Login Screen - Integration Test', () => {
  it('connexion réussie → stocke le token et navigue vers AppTabs', async () => {
    api.post.mockResolvedValueOnce({
      data: {
        token: 'fake-jwt-token',
        role: 'USER',
      },
    });

    const navigation = { navigate: jest.fn() };

    const { getByPlaceholderText, getByText } = render(
      <Login navigation={navigation} />,
    );

    fireEvent.changeText(
      getByPlaceholderText('votreemail@exemple.com'),
      'user@test.com',
    );
    fireEvent.changeText(getByPlaceholderText('*************'), 'password123');

    fireEvent.press(getByText('CONNEXION'));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/auth/signin',
        {
          email: 'user@test.com',
          password: 'password123',
        },
        expect.any(Object),
      );

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('userToken');
      expect(AsyncStorage.multiSet).toHaveBeenCalledWith([
        ['userToken', 'fake-jwt-token'],
        ['userRole', 'USER'],
        ['email', 'user@test.com'],
        ['isLoggedIn', 'true'],
      ]);

      expect(navigation.navigate).toHaveBeenCalledWith('AppTabs');
    });
  });
});
