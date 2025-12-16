import React from "react";
import { ScrollView } from "react-native";

import {
  BackgroundContainer,
  InnerContainer,
  WhiteButton,
  ButtonText,
  Colors,
  Label
} from "../../components/styles";

const { dark } = Colors;

const Categories = () => {
  return (
    <BackgroundContainer
      source={require("../../assets/img/fond.png")}
      resizeMode="cover"
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <InnerContainer style={{ marginTop: 70 }}>
          <Label style={{ fontSize: 32, marginBottom: 30, color: dark }}>
            Choisissez une catégorie
          </Label>

          {[
            "Art",
            "Politique",
            "Culture",
            "Informatique",
            "Tendance",
            "Industrie",
            "Philosophie",
            "Santé",
            "Histoire",
            "Musique"
          ].map((cat) => (
            <WhiteButton key={cat}>
              <ButtonText>{cat}</ButtonText>
            </WhiteButton>
          ))}
        </InnerContainer>
      </ScrollView>
    </BackgroundContainer>
  );
};

export default Categories;
