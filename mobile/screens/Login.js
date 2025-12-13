import React, {useState} from "react";
import { Formik } from "formik";
import { View } from "react-native";

import { Ionicons } from "@expo/vector-icons";

import {
  InnerContainer, PageLogo, BackgroundContainer,
  StyledFormArea, StyledButton, ButtonText,
  StyledTextInput, Colors, RightIcon,
  TextLink,
  TextLinkContent,
  Shadow,
} from "../components/styles";

const { grey } = Colors;

const Login = ({navigation}) => {
    const [hidePassword, setHidePassword] = useState(true);
  return (
    <BackgroundContainer
      source={require("./../assets/img/fond2.png")}
      resizeMode="cover"
    >
      <InnerContainer style={{marginTop:70}}>
      
        <PageLogo
          resizeMode="contain"
          source={require("./../assets/img/logo3Dfinalfinal.png")}
        />
      
        <Formik
          initialValues={{ email: '', password: '' }}
          onSubmit={(values) => {
            console.log(values);
            navigation.navigate("Dashboard");
          }}
        >
          {({ handleChange, handleBlur, handleSubmit, values }) => (
            <StyledFormArea>
              <MyTextInput
                placeholder="votreemail@exemple.com"
                placeholderTextColor={grey}
                onChangeText={handleChange("email")}
                onBlur={handleBlur("email")}
                value={values.email}
                keyboardType="email-address"
              />
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
              <TextLink>
                <TextLinkContent style={{marginBottom: 60}}>Mot de passe oublié?</TextLinkContent>
              </TextLink>
              <Shadow>
              <StyledButton onPress={handleSubmit}>
                <ButtonText>CONNEXION</ButtonText>
              </StyledButton>
              </Shadow>
              <TextLink onPress={() => navigation.navigate("SignUp")}> 
                <TextLinkContent>Je m'inscris</TextLinkContent>
              </TextLink>
            </StyledFormArea>
          )}
        </Formik>
      </InnerContainer>
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

export default Login;
