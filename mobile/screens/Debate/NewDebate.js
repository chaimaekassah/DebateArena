import { View } from "react-native";
import React, {useState} from "react";

import {
    BackgroundContainer,
    InnerContainer,
    PageLogo,
    Choice,
    Label,
    Colors
} from "../../components/styles"

const {blue, dark} = Colors;

const NewDebate = () => {
  return (
    <BackgroundContainer
      source={require("../../assets/img/fond.png")}
      resizeMode="cover"
    >
      <InnerContainer style={{marginTop:70}}>
      
        <PageLogo
          resizeMode="contain"
          source={require("../../assets/img/logoCoupe.png")}
        />
        <Label style={{fontSize: 32, marginBottom: 30, color: dark}}>Commencer un débat ?</Label>
        <Choice style={{backgroundColor: blue}}>
            <Label style={{fontSize: 16}}>Entraînement</Label>
        </Choice>
        <Choice>
            <Label style={{fontSize: 16}}>Test</Label>
        </Choice>
      
      </InnerContainer>
    </BackgroundContainer>
  );
};

export default NewDebate;
