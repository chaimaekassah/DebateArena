import React from 'react';
import { render } from '@testing-library/react-native';
import RootStack from '../RootStack';

const mockScreens = [];

// ✅ Mock NavigationContainer
jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }) => children,
}));

// ✅ Mock Native Stack Navigator
jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }) => children,
    Screen: ({ name }) => {
      mockScreens.push(name);
      return null;
    },
  }),
}));

// ✅ Mock des écrans
jest.mock('../../screens/Auth/Login', () => () => null);
jest.mock('../../screens/Auth/signup', () => () => null);
jest.mock('../AppTabs', () => () => null);
jest.mock('../../screens/Debate/Categories', () => () => null);
jest.mock('../../screens/Debate/Subject', () => () => null);
jest.mock('../../screens/Debate/Chat', () => () => null);
jest.mock('../../screens/Debate/StartDebate', () => () => null);
jest.mock('../../screens/UserInformation/Dashboard', () => () => null);
jest.mock('../../screens/Debate/DebateResult', () => () => null);
jest.mock('../../screens/Auth/ForgotPassword', () => () => null);

describe('RootStack – Test unitaire', () => {
  beforeEach(() => {
    mockScreens.length = 0; // reset
  });

  it('déclare correctement tous les écrans du Stack', () => {
    render(<RootStack />);

    expect(mockScreens).toEqual([
      'Login',
      'SignUp',
      'AppTabs',
      'Categories',
      'Subject',
      'Chat',
      'StartDebate',
      'Dashboard',
      'DebateResult',
      'ForgotPassword',
    ]);
  });
});
