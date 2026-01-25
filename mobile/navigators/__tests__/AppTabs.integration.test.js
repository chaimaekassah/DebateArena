import React from 'react';
import { render } from '@testing-library/react-native';
import AppTabs from '../AppTabs';

// ✅ Mock Bottom Tabs
jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => ({
    Navigator: ({ children }) => children,
    Screen: ({ component: Component }) => <Component />,
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

describe('AppTabs – Test d’intégration', () => {
  it('se rend sans erreur (montage OK)', () => {
    expect(() => {
      render(<AppTabs />);
    }).not.toThrow(); // ✅ LE BON TEST
  });
});
