import React, { useState } from "react";
import { ScrollView, TextInput, View, Image } from "react-native";
import LoadingDots from "../../components/LoadingDots";
import KeyboardAvoidingWrapper from "../../components/KeyboardAvoidingWrapper";

import {
  BackgroundContainer,
  InnerContainer,
  WhiteButton, ButtonText,
  TextBubble, Quote,
  Colors, Shadow,
  Label, SubjectContainer
} from "../../components/styles";

const { blue, dark, white } = Colors;

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      text: input
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // Réponse IA simulée
    setTimeout(() => {
      const aiMessage = {
        id: Date.now().toString() + "-ai",
        role: "ai",
        text: "🤖 Réponse simulée de l’IA."
      };

      setMessages((prev) => [...prev, aiMessage]);
      setLoading(false);
    }, 1200);
  };

  return (
    <KeyboardAvoidingWrapper>
    <BackgroundContainer
      source={require("../../assets/img/fond.png")}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}>
        <InnerContainer style={{ marginTop: 60 }}>

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
          <View>
            <Label style={{marginTop: 50}}>Vous avez ... minutes pour exprimer votre opinion</Label>
            <Label style={{marginBottom: 50}}>Commencez</Label>
          </View>

        {/* Messages */}
            {messages.map((msg) => (
            <View
                key={msg.id}
                style={{
                flexDirection: 'row',
                alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                marginBottom: 10,
                alignItems: 'flex-end',
                }}
            >
                {/* Avatar IA à gauche */}
                {msg.role === "ai" && (
                <Image
                    source={require("../../assets/img/logoCoupe.png")}
                    style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    marginRight: 8
                    }}
                />
                )}


                <TextBubble
                style={{
                    backgroundColor: msg.role === "user" ?  "#CFE7EB" : white,
                }}
                >
                {msg.text}
                </TextBubble>

                {/* Avatar utilisateur à droite */}
                {msg.role === "user" && (
                <Image
                    source={require("../../assets/icons/homme.png")} // image par défaut pour l'instant
                    style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    marginLeft: 8
                    }}
                />
                )}
            </View>
            ))}

          {loading && (
                <TextBubble
                    style={{
                    alignSelf: "flex-start", // toujours côté IA
                    width: 100       // centre horizontalement
                    }}
                >
                    <LoadingDots />
                </TextBubble>
                )}
        </InnerContainer>
      </ScrollView>
       <View style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          flexDirection: "row",
          alignItems: "center",
          padding: 10,
          borderTopWidth: 1,
          borderColor: "#d1d5db",
          backgroundColor: "#fff",
        }}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Écrire un message..."
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: "#d1d5db",
              borderRadius: 20,
              padding: 14,
              marginRight: 10,
              backgroundColor: "#fff"
            }}
          />
          <WhiteButton onPress={sendMessage}>
            <ButtonText>Envoyer</ButtonText>
          </WhiteButton>
        </View>

    </BackgroundContainer>
    </KeyboardAvoidingWrapper>
  );
};

export default Chat;
