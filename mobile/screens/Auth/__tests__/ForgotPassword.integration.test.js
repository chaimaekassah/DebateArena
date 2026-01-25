import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ForgotPassword from '../ForgotPassword';
import api from '../../../services/api';
import { Alert } from 'react-native';

jest.mock('../../../services/api', () => ({
  post: jest.fn(),
}));

jest.spyOn(Alert, 'alert');

describe('ForgotPassword - Integration Test', () => {
  it('flow complet → reset mot de passe et retour login', async () => {
    api.post
      .mockResolvedValueOnce({ data: {} }) // forgot-password
      .mockResolvedValueOnce({ data: {} }); // reset-password

    const navigation = { navigate: jest.fn() };

    const { getByPlaceholderText, getByText, getAllByText } = render(
      <ForgotPassword navigation={navigation} />,
    );

    // STEP 1
    fireEvent.changeText(
      getByPlaceholderText('votreemail@exemple.com'),
      'user@test.com',
    );
    fireEvent.press(getByText('ENVOYER LE LIEN'));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/forgot-password', {
        email: 'user@test.com',
      });
    });

    // STEP 2 visible
    await waitFor(() => {
      expect(getAllByText('Nouveau mot de passe')).toBeTruthy();
    });

    // STEP 2 inputs
    fireEvent.changeText(
      getByPlaceholderText('ex: abc123def456ghi789'),
      'valid-token',
    );
    fireEvent.changeText(
      getByPlaceholderText('Minimum 6 caractères'),
      'password123',
    );
    fireEvent.changeText(
      getByPlaceholderText('Retapez votre mot de passe'),
      'password123',
    );

    fireEvent.press(getByText('RÉINITIALISER LE MOT DE PASSE'));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/reset-password', {
        token: 'valid-token',
        newPassword: 'password123',
      });

      expect(Alert.alert).toHaveBeenCalled();
    });
  });
});
