import '@testing-library/jest-native/extend-expect';

// ✅ Mock officiel AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('react-native-screens', () => ({ enableScreens: jest.fn() }));

// ✅ Silence warnings Animated
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

jest.mock('expo-asset', () => ({ Asset: { loadAsync: jest.fn() } }));
jest.mock('expo-font', () => ({ loadAsync: jest.fn() }));

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  return {
    Ionicons: (props) => React.createElement('Ionicons', props, null),
    AntDesign: (props) => React.createElement('AntDesign', props, null),
    MaterialIcons: (props) => React.createElement('MaterialIcons', props, null),
    FontAwesome: (props) => React.createElement('FontAwesome', props, null),
  };
});

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// ✅ Mock navigation si besoin
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

// ✅ Mock KeyboardAvoidingWrapper
jest.mock('./components/KeyboardAvoidingWrapper', () => {
  const React = require('react');
  return ({ children }) => <>{children}</>;
});

jest.mock('react-native-keyboard-aware-scroll-view', () => {
  const { ScrollView } = require('react-native');
  return {
    KeyboardAwareScrollView: ScrollView,
  };
});

jest.mock('react-native-keyboard-aware-scroll-view', () => {
  const { ScrollView } = require('react-native');
  return {
    KeyboardAwareScrollView: ScrollView,
  };
});

jest.mock('react-native-keyboard-aware-scroll-view', () => {
  const { ScrollView } = require('react-native');
  return {
    KeyboardAwareScrollView: ScrollView,
  };
});
jest.mock('react-native-keyboard-aware-scroll-view', () => {
  const { ScrollView } = require('react-native');
  return {
    KeyboardAwareScrollView: ScrollView,
  };
});

//✅ Mock KeyboardAwareScrollView
jest.mock('react-native-keyboard-aware-scroll-view', () => {
  const { ScrollView } = require('react-native');
  return {
    KeyboardAwareScrollView: ScrollView,
  };
});

//✅ Silence act() warnings
jest.spyOn(console, 'error').mockImplementation((message) => {
  if (message.includes('act(...)') || message.includes('Animated')) {
    return;
  }
  console.warn(message);
});

// --------------------
// Mock React Navigation
// --------------------
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    NavigationContainer: ({ children }) => children,
  };
});

jest.mock('@react-navigation/native-stack', () => {
  const React = require('react');
  return {
    createNativeStackNavigator: jest.fn(() => {
      return {
        Navigator: ({ children }) =>
          React.createElement('Navigator', null, children),
        Screen: ({ children }) => React.createElement('Screen', null, children),
      };
    }),
  };
});
console.log('🔥 JEST SETUP LOADED');
