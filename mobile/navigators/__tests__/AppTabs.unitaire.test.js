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
jest.mock('../../screens/Debate/StartDebate', () => () => null);

describe('AppTabs - Test Unitaire', () => {
  beforeEach(() => {
    mockScreens.length = 0; // reset
  });

  it('déclare correctement les tabs', () => {
    render(<AppTabs />); // ✅ OBLIGATOIRE

    expect(mockScreens).toEqual([
      'Dashboard',
      'StartDebate',
      'Profile',
    ]);
  });
});
