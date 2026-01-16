import React from 'react';
import { render } from '@testing-library/react-native';
import AppTabs from '../AppTabs';

/**
 * 🔹 Intégration = AppTabs + vrais écrans
 * 🔹 On mock uniquement le moteur de navigation
 */

// ✅ Mock Bottom Tabs (obligatoire)
jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => ({
    Navigator: ({ children }) => children,
    Screen: ({ component: Component }) => <Component />,
  }),
}));

// ✅ Mock Ionicons (UI only)
jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

describe('AppTabs – Test d’intégration', () => {
  it('rend correctement les écrans sans erreur', () => {
    const { toJSON } = render(<AppTabs />);

    // 🔹 Vérifie que tout l’arbre se rend
    expect(toJSON()).toBeTruthy();
  });
});
