// screens/UserInformation/__tests__/Dashboard.integration.test.js

import React from 'react';
import { render } from '@testing-library/react-native';
import Dashboard from '../Dashboard';

describe('Dashboard - Test d’intégration', () => {
  it('affiche le texte avec le composant Label réel', () => {
    const { getByText } = render(<Dashboard />);

    expect(getByText('Dashboard à remplir')).toBeTruthy();
  });
});
