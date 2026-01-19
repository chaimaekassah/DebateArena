import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Profil from '../Profil';
import * as ImagePicker from 'expo-image-picker';

/* ===== MOCKS ===== */

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(() =>
    Promise.resolve({ granted: true }),
  ),
  launchImageLibraryAsync: jest.fn(() =>
    Promise.resolve({
      canceled: false,
      assets: [{ uri: 'test-image-uri' }],
    }),
  ),
  MediaTypeOptions: {
    Images: 'Images',
  },
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

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

jest.mock('../../../components/common/KeyboardAvoidingWrapper', () => {
  return ({ children }) => children;
});

/**
 * EditableRow mock interactif
 */
jest.mock('../../../components/userInformation/EditableRow', () => {
  const React = require('react');
  const { TextInput, TouchableOpacity, Text } = require('react-native');

  return ({ label, value, onChange, onPress, isEditing }) => (
    <>
      <TouchableOpacity onPress={onPress}>
        <Text>{label}</Text>
      </TouchableOpacity>

      {isEditing && (
        <TextInput
          testID={`${label}-input`}
          value={value}
          onChangeText={onChange}
        />
      )}
    </>
  );
});

/* ===== TEST ===== */

describe('Profil – Test d’intégration', () => {
  it("permet de modifier le nom de l'utilisateur", async () => {
    const { getByText, getByTestId } = render(<Profil />);

    // Clique sur "Nom" pour activer l'édition
    fireEvent.press(getByText('Nom'));

    const input = getByTestId('Nom-input');

    fireEvent.changeText(input, 'Nouveau Nom');

    await waitFor(() => {
      expect(input.props.value).toBe('Nouveau Nom');
    });
  });
});
