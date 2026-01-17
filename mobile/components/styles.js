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
  grey: "#999999",
  brand: "#1E90FF",
  green: "#4CAF50",
  darkLight: "#2E2E2E"
};

const { dark, yellow, blue, lightPink, pink, white, grey, brand, green, darkLight } = Colors;

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

// profil
export const ProfileImage = styled.Image`
  width: 120px;
  height: 120px;
  border-radius: 60px;
  border-width: 3px;
  border-color: ${yellow};
`;

export const CameraButton = styled.TouchableOpacity`
  position: absolute;
  bottom: 0;
  right: 0;
  background-color: ${brand};
  border-radius: 20px;
  padding: 8px;
`;

export const InfoBox = styled.View`
  background-color: #F8F9FA;
  padding: 15px;
  border-radius: 10px;
  border-width: 1px;
  border-color: #E0E0E0;
  margin-bottom: 20px;
`;

export const StatCircle = styled.View`
  width: 70px;
  height: 70px;
  border-radius: 35px;
  background-color: ${brand};
  justify-content: center;
  align-items: center;
  margin-bottom: 10px;
`;

export const StatCircleYellow = styled(StatCircle)`
  background-color: ${yellow};
`;

export const StatLabel = styled.Text`
  font-size: 14px;
  color: ${dark};
  font-weight: 600;
`;

export const ProgressBar = styled.View`
  height: 8px;
  background-color: #E0E0E0;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 5px;
`;

export const ProgressFill = styled.View`
  height: 100%;
  background-color: ${brand};
  border-radius: 4px;
`;

export const BadgeContainer = styled.View`
  background-color: #F0F7FF;
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 30px;
  width: 100%;
`;

export const BadgeIcon = styled.View`
  width: 70px;
  height: 70px;
  border-radius: 35px;
  background-color: ${yellow};
  justify-content: center;
  align-items: center;
  margin-bottom: 10px;
  border-width: 3px;
  border-color: ${white};
`;

export const BadgeName = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: ${dark};
  text-align: center;
  margin-bottom: 5px;
`;

export const BadgeCategory = styled.Text`
  font-size: 14px;
  color: ${yellow};
  font-weight: 600;
  margin-bottom: 10px;
  text-align: center;
`;

export const BadgeDescription = styled.Text`
  font-size: 12px;
  color: #666;
  text-align: center;
  font-style: italic;
`;

export const EditButton = styled.TouchableOpacity`
  padding: 5px;
`;

export const SecondaryButton = styled.TouchableOpacity`
  align-self: center;
  background-color: ${white};
  border-width: 1px;
  border-color: ${brand};
  padding-vertical: 12px;
  padding-horizontal: 25px;
  border-radius: 25px;
  align-items: center;
`;

export const SecondaryButtonText = styled.Text`
  color: ${brand};
  font-weight: 600;
`;

export const ModalOverlay = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
`;

export const ModalContent = styled.View`
  background-color: ${white};
  border-radius: 15px;
  padding: 25px;
  width: 85%;
  align-items: center;
`;

export const ModalTitle = styled.Text`
  font-size: 20px;
  margin-bottom: 20px;
  color: ${dark};
  font-weight: 600;
`;

export const ModalInput = styled.TextInput`
  width: 100%;
  height: 50px;
  border-width: 1px;
  border-color: #ddd;
  border-radius: 10px;
  padding-horizontal: 15px;
  font-size: 16px;
  margin-bottom: 25px;
  background-color: #F8F9FA;
`;

export const ModalButtons = styled.View`
  flex-direction: row;
  width: 100%;
  gap: 15px;
`;

export const ModalButton = styled.TouchableOpacity`
  flex: 1;
  padding: 15px;
  border-radius: 10px;
  align-items: center;
`;

export const ModalButtonCancel = styled(ModalButton)`
  background-color: #f0f0f0;
`;

export const ModalButtonConfirm = styled(ModalButton)`
  background-color: ${brand};
`;

export const ModalButtonText = styled.Text`
  font-weight: 600;
`;

export const ModalButtonCancelText = styled(ModalButtonText)`
  color: #666;
`;

export const ModalButtonConfirmText = styled(ModalButtonText)`
  color: ${white};
`;

export const SectionTitle = styled.Text`
  font-size: 20px;
  margin-bottom: 20px;
  color: ${dark};
  font-weight: 600;
  text-align: center;
`;

export const FieldLabel = styled.Text`
  font-size: 14px;
  color: ${grey};
  margin-bottom: 5px;
`;

export const FieldContainer = styled.View`
  margin-bottom: 20px;
`;

export const FieldHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;


