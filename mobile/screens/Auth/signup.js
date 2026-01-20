import React, {useState, useRef} from "react";
import { Formik } from "formik";
import { View, Alert, TextInput } from "react-native";
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
    const [hideConfirmPassword, setHideConfirmPassword] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    
    // Références pour la navigation entre champs
    const prenomRef = useRef(null);
    const emailRef = useRef(null);
    const passwordRef = useRef(null);
    const confirmPasswordRef = useRef(null);

    const handleSignUp = async (credentials) => {
      setIsLoading(true);

      try {
        console.log("Tentative d'inscription avec :", credentials);

        // Créer FormData comme montré dans Postman
        const formData = new FormData();
        
        // Ajouter les champs textuels (identique à Postman)
        formData.append('nom', credentials.nom.trim());
        formData.append('prenom', credentials.prenom.trim());
        formData.append('email', credentials.email.toLowerCase().trim());
        formData.append('password', credentials.password);
        
        // Optionnel : si vous voulez envoyer une image vide
        // formData.append('image', {
        //   uri: '', // Laisser vide pour utiliser l'image par défaut
        //   type: 'image/jpeg',
        //   name: 'default.jpg'
        // });

        console.log("FormData créé");

        const response = await axios.post(
          'http://192.168.11.180:8080/api/auth/signup',
          formData,
          {
            timeout: 30000, // 30 secondes
            headers: {
              'Content-Type': 'multipart/form-data',
              'Accept': 'application/json'
            },
            // Important pour FormData avec axios
            transformRequest: (data) => data,
          }
        );

        console.log("✅ Réponse API (status:", response.status, "):", response.data);

        if (response.status === 200) {
          const userData = {
            id: response.data.id?.toString() || '',
            nom: response.data.nom || '',
            prenom: response.data.prenom || '',
            email: response.data.email || '',
            score: response.data.score || 0,
            badgeNom: response.data.badgeNom || 'Nouveau Débattreur',
            imageUrl: response.data.imageUrl || 'uploads/avatars/default.png'
          };

          console.log("Données utilisateur:", userData);

          // Stockage dans AsyncStorage
          await AsyncStorage.multiSet([
            ['user_id', userData.id],
            ['user_nom', userData.nom],
            ['user_prenom', userData.prenom],
            ['user_email', userData.email],
            ['user_score', userData.score.toString()],
            ['user_badge', userData.badgeNom],
            ['user_image', userData.imageUrl],
          ]);

          Alert.alert(
            "🎉 Inscription réussie !",
            `Bienvenue ${userData.prenom} ${userData.nom} !\n\nVotre compte a été créé avec succès.`,
            [{ 
              text: "Se connecter", 
              onPress: () => {
                // Naviguer vers Login avec l'email pré-rempli
                navigation.navigate("Login", { 
                  preFilledEmail: userData.email 
                });
              }
            }]
          );
        }

      } catch (error) {
        console.log("❌ ERREUR API ==========================");
        console.log("URL: http://192.168.11.180:8080/api/auth/signup");
        console.log("Method: POST");
        console.log("Status:", error.response?.status);
        console.log("Status Text:", error.response?.statusText);
        console.log("Headers réponse:", error.response?.headers);
        console.log("Data erreur:", error.response?.data);
        console.log("Message:", error.message);
        console.log("Code:", error.code);
        console.log("Config:", error.config);
        console.log("========================================");

        let errorMessage = "Une erreur est survenue lors de l'inscription";
        
        if (error.code === 'ECONNABORTED') {
          errorMessage = "Timeout: Le serveur ne répond pas.\n\nVérifiez:\n1. L'adresse IP (192.168.11.169)\n2. Que le serveur est démarré\n3. Votre connexion réseau";
        } else if (error.response?.status === 400) {
          errorMessage = error.response.data || "Email déjà utilisé ou données invalides";
        } else if (error.response?.status === 500) {
          errorMessage = "Erreur interne du serveur";
        } else if (!error.response) {
          errorMessage = `Impossible de joindre le serveur: ${error.message}\n\nURL: http://192.168.11.169:8080/api/auth/signup`;
        }

        Alert.alert(
          "❌ Erreur d'inscription",
          errorMessage,
          [
            { 
              text: "Tester la connexion", 
              onPress: () => testServerConnection() 
            },
            { text: "OK" }
          ]
        );

      } finally {
        setIsLoading(false);
      }
    };

    const testServerConnection = async () => {
      try {
        Alert.alert("Test de connexion", "Vérification du serveur...");
        
        const testResponse = await axios.get(
          'http://192.168.11.169:8080',
          { timeout: 5000 }
        );
        
        Alert.alert(
          "✅ Serveur accessible",
          `Status: ${testResponse.status}\nLe serveur répond.`
        );
      } catch (testError) {
        Alert.alert(
          "❌ Serveur inaccessible",
          `Erreur: ${testError.message}\n\nURL testée: http://192.168.11.169:8080`
        );
      }
    };

    // Composant MyTextInput avec ref support
    const MyTextInput = React.forwardRef(({icon, isPassword, hidePassword, setHidePassword, ...props }, ref) => {
      return (
        <View>
          <Shadow>
            <StyledTextInput ref={ref} {...props} />
            {isPassword && (
              <RightIcon onPress={() => setHidePassword(!hidePassword)}>
                <Ionicons name={hidePassword ? 'eye-off' : 'eye'} size={30} color={grey}/>
              </RightIcon>
            )}
          </Shadow>
        </View>
      );
    });

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
                    returnKeyType="next"
                    onSubmitEditing={() => prenomRef.current?.focus()}
                  />
                  
                  <MyTextInput
                    ref={prenomRef}
                    placeholder="Prénom"
                    placeholderTextColor={grey}
                    onChangeText={handleChange("prenom")}
                    onBlur={handleBlur("prenom")}
                    value={values.prenom}
                    autoCapitalize="words"
                    returnKeyType="next"
                    onSubmitEditing={() => emailRef.current?.focus()}
                  />
                  
                  <MyTextInput
                    ref={emailRef}
                    placeholder="votreemail@exemple.com"
                    placeholderTextColor={grey}
                    onChangeText={handleChange("email")}
                    onBlur={handleBlur("email")}
                    value={values.email}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    returnKeyType="next"
                    onSubmitEditing={() => passwordRef.current?.focus()}
                  />
                  
                  <Label>Mot de passe (minimum 6 caractères)</Label>
                  <MyTextInput
                    ref={passwordRef}
                    placeholder="*************"
                    placeholderTextColor={grey}
                    onChangeText={handleChange("password")}
                    onBlur={handleBlur("password")}
                    value={values.password}
                    secureTextEntry={hidePassword}
                    isPassword={true}
                    hidePassword={hidePassword}
                    setHidePassword={setHidePassword}
                    returnKeyType="next"
                    onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                  />
                  
                  <Label>Confirmez le mot de passe</Label>
                  <MyTextInput
                    ref={confirmPasswordRef}
                    placeholder="*************"
                    placeholderTextColor={grey}
                    onChangeText={handleChange("confirmPassword")}
                    onBlur={handleBlur("confirmPassword")}
                    value={values.confirmPassword}
                    secureTextEntry={hideConfirmPassword}
                    isPassword={true}
                    hidePassword={hideConfirmPassword}
                    setHidePassword={setHideConfirmPassword}
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit}
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
                    marginTop: 10,
                    fontStyle: 'italic'
                  }}>
                    Une photo de profil par défaut vous sera automatiquement attribuée.
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

export default SignUp;