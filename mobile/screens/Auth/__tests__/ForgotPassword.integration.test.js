import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ForgotPassword from '../ForgotPassword';
import api from '../../../services/api';

/* ================= MOCKS ================= */

jest.mock('../../../services/api');

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

jest.mock('../../../components/common/KeyboardAvoidingWrapper', () => {
  return ({ children }) => children;
});

jest.mock('../../../components/styles', () => {
  const React = require('react');
  const {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
  } = require('react-native');

  return {
    InnerContainer: ({ children }) => <View>{children}</View>,
    BackgroundContainer: ({ children }) => <View>{children}</View>,
    StyledFormArea: ({ children }) => <View>{children}</View>,
    StyledButton: ({ children, onPress }) => (
      <TouchableOpacity onPress={onPress}>{children}</TouchableOpacity>
    ),
    ButtonText: ({ children }) => <Text>{children}</Text>,
    StyledTextInput: (props) => <TextInput {...props} />,
    PageLogo: (props) => <Image {...props} />,
    TextLink: ({ children, onPress }) => (
      <TouchableOpacity onPress={onPress}>{children}</TouchableOpacity>
    ),
    TextLinkContent: ({ children }) => <Text>{children}</Text>,
    Shadow: ({ children }) => <View>{children}</View>,
    RightIcon: ({ children, onPress }) => (
      <TouchableOpacity onPress={onPress}>{children}</TouchableOpacity>
    ),
    Label: ({ children }) => <Text>{children}</Text>,
    Colors: {
      white: '#fff',
      blue: '#4A90E2',
      grey: '#999',
    },
  };
});

/* ================= TEST ================= */

describe('ForgotPassword – Test d’intégration', () => {
  const navigation = { navigate: jest.fn() };

  it("envoie l'email et passe à l'étape 2", async () => {
    api.post.mockResolvedValueOnce({
      data: { message: 'Email envoyé' },
    });

    const { getByPlaceholderText, getByText, queryByText } = render(
      <ForgotPassword navigation={navigation} />,
    );

    // Saisie email
    fireEvent.changeText(
      getByPlaceholderText('votreemail@exemple.com'),
      'test@email.com',
    );

    // Envoi
    fireEvent.press(getByText('ENVOYER LE LIEN'));

    // Vérifie appel API
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/forgot-password', {
        email: 'test@email.com',
      });
    });

    // Étape 2 affichée
    await waitFor(() => {
      expect(queryByText('Nouveau mot de passe')).toBeTruthy();
    });
  });
});
