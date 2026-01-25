import React from 'react';
import { render } from '@testing-library/react-native';
import Profil from '../Profil';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.spyOn(AsyncStorage, 'getItem').mockResolvedValue(null);

jest.mock('../../../components/styles', () => {
  const React = require('react');
  const { View, Text } = require('react-native');

  const Mock = ({ children }) => <View>{children}</View>;

  return {
    BackgroundContainer: Mock,
    InnerContainer: Mock,
    Shadow: Mock,
    ProgressBar: Mock,
    ProgressFill: Mock,
    SectionTitle: ({ children }) => <Text>{children}</Text>,
    FieldLabel: ({ children }) => <Text>{children}</Text>,
    StatLabel: ({ children }) => <Text>{children}</Text>,
    Colors: {
      white: '#fff',
      yellow: '#ff0',
      brand: '#000',
      dark: '#000',
      lightPink: '#ccc',
      green: '#0f0',
      pink: '#f0c',
    },
  };
});

describe('Profil – tests unitaires', () => {
  it('affiche le loader au chargement', () => {
    const { getByText } = render(<Profil navigation={{}} />);
    expect(getByText('Chargement du profil...')).toBeTruthy();
  });
});
