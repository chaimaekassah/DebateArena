/**
 * TEST D’INTÉGRATION – ROOTSTACK
 */

/* =========================
   MOCK REACT NAVIGATION
   ========================= */

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => {
  return {
    NavigationContainer: ({ children }) => children,
    useNavigation: () => ({
      navigate: jest.fn(),
    }),
  };
});

jest.mock('@react-navigation/native-stack', () => {
  return {
    createNativeStackNavigator: () => ({
      Navigator: ({ children }) => children,
      Screen: ({ component: Component }) => (
        <Component navigation={{ navigate: mockNavigate }} />
      ),
    }),
  };
});

/* =========================
   MOCK DES ÉCRANS
   ========================= */

jest.mock('../../screens/Login', () => {
  const React = require('react');
  const { Text, Button } = require('react-native');

  return ({ navigation }) => (
    <>
      <Text testID="login-screen">Login Screen</Text>

      <Button
        title="Go to SignUp"
        onPress={() => navigation.navigate('SignUp')}
      />

      <Button title="Login" onPress={() => navigation.navigate('Dashboard')} />
    </>
  );
});

jest.mock('../../screens/signup', () => {
  const React = require('react');
  const { Text } = require('react-native');

  return () => <Text testID="signup-screen">SignUp Screen</Text>;
});

jest.mock('../../screens/Dashboard', () => {
  const React = require('react');
  const { Text } = require('react-native');

  return () => <Text testID="dashboard-screen">Dashboard Screen</Text>;
});

/* =========================
   IMPORTS
   ========================= */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import RootStack from '../RootStack';

/* =========================
   TESTS
   ========================= */

describe('RootStack – Integration Test', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('affiche Login au démarrage', () => {
    const { getByTestId } = render(<RootStack />);
    expect(getByTestId('login-screen')).toBeTruthy();
  });

  it('navigue vers SignUp', async () => {
    const { getByText } = render(<RootStack />);

    fireEvent.press(getByText('Go to SignUp'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('SignUp');
    });
  });

  it('navigue vers Dashboard', async () => {
    const { getByText } = render(<RootStack />);

    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('Dashboard');
    });
  });
});
