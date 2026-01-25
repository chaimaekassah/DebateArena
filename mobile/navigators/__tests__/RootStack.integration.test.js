/**
 * TEST D’INTÉGRATION – ROOTSTACK (NOUVEAU)
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

jest.mock('../../screens/Auth/Login', () => {
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
      <Button
        title="Forgot Password"
        onPress={() => navigation.navigate('ForgotPassword')}
      />
    </>
  );
});

jest.mock('../../screens/Auth/signup', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return () => <Text testID="signup-screen">SignUp Screen</Text>;
});

jest.mock('../../screens/Auth/ForgotPassword', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return () => (
    <Text testID="forgot-password-screen">Forgot Password Screen</Text>
  );
});

jest.mock('../../screens/UserInformation/Dashboard', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return () => <Text testID="dashboard-screen">Dashboard Screen</Text>;
});

jest.mock('../../screens/Debate/Categories', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return () => <Text testID="categories-screen">Categories Screen</Text>;
});

jest.mock('../../screens/Debate/Subject', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return () => <Text testID="subject-screen">Subject Screen</Text>;
});

jest.mock('../../screens/Debate/StartDebate', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return () => <Text testID="start-debate-screen">Start Debate Screen</Text>;
});

jest.mock('../../screens/Debate/Chat', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return () => <Text testID="chat-screen">Chat Screen</Text>;
});

jest.mock('../../screens/Debate/DebateResult', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return () => <Text testID="debate-result-screen">Debate Result Screen</Text>;
});

jest.mock('../../navigators/AppTabs', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return () => <Text testID="app-tabs-screen">App Tabs Screen</Text>;
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

describe('RootStack – Integration Test (Full)', () => {
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

  it('navigue vers ForgotPassword', async () => {
    const { getByText } = render(<RootStack />);
    fireEvent.press(getByText('Forgot Password'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('ForgotPassword');
    });
  });
});
