import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import Profil from '../Profil';
import api from '../../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('../../../services/api');

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

describe('Profil – tests d’intégration', () => {
  const navigation = { goBack: jest.fn(), replace: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.setItem('userToken', 'fake-token');
  });

  it('charge et affiche les données utilisateur', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        id: 1,
        nom: 'Doe',
        prenom: 'John',
        email: 'john@doe.com',
        role: 'UTILISATEUR',
      },
    });

    api.get.mockResolvedValueOnce({
      data: {
        totalDebats: 10,
        debatsGagnes: 7,
        tauxReussite: 70,
        niveau: 'INTERMEDIAIRE',
        score: 150,
      },
    });

    const { findByText, getAllByText } = render(
      <Profil navigation={navigation} />,
    );

    expect(await findByText('Mon Profil')).toBeTruthy();
    expect(await findByText(/John\s*Doe/)).toBeTruthy();
    expect(getAllByText('john@doe.com')).toBeTruthy();
    expect(await findByText('150 points')).toBeTruthy();
  });

  it('redirige vers Login si token absent', async () => {
    await AsyncStorage.clear();

    render(<Profil navigation={navigation} />);

    await waitFor(() => {
      expect(navigation.replace).toHaveBeenCalledWith('Login');
    });
  });
});
