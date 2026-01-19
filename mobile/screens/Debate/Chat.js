import React, { useState, useRef, useEffect } from 'react';
import {
  ScrollView,
  TextInput,
  View,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import LoadingDots from '../../components/debate/LoadingDots';
import { Ionicons } from '@expo/vector-icons';

import {
  BackgroundContainer,
  InnerContainer,
  WhiteButton,
  ButtonText,
  TextBubble,
  Quote,
  Colors,
  Shadow,
  Label,
  SubjectContainer,
  StyledTextInput,
  RightIcon,
} from '../../components/styles';

const { dark, white } = Colors;

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef();

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    setTimeout(() => {
      const aiMessage = {
        id: Date.now().toString() + '-ai',
        role: 'ai',
        text: '🤖 Réponse simulée de l’IA.',
      };

      setMessages((prev) => [...prev, aiMessage]);
      setLoading(false);
    }, 1200);
  };

  // Scroll automatique vers le bas quand un nouveau message arrive
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages, loading]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <BackgroundContainer
        source={require('../../assets/img/fond.png')}
        style={{ flex: 1 }}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        >
          <InnerContainer style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row' }}>
              <Quote
                source={require('../../assets/img/quote.png')}
                style={{
                  top: -30,
                  left: -30,
                  zIndex: 10,
                  transform: [{ rotate: '180deg' }],
                }}
              />
              <Shadow>
                <SubjectContainer>
                  <Label
                    style={{ fontSize: 32, marginBottom: 30, color: dark }}
                  >
                    Sujet : ...
                  </Label>
                </SubjectContainer>
              </Shadow>
              <Quote
                source={require('../../assets/img/quote.png')}
                style={{ bottom: -10, right: -20 }}
              />
            </View>
            <View>
              <Label style={{ marginTop: 50 }}>
                Vous avez ... minutes pour exprimer votre opinion
              </Label>
              <Label style={{ marginBottom: 50 }}>Commencez</Label>
            </View>

            {messages.map((msg) => (
              <View
                key={msg.id}
                style={{
                  flexDirection: 'row',
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  marginBottom: 10,
                  alignItems: 'flex-end',
                }}
              >
                {msg.role === 'ai' && (
                  <Image
                    source={require('../../assets/img/logoCoupe.png')}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      marginRight: 8,
                    }}
                  />
                )}

                <TextBubble
                  style={{
                    backgroundColor: msg.role === 'user' ? '#CFE7EB' : white,
                  }}
                >
                  {msg.text}
                </TextBubble>

                {msg.role === 'user' && (
                  <Image
                    source={require('../../assets/icons/homme.png')}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      marginLeft: 8,
                    }}
                  />
                )}
              </View>
            ))}

            {loading && (
              <TextBubble style={{ alignSelf: 'flex-start' }}>
                <LoadingDots />
              </TextBubble>
            )}
          </InnerContainer>
        </ScrollView>

        {/* Zone input fixe */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            borderTopWidth: 1,
            alignSelf: 'center',
          }}
        >
          <StyledTextInput
            value={input}
            onChangeText={setInput}
            placeholder="Tapez ici"
            style={{ flex: 1, backgroundColor: white, height: 40 }}
          />
          <RightIcon onPress={sendMessage} testID="send-button">
            <Ionicons name="send" size={28} />
          </RightIcon>
        </View>
      </BackgroundContainer>
    </KeyboardAvoidingView>
  );
};

export default Chat;
