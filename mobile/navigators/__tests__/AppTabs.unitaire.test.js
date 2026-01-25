import React from 'react';
import { render } from '@testing-library/react-native';
import AppTabs from '../AppTabs';

const mockScreens = [];

// ✅ Mock Bottom Tabs
jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => ({
    Navigator: ({ children }) => children,
    Screen: ({ name }) => {
      mockScreens.push(name);
      return null;
    },
  }),
}));

// ✅ Mock Ionicons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

// ✅ Mock des écrans
jest.mock('../../screens/UserInformation/Dashboard', () => () => null);
jest.mock('../../screens/UserInformation/Profil', () => () => null);
jest.mock('../../screens/Debate/NewDebate', () => () => null);

describe('AppTabs - Navigation par onglets', () => {
  beforeEach(() => {
    mockScreens.length = 0; // reset avant chaque test
  });

  it('déclare correctement les tabs Accueil, Débat et Profil', () => {
    render(<AppTabs />);

    expect(mockScreens).toEqual(['Accueil', 'Débat', 'Profil']);
  });
});
