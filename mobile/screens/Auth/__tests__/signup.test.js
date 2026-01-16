import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SignUp from '../signup';
import api from '../../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const mockNavigate = jest.fn();

const navigation = {
  navigate: mockNavigate,
};

jest.mock('../../../services/api');

describe('SignUp Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('affiche une erreur si les mots de passe ne correspondent pas', async () => {
    const { getByText, getByPlaceholderText, getByTestId } = render(
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

    fireEvent.press(getByText('INSCRIPTION'));

    // ✅ on attend UNIQUEMENT l’erreur
    await waitFor(() => {
      expect(getByText('Les mots de passe ne correspondent pas')).toBeTruthy();
    });

    // ✅ et on vérifie qu'il n'y a PAS de navigation
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('inscription réussie → sauvegarde et navigation', async () => {
    api.post.mockResolvedValueOnce({
      data: {
        id: 1,
        nom: 'Test',
        prenom: 'User',
        email: 'test@test.com',
        score: 0,
        badgeNom: 'Débutant',
        badgeCategorie: 'Bronze',
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

    fireEvent.press(getByText('INSCRIPTION'));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalled();
      expect(AsyncStorage.setItem).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('Login');
    });
  });
});
