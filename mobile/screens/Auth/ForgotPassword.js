import React, { useState } from "react";
import {
  View,
  ScrollView,
  Alert,
  ActivityIndicator
} from "react-native";
import api from '../../services/api';
import { Ionicons } from "@expo/vector-icons";

import KeyboardAvoidingWrapper from "../../components/common/KeyboardAvoidingWrapper";

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
  Label
} from "../../components/styles";

const { white, blue, grey } = Colors;

const ForgotPassword = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [hidePassword, setHidePassword] = useState(true);
  const [hideConfirmPassword, setHideConfirmPassword] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});

  // Validation simple
  const validateStep1 = () => {
    const newErrors = {};
    
    if (!email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email invalide";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (!token.trim()) {
      newErrors.token = "Le token est requis";
    }
    
    if (!newPassword.trim()) {
      newErrors.newPassword = "Le mot de passe est requis";
    } else if (newPassword.length < 6) {
      newErrors.newPassword = "Minimum 6 caractères";
    }
    
    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "La confirmation est requise";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Étape 1: Demander l'email - FORMAT CORRIGÉ
  const handleForgotPassword = async () => {
    if (!validateStep1()) return;
    
    setIsLoading(true);
    try {
      console.log("📧 Demande de réinitialisation pour:", email);
      
      // FORMAT CORRIGÉ : envoyer les données dans le body
      const response = await api.post('/auth/forgot-password', {
        email: email.trim()
      });
      
      console.log("✅ Réponse:", response.data);
      setUserEmail(email);
      setStep(2);
      
      Alert.alert(
        "✅ Email envoyé",
        "Si votre email existe dans notre système, vous recevrez un lien de réinitialisation.",
        [{ text: "Continuer" }]
      );
      
    } catch (error) {
      console.error("❌ Erreur:", error);
      Alert.alert(
        "❌ Erreur",
        error.response?.data?.message || "Une erreur est survenue"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Étape 2: Réinitialiser avec token - FORMAT CORRIGÉ
  const handleResetPassword = async () => {
    if (!validateStep2()) return;
    
    setIsLoading(true);
    try {
      console.log("🔄 Réinitialisation avec token:", token);
      
      // FORMAT CORRIGÉ : envoyer les données dans le body
      const response = await api.post('/auth/reset-password', {
        token: token,
        newPassword: newPassword
      });
      
      console.log("✅ Réponse:", response.data);
      
      Alert.alert(
        "✅ Succès !",
        "Votre mot de passe a été réinitialisé. Vous pouvez maintenant vous connecter.",
        [
          {
            text: "Se connecter",
            onPress: () => navigation.navigate("Login")
          }
        ]
      );
      
    } catch (error) {
      console.error("❌ Erreur de réinitialisation:", error);
      Alert.alert(
        "❌ Erreur",
        error.response?.data?.message || "Le token est invalide ou a expiré"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <StyledFormArea>
      <Label style={{ textAlign: 'center', marginBottom: 30, fontSize: 16, color: grey }}>
        Entrez votre adresse email pour recevoir un lien de réinitialisation
      </Label>
      
      <View style={{ marginBottom: 25 }}>
        <StyledTextInput
          placeholder="votreemail@exemple.com"
          placeholderTextColor={grey}
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (errors.email) setErrors({...errors, email: null});
          }}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {errors.email && (
          <Label style={{ color: "#FF6B6B", fontSize: 12, marginTop: 5 }}>
            {errors.email}
          </Label>
        )}
      </View>
      
      <Shadow>
        <StyledButton onPress={handleForgotPassword} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator size="small" color={white} />
          ) : (
            <ButtonText>ENVOYER LE LIEN</ButtonText>
          )}
        </StyledButton>
      </Shadow>
      
      <TextLink onPress={() => navigation.navigate("Login")} style={{ marginTop: 20 }}>
        <TextLinkContent style={{ color: blue }}>
          ← Retour à la connexion
        </TextLinkContent>
      </TextLink>
    </StyledFormArea>
  );

  const renderStep2 = () => (
    <StyledFormArea>
      <Label style={{ textAlign: 'center', marginBottom: 30, fontSize: 16, color: grey }}>
        Email: {userEmail}
      </Label>
      
      <Label style={{ marginBottom: 5, color: white }}>Token reçu par email</Label>
      <View style={{ marginBottom: 20 }}>
        <StyledTextInput
          placeholder="ex: abc123def456ghi789"
          placeholderTextColor={grey}
          value={token}
          onChangeText={(text) => {
            setToken(text);
            if (errors.token) setErrors({...errors, token: null});
          }}
          autoCapitalize="none"
        />
        {errors.token && (
          <Label style={{ color: "#FF6B6B", fontSize: 12, marginTop: 5 }}>
            {errors.token}
          </Label>
        )}
      </View>
      
      <Label style={{ marginBottom: 5, color: white }}>Nouveau mot de passe</Label>
      <View style={{ marginBottom: 20 }}>
        <View>
          <StyledTextInput
            placeholder="Minimum 6 caractères"
            placeholderTextColor={grey}
            value={newPassword}
            onChangeText={(text) => {
              setNewPassword(text);
              if (errors.newPassword) setErrors({...errors, newPassword: null});
            }}
            secureTextEntry={hidePassword}
            autoCapitalize="none"
          />
          <RightIcon onPress={() => setHidePassword(!hidePassword)}>
            <Ionicons name={hidePassword ? 'eye-off' : 'eye'} size={25} color={grey}/>
          </RightIcon>
        </View>
        {errors.newPassword && (
          <Label style={{ color: "#FF6B6B", fontSize: 12, marginTop: 5 }}>
            {errors.newPassword}
          </Label>
        )}
      </View>
      
      <Label style={{ marginBottom: 5, color: white }}>Confirmer le mot de passe</Label>
      <View style={{ marginBottom: 30 }}>
        <View>
          <StyledTextInput
            placeholder="Retapez votre mot de passe"
            placeholderTextColor={grey}
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (errors.confirmPassword) setErrors({...errors, confirmPassword: null});
            }}
            secureTextEntry={hideConfirmPassword}
            autoCapitalize="none"
          />
          <RightIcon onPress={() => setHideConfirmPassword(!hideConfirmPassword)}>
            <Ionicons name={hideConfirmPassword ? 'eye-off' : 'eye'} size={25} color={grey}/>
          </RightIcon>
        </View>
        {errors.confirmPassword && (
          <Label style={{ color: "#FF6B6B", fontSize: 12, marginTop: 5 }}>
            {errors.confirmPassword}
          </Label>
        )}
      </View>
      
      <Shadow>
        <StyledButton onPress={handleResetPassword} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator size="small" color={white} />
          ) : (
            <ButtonText>RÉINITIALISER LE MOT DE PASSE</ButtonText>
          )}
        </StyledButton>
      </Shadow>
      
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
        <TextLink onPress={() => {
          setStep(1);
          setErrors({});
        }}>
          <TextLinkContent style={{ color: blue }}>
            ← Changer d'email
          </TextLinkContent>
        </TextLink>
        
        <TextLink onPress={() => navigation.navigate("Login")}>
          <TextLinkContent style={{ color: blue }}>
            Retour à la connexion
          </TextLinkContent>
        </TextLink>
      </View>
    </StyledFormArea>
  );

  return (
    <KeyboardAvoidingWrapper>
      <BackgroundContainer
        source={require("../../assets/img/fond2.png")}
        resizeMode="cover"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <InnerContainer style={{ marginTop: 60 }}>
            <PageLogo
              resizeMode="contain"
              source={require("../../assets/img/logo3Dfinalfinal.png")}
              style={{ marginBottom: 20 }}
            />
            
            <Label style={{ 
              fontSize: 30, 
              textAlign: 'center', 
              fontWeight: 'bold', 
              color: white, 
              marginBottom: 10,
              padding: 10 
            }}>
              {step === 1 ? "Mot de passe oublié" : "Nouveau mot de passe"}
            </Label>
            
            <View style={{ 
              height: 1, 
              width: '100%', 
              backgroundColor: grey + '50', 
              marginVertical: 20 
            }} />
            
            {step === 1 ? renderStep1() : renderStep2()}
          </InnerContainer>
        </ScrollView>
      </BackgroundContainer>
    </KeyboardAvoidingWrapper>
  );
};

export default ForgotPassword;