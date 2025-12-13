import React, {useState} from "react";
import { Formik } from "formik";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView } from "react-native";

import {
  InnerContainer, PageLogo, BackgroundContainer,
  StyledFormArea, StyledButton, ButtonText,
  StyledTextInput, Colors, RightIcon,
  TextLink,
  TextLinkContent,
  Shadow, Label
} from "../components/styles";

const { grey } = Colors;

const SignUp = ({navigation}) => {
    const [hidePassword, setHidePassword] = useState(true);
    const [showAllFieldsError, setShowAllFieldsError] = useState(false);

  return (
   
    <BackgroundContainer
      source={require("./../assets/img/fond2.png")}
      resizeMode="cover"
    >
    <ScrollView>
      <InnerContainer style={{marginTop:70}}>

        <PageLogo
          resizeMode="contain"
          source={require("./../assets/img/logo3Dfinalfinal.png")}
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

            setShowAllFieldsError(false);
            console.log(values);
            navigation.navigate("Login");
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
              />
              <Label>Mot de passe</Label>
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
              <StyledButton onPress={handleSubmit}>
                <ButtonText>INSCRIPTION</ButtonText>
              </StyledButton>
              </Shadow>

              <TextLink onPress={() => navigation.navigate("Login")}>
                <TextLinkContent style={{marginBottom: 60}}
                                 onPress={() => navigation.navigate("Login")}
                >
                    Déjà inscrit-e ?
                </TextLinkContent>
              </TextLink>

            </StyledFormArea>
          )}
        </Formik>
      </InnerContainer>
      </ScrollView>
    </BackgroundContainer>
  );
};

const MyTextInput = ({icon, isPassword,hidePassword, setHidePassword, ...props }) => {
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
