import React, { useState } from 'react';
import { Formik } from 'formik';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import api from '../../services/api';

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

const SignUp = ({ navigation }) => {
  const [hidePassword, setHidePassword] = useState(true);
  const [showAllFieldsError, setShowAllFieldsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (credentials) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/signup', credentials);
      const { id, nom, prenom, email, score, badgeNom, badgeCategorie } =
        response.data;

      //stocker
      await AsyncStorage.setItem('id', id.toString());
      await AsyncStorage.setItem('nom', nom);
      await AsyncStorage.setItem('prenom', prenom);
      await AsyncStorage.setItem('email', email);
      await AsyncStorage.setItem('score', score.toString());
      await AsyncStorage.setItem('badgeNom', badgeNom);
      await AsyncStorage.setItem('badgeCategorie', badgeCategorie);

      console.log('Inscription réussie, utilisateur enregistré');
      navigation.navigate('Login');
    } catch (error) {
      console.log('Erreur: ', error.response?.data || error.message);
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
              initialValues={{
                nom: '',
                prenom: '',
                email: '',
                password: '',
                confirmPassword: '',
              }}
              onSubmit={(values) => {
                const allFieldsFilled =
                  values.nom.trim() !== '' &&
                  values.prenom.trim() !== '' &&
                  values.email.trim() !== '' &&
                  values.password.trim() !== '' &&
                  values.confirmPassword.trim() !== '';

                if (!allFieldsFilled) {
                  setShowAllFieldsError(true);
                  return;
                }

                if (values.password !== values.confirmPassword) {
                  setShowAllFieldsError(true);
                  return;
                }

                setShowAllFieldsError(false);
                console.log(values);

                const { confirmPassword, ...filteredData } = values;
                handleSignUp(filteredData);
              }}
            >
              {({ handleChange, handleBlur, handleSubmit, values }) => (
                <StyledFormArea>
                  <MyTextInput
                    placeholder="Nom"
                    placeholderTextColor={grey}
                    onChangeText={handleChange('nom')}
                    onBlur={handleBlur('nom')}
                    value={values.nom}
                  />
                  <MyTextInput
                    placeholder="Prénom"
                    placeholderTextColor={grey}
                    onChangeText={handleChange('prenom')}
                    onBlur={handleBlur('prenom')}
                    value={values.prenom}
                  />
                  <MyTextInput
                    placeholder="votreemail@exemple.com"
                    placeholderTextColor={grey}
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                    value={values.email}
                    keyboardType="email-address"
                  />
                  <Label>Mot de passe</Label>
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
                  <Label>Confirmez le mot de passe</Label>
                  <MyTextInput
                    testID="confirm-password-input"
                    placeholder="*************"
                    placeholderTextColor={grey}
                    onChangeText={handleChange('confirmPassword')}
                    onBlur={handleBlur('confirmPassword')}
                    value={values.confirmPassword}
                    secureTextEntry={hidePassword}
                    isPassword={true}
                    hidePassword={hidePassword}
                    setHidePassword={setHidePassword}
                  />
                  <TextLink>
                    <TextLinkContent
                      style={{ marginBottom: 30 }}
                    ></TextLinkContent>
                  </TextLink>
                  {showAllFieldsError && (
                    <Label
                      style={{
                        color: 'red',
                        textAlign: 'center',
                        marginVertical: 10,
                        marginBottom: 30,
                      }}
                    >
                      {values.password !== values.confirmPassword &&
                      values.password &&
                      values.confirmPassword
                        ? 'Les mots de passe ne correspondent pas'
                        : 'Tous les champs sont obligatoires'}
                    </Label>
                  )}
                  <Shadow>
                    <StyledButton onPress={handleSubmit} disabled={isLoading}>
                      <ButtonText>
                        {isLoading ? 'Inscription...' : 'INSCRIPTION'}
                      </ButtonText>
                    </StyledButton>
                  </Shadow>

                  <TextLink onPress={() => navigation.navigate('Login')}>
                    <TextLinkContent style={{ marginBottom: 60 }}>
                      Déjà inscrit-e ?
                    </TextLinkContent>
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

export default SignUp;
