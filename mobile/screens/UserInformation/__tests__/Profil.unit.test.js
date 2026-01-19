import React from 'react';
import { render } from '@testing-library/react-native';
import Profil from '../Profil';

/* ===== MOCKS ===== */

// ImagePicker
jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: {
    Images: 'Images',
  },
}));

// Ionicons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// Styles custom
jest.mock('../../../components/styles', () => {
  const React = require('react');
  const { View, Text, Image } = require('react-native');

  return {
    BackgroundContainer: ({ children }) => <View>{children}</View>,
    InnerContainer: ({ children }) => <View>{children}</View>,
    ProfileImage: (props) => <Image {...props} />,
    Label: ({ children }) => <Text>{children}</Text>,
    WhiteContainer: ({ children }) => <View>{children}</View>,
    Colors: {
      blue: '#4A90E2',
      dark: '#000',
    },
  };
});

// KeyboardAvoidingWrapper
jest.mock('../../../components/common/KeyboardAvoidingWrapper', () => {
  return ({ children }) => children;
});

// EditableRow
jest.mock('../../../components/userInformation/EditableRow', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return ({ label, value }) => (
    <>
      <Text>{label}</Text>
      <Text>{value}</Text>
    </>
  );
});

/* ===== TEST ===== */

describe('Profil – Test unitaire', () => {
  it('se rend correctement avec les informations utilisateur', () => {
    const { getByText } = render(<Profil />);

    expect(getByText('Nom')).toBeTruthy();
    expect(getByText('Jean Dupont')).toBeTruthy();

    expect(getByText('Email')).toBeTruthy();
    expect(getByText('jean.dupont@email.com')).toBeTruthy();

    expect(getByText('Mot de passe')).toBeTruthy();
    expect(getByText('password123')).toBeTruthy();
  });
});
