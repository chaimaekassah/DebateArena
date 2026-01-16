import styled from 'styled-components/native';
import { View, Text, Image, ImageBackground, TextInput, TouchableOpacity } from 'react-native';
import Constants from 'expo-constants';
import { Platform } from "react-native";
import { Dimensions } from "react-native";

const StatusBarHeight = Constants.statusBarHeight;
const { height } = Dimensions.get("window");

// Colors
export const Colors = {
  dark: "#301A4B",
  yellow: "#FFC482",
  blue: "#6DB1BF",
  lightPink: "#C8ADC0",
  pink: "#DB7F8E",
  white: "#FFFFFF",
  grey: "#999999"
};

const { dark, yellow, blue, lightPink, pink, white } = Colors;

export const InnerContainer = styled.View`
  flex: 1;
  width: 100%;
  align-items: center;
`;

export const PageLogo = styled.Image`
  width: 300px;
  height: 140px;
`;
 
export const TextLink = styled.TouchableOpacity`
 justify-content: center;
 align-items: center;
`;

export const TextLinkContent = styled.Text`
 font-size: 12px;
 color: ${white};
`;

export const Label = styled.Text`
 font-size: 12px;
 color: ${white};
 text-align: center;
`;


export const BackgroundContainer = styled(ImageBackground)`
  flex: 1;
  padding: 25px;
  padding-top: ${StatusBarHeight + 10}px;
`;

export const StyledFormArea = styled.View`
  width: 90%;
  padding-top: 55px;
`;

export const StyledTextInput = styled.TextInput`
  background-color: ${white};
  text-align: center;
  padding-left: 55px;
  padding-right: 55px;
  border-radius: 38px;
  font-size: 16px;
  height: 60px;
  margin-vertical: 3px;
  margin-bottom: 10px;
`;

export const Shadow = styled.View`
  border-radius: 38px;
  margin-bottom: 10px;

  ${Platform.OS === "ios" &&
  `
    shadow-color: #000;
    shadow-opacity: 0.75;
    shadow-radius: 4.65px;
    shadow-offset: 0px 5px;
  `}
  ${Platform.OS === "android" &&
  `
    elevation: 8;
  `}
`;

export const LeftIcon = styled.View`
   left: 15px;
   top: 38px;
   position: absolute;
   z-index: 1;
`;

export const RightIcon = styled.TouchableOpacity`
   right: 10px;
   top: 10px;
   position: absolute;
   z-index: 1;
`;

export const StyledButton = styled.TouchableOpacity`
  background-color: ${yellow};
  justify-content: center;
  padding-left: 55px;
  padding-right: 55px;
  border-radius: 38px;
  height: 60px;
  align-items: center;
  margin-vertical: 3px;
  margin-bottom: 10px;
`;

export const WhiteButton = styled.TouchableOpacity`
  background-color: ${white};
  width: 250px;
  justify-content: center;
  padding-left: 55px;
  padding-right: 55px;
  border-radius: 38px;
  height: 60px;
  align-items: center;
  margin-vertical: 3px;
  margin-bottom: 10px;
  ${Platform.OS === "ios" &&
  `
    shadow-color: #000;
    shadow-opacity: 0.75;
    shadow-radius: 4.65px;
    shadow-offset: 0px 5px;
  `}
  ${Platform.OS === "android" &&
  `
    elevation: 8;
  `}
`;

export const ButtonText = styled.Text`
 color: ${dark};
 font-size: 20px;
 font-weight: bold;
`;

//Debate
export const Choice= styled.TouchableOpacity`
  justify-content: center;
  border-radius: 38px;
  height: 166px;
  width: 274px;
  align-items: center;
  margin-vertical: 3px;
  margin-bottom: 10px;
  backgroundColor: ${lightPink};
  opacity: 0.5;
  elevation: 15;
  ${Platform.OS === "ios" &&
  `
    shadow-color: #000;
    shadow-opacity: 0.75;
    shadow-radius: 4.65px;
    shadow-offset: 0px 5px;
  `}
  ${Platform.OS === "android" &&
  `
    elevation: 8;
  `}
`;

export const SubjectContainer = styled.View`
  justify-content: center;
  border-radius: 38px;
  height: 250px;
  width: 300px;
  align-items: center;
  margin-vertical: 3px;
  margin-bottom: 10px;
  backgroundColor: ${white};
  opacity: 0.5;
  elevation: 15;
`

export const Quote = styled.Image`
  width: 80px;
  height: 80px;
  position: absolute;
  zIndex: 10; 
`

export const TextBubble = styled.Text`
 color: ${dark};
 font-size: 14px;
 font-weight: bold;
 background-color: ${white};
 maxWidth: 290px;
 border-radius: 38px;
 text-align: center;
 min-height: 50px; 
 justifyContent: center;
 paddingHorizontal: 20px;
 paddingVertical: 14px;
  ${Platform.OS === "ios" &&
  `
    shadow-color: #000;
    shadow-opacity: 0.75;
    shadow-radius: 4.65px;
    shadow-offset: 0px 5px;
  `}
  ${Platform.OS === "android" &&
  `
    elevation: 8;
  `}
`
export const WhiteContainer = styled.View`
  position: absolute;
  bottom: 0;
  height: ${height * 0.6}px;
  width: 100%;
  justify-content: center;
  align-items: center;
  border-top-left-radius: 38px;
  border-top-right-radius: 38px;
  background-color: ${white};
  elevation: 15;
`

export const ProfileImage = styled.Image`
  width: 300px;
  height: 140px;
  radius: 60px;
`;





 


