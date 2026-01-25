import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ForgotPassword from '../ForgotPassword';
import api from '../../../services/api';
import { Alert } from 'react-native';

jest.mock('../../../services/api', () => ({
  post: jest.fn(),
}));

jest.spyOn(Alert, 'alert');

describe('ForgotPassword - Unit Tests', () => {
  const navigation = { navigate: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('affiche une erreur si email vide', async () => {
    const { getByText } = render(<ForgotPassword navigation={navigation} />);

    fireEvent.press(getByText('ENVOYER LE LIEN'));

    await waitFor(() => {
      expect(getByText("L'email est requis")).toBeTruthy();
    });

    expect(api.post).not.toHaveBeenCalled();
  });

  it('affiche une erreur si email invalide', async () => {
    const { getByPlaceholderText, getByText } = render(
      <ForgotPassword navigation={navigation} />,
    );

    fireEvent.changeText(
      getByPlaceholderText('votreemail@exemple.com'),
      'invalid-email',
    );

    fireEvent.press(getByText('ENVOYER LE LIEN'));

    await waitFor(() => {
      expect(getByText('Email invalide')).toBeTruthy();
    });
  });

  it('affiche une alerte si API forgot-password échoue', async () => {
    api.post.mockRejectedValueOnce({
      response: {
        data: { message: 'Erreur serveur' },
      },
    });

    const { getByPlaceholderText, getByText } = render(
      <ForgotPassword navigation={navigation} />,
    );

    fireEvent.changeText(
      getByPlaceholderText('votreemail@exemple.com'),
      'test@test.com',
    );

    fireEvent.press(getByText('ENVOYER LE LIEN'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('❌ Erreur', 'Erreur serveur');
    });
  });
});
