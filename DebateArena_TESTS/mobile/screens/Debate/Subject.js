import { View } from "react-native";
import React, {useState} from "react";

import {
    BackgroundContainer,
    InnerContainer, WhiteButton, ButtonText,
    Colors, Shadow,
    SubjectContainer,
    Label, Quote
} from "../../components/styles"

const {blue, dark} = Colors;

const Subject = () => {
  return (
    <BackgroundContainer
      source={require("../../assets/img/fond.png")}
      resizeMode="cover"
    >
      <InnerContainer style={{marginTop:70}}>
        <View style={{ flexDirection: 'row'}}>
        <Quote source={require("../../assets/img/quote.png")}
        style={{top: -30, left: -30, zIndex: 10, transform: [{ rotate: '180deg' }]}}/>
        <Shadow>
        <SubjectContainer>
             <Label style={{fontSize: 32, marginBottom: 30, color: dark}}>Sujet : ...</Label>
        </SubjectContainer>
        </Shadow>
        <Quote source={require("../../assets/img/quote.png")}
        style={{bottom: -10,right: -20}}/>
        </View>
        <Label style={{marginBottom: 30, marginTop: 30}}>Etes-vous : </Label>
        <WhiteButton>
            <ButtonText>Pour</ButtonText>
        </WhiteButton>
        <Label>ou </Label>
         <WhiteButton>
            <ButtonText>Contre</ButtonText>
        </WhiteButton>

      </InnerContainer>
    </BackgroundContainer>
  );
};

export default Subject;
