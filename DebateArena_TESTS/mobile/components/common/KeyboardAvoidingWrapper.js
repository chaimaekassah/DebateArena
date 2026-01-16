import React from 'react';
import { KeyboardAvoidingView, ScrollView, TouchableWithoutFeedback, Keyboard, Platform } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const KeyboardAvoidingWrapper = ({ children }) => {
    return (
        <KeyboardAwareScrollView
           contentContainerStyle={{ flexGrow: 1 }}
           enableOnAndroid={true}
           keyboardShouldPersistTaps="handled"
           extraScrollHeight={20}
        >
          {children}
        </KeyboardAwareScrollView>
  );
};
export default KeyboardAvoidingWrapper;
