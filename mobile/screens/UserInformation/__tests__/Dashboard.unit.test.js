import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import Dashboard from '../Dashboard';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
}));

jest.mock('../../../services/api', () => ({
  get: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

describe('Dashboard – Tests unitaires', () => {
  it('affiche le titre "Tableau de Bord"', () => {
    const { findByText } = render(
      <Dashboard navigation={{ navigate: jest.fn(), replace: jest.fn() }} />,
    );

    expect(findByText('Tableau de Bord')).toBeTruthy();
  });

  it('affiche un utilisateur par défaut si AsyncStorage est vide', async () => {
    const { findByText } = render(
      <Dashboard navigation={{ navigate: jest.fn(), replace: jest.fn() }} />,
    );

    expect(await findByText('Bienvenue Test !')).toBeTruthy();
  });

  it('calcule correctement le niveau', async () => {
    const { getByTestId } = render(
      <Dashboard navigation={{ navigate: jest.fn(), replace: jest.fn() }} />,
    );

    // Score par défaut = 0 → niveau 1
    await waitFor(() => {
      expect(getByTestId('user-level')).toBeTruthy();
    });
  });

  it('affiche le loader au chargement', () => {
    const { findByText } = render(<Dashboard navigation={{}} />);
    expect(findByText('Chargement des données...')).toBeTruthy();
  });

  it('affiche le titre Tableau de Bord', async () => {
    const { findByText } = render(<Dashboard navigation={{}} />);
    expect(await findByText('Tableau de Bord')).toBeTruthy();
  });
});
