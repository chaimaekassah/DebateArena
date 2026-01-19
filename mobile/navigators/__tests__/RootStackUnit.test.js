import React from 'react';
import { render } from '@testing-library/react-native';
import RootStack from '../RootStack';

jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }) => children,
}));

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }) => children,
    Screen: ({ component: Component }) => <Component />,
  }),
}));

describe('RootStack Navigation', () => {
  it('renders without crashing', () => {
    const tree = render(<RootStack />);
    expect(tree).toBeTruthy();
  });
});
