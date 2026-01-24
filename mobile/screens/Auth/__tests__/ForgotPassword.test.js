import React from 'react';
import { render } from '@testing-library/react-native';
import ForgotPassword from '../../ForgotPassword';

/* ================= MOCKS ================= */

// Mock API
jest.mock('../../../services/api', () => ({
  post: jest.fn(),
}));

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
};

// Mock Ionicons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// Mock KeyboardAvoidingWrapper
jest.mock('../../../components/common/KeyboardAvoidingWrapper', () => {
  return ({ children }) => children;
});

// Mock styles
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

describe('ForgotPassword – Test unitaire', () => {
  it("affiche correctement l'étape 1 (email)", () => {
    const { getByText, getByPlaceholderText } = render(
      <ForgotPassword navigation={mockNavigation} />,
    );

    expect(getByText('Mot de passe oublié')).toBeTruthy();
    expect(getByPlaceholderText('votreemail@exemple.com')).toBeTruthy();
    expect(getByText('ENVOYER LE LIEN')).toBeTruthy();
  });
});
