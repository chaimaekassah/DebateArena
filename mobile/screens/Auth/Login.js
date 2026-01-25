import React, { useState } from 'react';
import { Formik } from 'formik';
import { View, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';

import { Ionicons } from '@expo/vector-icons';

//keyboard avoiding view
import KeyboardAvoidingWrapper from '../../components/common/KeyboardAvoidingWrapper';

import {
  InnerContainer,
  PageLogo,
  BackgroundContainer,
  StyledFormArea,
  StyledButton,
  ButtonText,
  StyledTextInput,
  Colors,
  RightIcon,
  TextLink,
  TextLinkContent,
  Shadow,
  Label,
} from '../../components/styles';

const { grey } = Colors;

const Login = ({ navigation }) => {
  const [hidePassword, setHidePassword] = useState(true);
  const [showAllFieldsError, setShowAllFieldsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (credentials) => {
    setIsLoading(true);
    try {
      console.log('Tentative de connexion avec:', credentials);

      // Supprimer l'ancien token si présent
      await AsyncStorage.removeItem('userToken');

      const loginData = {
        email: credentials.email.toLowerCase().trim(),
        password: credentials.password,
      };

      console.log('Données envoyées:', JSON.stringify(loginData, null, 2));

      // Appel API SANS token dans les headers
      const response = await api.post('/auth/signin', loginData, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      const { token, role } = response.data;
      console.log('Connexion réussie, token reçu');
      console.log('Rôle:', role);

      // Stocker le NOUVEAU token
      await AsyncStorage.multiSet([
        ['userToken', token],
        ['userRole', role],
        ['email', credentials.email],
        ['isLoggedIn', 'true'],
      ]);

      console.log('Nouveau token stocké avec succès');

      // Rediriger
      navigation.navigate('AppTabs');
    } catch (error) {
      console.log('ERREUR détaillée de connexion:');
      console.log('- Message:', error.message);
      console.log('- Status:', error.response?.status);
      console.log('- Data:', error.response?.data);

      Alert.alert(
        '❌ Erreur de connexion',
        error.response?.data?.message || 'Email ou mot de passe incorrect',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingWrapper>
      <BackgroundContainer
        source={require('../../assets/img/fond2.png')}
        resizeMode="cover"
      >
        <ScrollView>
          <InnerContainer style={{ marginTop: 70 }}>
            <PageLogo
              resizeMode="contain"
              source={require('../../assets/img/logo3Dfinalfinal.png')}
            />

            <Formik
              initialValues={{ email: '', password: '' }}
              onSubmit={(values) => {
                const allFieldsFilled =
                  values.email.trim() !== '' && values.password.trim() !== '';

                if (!allFieldsFilled) {
                  setShowAllFieldsError(true);
                  return;
                }
                setShowAllFieldsError(false);
                handleLogin(values);
                console.log(values);
              }}
            >
              {({ handleChange, handleBlur, handleSubmit, values }) => (
                <StyledFormArea>
                  <MyTextInput
                    testID="email-input"
                    placeholder="votreemail@exemple.com"
                    placeholderTextColor={grey}
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                    value={values.email}
                    keyboardType="email-address"
                  />
                  <MyTextInput
                    testID="password-input"
                    placeholder="*************"
                    placeholderTextColor={grey}
                    onChangeText={handleChange('password')}
                    onBlur={handleBlur('password')}
                    value={values.password}
                    secureTextEntry={hidePassword}
                    isPassword={true}
                    hidePassword={hidePassword}
                    setHidePassword={setHidePassword}
                  />
                  <TextLink
                    onPress={() => navigation.navigate('ForgotPassword')}
                  >
                    <TextLinkContent style={{ marginBottom: 60 }}>
                      Mot de passe oublié?
                    </TextLinkContent>
                  </TextLink>
                  <Shadow>
                    {showAllFieldsError && (
                      <Label
                        style={{
                          color: 'red',
                          textAlign: 'center',
                          marginVertical: 10,
                          marginBottom: 30,
                        }}
                      >
                        Tous les champs sont obligatoires
                      </Label>
                    )}
                    <StyledButton onPress={handleSubmit} disabled={isLoading}>
                      <ButtonText>
                        {isLoading ? 'Connexion...' : 'CONNEXION'}
                      </ButtonText>
                    </StyledButton>
                  </Shadow>
                  <TextLink onPress={() => navigation.navigate('SignUp')}>
                    <TextLinkContent>Je m'inscris</TextLinkContent>
                  </TextLink>
                </StyledFormArea>
              )}
            </Formik>
          </InnerContainer>
        </ScrollView>
      </BackgroundContainer>
    </KeyboardAvoidingWrapper>
  );
};

const MyTextInput = ({
  icon,
  isPassword,
  hidePassword,
  setHidePassword,
  ...props
}) => {
  return (
    <View>
      <Shadow>
        <StyledTextInput {...props} />
        {isPassword && (
          <RightIcon onPress={() => setHidePassword(!hidePassword)}>
            <Ionicons
              name={hidePassword ? 'eye-off' : 'eye'}
              size={30}
              color={grey}
            />
          </RightIcon>
        )}
      </Shadow>
    </View>
  );
};

export default Login;
