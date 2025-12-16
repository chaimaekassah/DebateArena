import { View } from "react-native";
import React, {useState} from "react";

import {
    BackgroundContainer,
    InnerContainer, ButtonText,
    Colors, 
    Label, 
    StyledButton,
    Shadow
} from "../../components/styles"

const {blue, dark} = Colors;

const StartDebate = () => {
  return (
    <BackgroundContainer
      source={require("../../assets/img/fond.png")}
      resizeMode="cover"
    >
      <InnerContainer style={{marginTop:70}}>
        <Label style={{fontSize: 20, marginBottom: 50}}>Vous avez choisi : ... </Label>
    <Shadow>
    <StyledButton>
        <ButtonText>COMMENCER</ButtonText>
    </StyledButton>
    </Shadow>
      </InnerContainer>
    </BackgroundContainer>
  );
};

export default StartDebate;
