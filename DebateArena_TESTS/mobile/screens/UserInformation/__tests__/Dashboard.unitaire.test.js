// screens/UserInformation/__tests__/Dashboard.unitaire.test.js

import React from 'react';
import { render } from '@testing-library/react-native';
import Dashboard from '../Dashboard';

// ✅ Chemin corrigé
jest.mock('../../../components/styles', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    Label: ({ children }) => <Text>{children}</Text>,
  };
});

describe('Dashboard - Test Unitaire', () => {
  it('affiche le texte du dashboard', () => {
    const { getByText } = render(<Dashboard />);
    expect(getByText('Dashboard à remplir')).toBeTruthy();
  });
});
