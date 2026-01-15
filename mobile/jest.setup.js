import '@testing-library/jest-native/extend-expect';

// ✅ Mock officiel AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// ✅ Silence warnings Animated
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
