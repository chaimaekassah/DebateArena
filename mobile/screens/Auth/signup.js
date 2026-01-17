import React, {useState} from "react";
import { Formik } from "formik";
import { View, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

import axios from 'axios';

import KeyboardAvoidingWrapper from "../../components/common/KeyboardAvoidingWrapper";

import {
  InnerContainer, PageLogo, BackgroundContainer,
  StyledFormArea, StyledButton, ButtonText,
  StyledTextInput, Colors, RightIcon,
  TextLink,
  TextLinkContent,
  Shadow, Label
} from "../../components/styles";

const { grey } = Colors;

const SignUp = ({navigation}) => {
    const [hidePassword, setHidePassword] = useState(true);
    const [showAllFieldsError, setShowAllFieldsError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSignUp = async (credentials) => {
      setIsLoading(true);

      try {
        console.log("Tentative d'inscription avec :", credentials);

        const formData = new FormData();
        formData.append('nom', credentials.nom);
        formData.append('prenom', credentials.prenom);
        formData.append('email', credentials.email.toLowerCase().trim());
        formData.append('password', credentials.password);

        const response = await axios.post(
          'http://192.168.11.169:8080/api/auth/signup',
          formData
        );

        console.log("Inscription réussie :", response.data);

        const { id, nom, prenom, email } = response.data;

        await AsyncStorage.multiSet([
          ['id', id.toString()],
          ['nom', nom],
          ['prenom', prenom],
          ['email', email],
          ['isLoggedIn', 'true'],
        ]);

        Alert.alert(
          "🎉 Inscription réussie !",
          "Votre compte a été créé avec succès.",
          [{ text: "Se connecter", onPress: () => navigation.navigate("Login") }]
        );

      } catch (error) {
        console.log("ERREUR inscription :", error.response?.data || error.message);
        console.log("Status :", error.response?.status);

        Alert.alert(
          "❌ Erreur d'inscription",
          error.response?.data?.message || "Impossible de créer le compte"
        );

      } finally {
        setIsLoading(false);
      }
    };


  return (
   <KeyboardAvoidingWrapper>
    <BackgroundContainer
      source={require("../../assets/img/fond2.png")}
      resizeMode="cover"
    >
    <ScrollView>
      <InnerContainer style={{marginTop:70}}>

        <PageLogo
          resizeMode="contain"
          source={require("../../assets/img/logo3Dfinalfinal.png")}
        />
    
        <Formik
          initialValues={{ nom: '', prenom: '', email:'',password:'', confirmPassword:''}}
          onSubmit={(values) => {
            // Validation
            const allFieldsFilled =
               values.nom.trim() !== '' &&
               values.prenom.trim() !== '' &&
               values.email.trim() !== '' &&
               values.password.trim() !== '' &&
               values.confirmPassword.trim() !== '';

            if (!allFieldsFilled) {
                Alert.alert("Champs manquants", "Tous les champs sont obligatoires");
                return;
            }

            if (values.password !== values.confirmPassword) {
                Alert.alert("Mots de passe différents", "Les mots de passe ne correspondent pas");
                return;
            }

            // Validation email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(values.email)) {
                Alert.alert("Email invalide", "Veuillez entrer une adresse email valide");
                return;
            }

            // Validation mot de passe
            if (values.password.length < 6) {
                Alert.alert("Mot de passe trop court", "Le mot de passe doit contenir au moins 6 caractères");
                return;
            }

            console.log("Données d'inscription validées:", values);

            const { confirmPassword, ...filteredData } = values;
            handleSignUp(filteredData);
          }}
        >
          {({ handleChange, handleBlur, handleSubmit, values }) => (
            <StyledFormArea>
              <MyTextInput
                placeholder="Nom"
                placeholderTextColor={grey}
                onChangeText={handleChange("nom")}
                onBlur={handleBlur("nom")}
                value={values.nom}
                autoCapitalize="words"
              />
              <MyTextInput
                placeholder="Prénom"
                placeholderTextColor={grey}
                onChangeText={handleChange("prenom")}
                onBlur={handleBlur("prenom")}
                value={values.prenom}
                autoCapitalize="words"
              />
              <MyTextInput
                placeholder="votreemail@exemple.com"
                placeholderTextColor={grey}
                onChangeText={handleChange("email")}
                onBlur={handleBlur("email")}
                value={values.email}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
              <Label>Mot de passe (minimum 6 caractères)</Label>
              <MyTextInput
                placeholder="*************"
                placeholderTextColor={grey}
                onChangeText={handleChange("password")}
                onBlur={handleBlur("password")}
                value={values.password}
                secureTextEntry={hidePassword}
                isPassword={true}
                hidePassword={hidePassword}
                setHidePassword={setHidePassword}
              />
              <Label>Confirmez le mot de passe</Label>
              <MyTextInput
                placeholder="*************"
                placeholderTextColor={grey}
                onChangeText={handleChange("confirmPassword")}
                onBlur={handleBlur("confirmPassword")}
                value={values.confirmPassword}
                secureTextEntry={hidePassword}
                isPassword={true}
                hidePassword={hidePassword}
                setHidePassword={setHidePassword}
              />
              
              <TextLink>
                <TextLinkContent style={{marginBottom: 30}}></TextLinkContent>
              </TextLink>

              <Shadow>
                <StyledButton onPress={handleSubmit} disabled={isLoading}>
                  <ButtonText>
                    {isLoading ? "Inscription en cours..." : "S'INSCRIRE"}
                  </ButtonText>
                </StyledButton>
              </Shadow>

              <TextLink onPress={() => navigation.navigate("Login")}>
                <TextLinkContent style={{marginBottom: 60}}>
                  Déjà un compte ? Se connecter
                </TextLinkContent>
              </TextLink>

              <Label style={{
                textAlign: 'center', 
                color: '#666', 
                fontSize: 12,
                marginTop: 10
              }}>
                Une photo de profil par défaut vous sera attribuée.
                Vous pourrez la modifier plus tard.
              </Label>

            </StyledFormArea>
          )}
        </Formik>
      </InnerContainer>
      </ScrollView>
    </BackgroundContainer>
    </KeyboardAvoidingWrapper>
  );
};

const MyTextInput = ({icon, isPassword, hidePassword, setHidePassword, ...props }) => {
  return (
    <View>
      <Shadow>
        <StyledTextInput {...props} />
        {isPassword && (
          <RightIcon onPress={() => setHidePassword(!hidePassword)}>
            <Ionicons name={hidePassword ? 'eye-off' : 'eye'} size={30} color={grey}/>
          </RightIcon>
        )}
        </Shadow>
    </View>
  );
};

export default SignUp;