import React, {useState} from "react";
import { Formik } from "formik";
import { View, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

import api from '../../services/api'; 

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
       
        const response = await api.post('/auth/signup', {
          nom: credentials.nom,
          prenom: credentials.prenom,
          email: credentials.email.toLowerCase(), 
          password: credentials.password,
          // Pas de champ image - le backend utilisera default.jpg
        });
        
    
        const {id, nom, prenom, email, score, badgeMom, badgeCategorie, imageUrl} = response.data;

        // Stocker les données dans AsyncStorage
        await AsyncStorage.setItem('id', id.toString());
        await AsyncStorage.setItem('nom', nom);
        await AsyncStorage.setItem('prenom', prenom);
        await AsyncStorage.setItem('email', email);
        await AsyncStorage.setItem('score', score.toString());
        await AsyncStorage.setItem('badgeMom', badgeMom);
        await AsyncStorage.setItem('badgeCategorie', badgeCategorie);
        await AsyncStorage.setItem('imageUrl', imageUrl);

        console.log("Inscription réussie, utilisateur enregistré");
        
        // Afficher un message de succès et rediriger
        Alert.alert(
          "Inscription réussie !",
          "Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.",
          [
            { 
              text: "OK", 
              onPress: () => navigation.navigate("Login") 
            }
          ]
        );
        
      } catch (error) {
        console.log("Erreur d'inscription: ", error.response?.data || error.message);
        
        // Messages d'erreur plus précis
        let errorMessage = "Une erreur est survenue lors de l'inscription";
        
        if (error.response?.status === 400) {
          errorMessage = "Données invalides. Vérifiez vos informations.";
        } else if (error.response?.status === 409) {
          errorMessage = "Cet email est déjà utilisé.";
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
        
        Alert.alert("Erreur d'inscription", errorMessage);
      } finally {
        setIsLoading(false);
      }
    }

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

            // Validation email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(values.email)) {
                Alert.alert("Email invalide", "Veuillez entrer une adresse email valide");
                return;
            }

            // Validation mot de passe (au moins 6 caractères)
            if (values.password.length < 6) {
                Alert.alert("Mot de passe trop court", "Le mot de passe doit contenir au moins 6 caractères");
                return;
            }

            setShowAllFieldsError(false);
            console.log("Données d'inscription:", values);

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
              />
              <MyTextInput
                placeholder="Prénom"
                placeholderTextColor={grey}
                onChangeText={handleChange("prenom")}
                onBlur={handleBlur("prenom")}
                value={values.prenom}
              />
              <MyTextInput
                placeholder="votreemail@exemple.com"
                placeholderTextColor={grey}
                onChangeText={handleChange("email")}
                onBlur={handleBlur("email")}
                value={values.email}
                keyboardType="email-address"
                autoCapitalize="none"
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
              
              {showAllFieldsError && (
                <Label style={{color: "red", textAlign: "center", marginVertical: 10, marginBottom: 30}}>
                  {values.password !== values.confirmPassword && values.password && values.confirmPassword
                    ? "Les mots de passe ne correspondent pas"
                    : "Tous les champs sont obligatoires"
                  }
                </Label>
              )}

              <Shadow>
                <StyledButton onPress={handleSubmit} disabled={isLoading}>
                  <ButtonText>{isLoading ? "Inscription..." : "INSCRIPTION"}</ButtonText>
                </StyledButton>
              </Shadow>

              <TextLink onPress={() => navigation.navigate("Login")}>
                <TextLinkContent style={{marginBottom: 60}}>
                  Déjà inscrit-e ? Connectez-vous
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