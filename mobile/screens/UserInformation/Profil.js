import { View, TouchableOpacity, Image } from "react-native";
import React, {useState} from "react";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import EditableRow from "../../components/userInformation/EditableRow";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";
import KeyboardAvoidingWrapper from "../../components/common/KeyboardAvoidingWrapper";

import {
    BackgroundContainer,
    InnerContainer,
    ProfileImage,
    Label,
    Colors,
    WhiteContainer
} from "../../components/styles"

const {blue, dark} = Colors;

const Profil = () => {
  const [image, setImage] = useState(null);
 //simulation backend
  const [nom, setNom] = useState("Jean Dupont");
  const [email, setEmail] = useState("jean.dupont@email.com");
  const [password, setPassword] = useState("password123");
  const [editField, setEditField] = useState(null); 


   const pickImage = async () => {
    // Demande permission
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      alert("Permission requise pour accéder à la galerie");
      return;
    }

    // Ouvre la galerie
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };


  return ( 
    <BackgroundContainer
      source={require("../../assets/img/fond.png")}
      resizeMode="cover"
    >
      <KeyboardAvoidingWrapper>
      <InnerContainer style={{marginTop:70}}>

        <View style={{ position: "relative" }}>
        <ProfileImage
          source={
            image
              ? { uri: image }
              : require("../../assets/icons/homme.png")
          }
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
          }}
        />
        <TouchableOpacity
          onPress={pickImage}
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            backgroundColor: "#4A90E2",
            borderRadius: 20,
            padding: 6,
          }}
        >
          <Ionicons name="camera" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
        
       
        <Label style={{fontSize: 32, marginBottom: 30, color: dark, paddingBottom: 50}}>CExemple d'utilisateur</Label>


            <EditableRow
                icon="person-outline"
                label="Nom"
                value={nom}
                onChange={setNom}
                isEditing={editField === "nom"}
                onPress={() => setEditField("nom")}
              />

              <EditableRow
                icon="mail-outline"
                label="Email"
                value={email}
                onChange={setEmail}
                isEditing={editField === "email"}
                onPress={() => setEditField("email")}
              />

              <EditableRow
                icon="lock-closed-outline"
                label="Mot de passe"
                value={password}
                onChange={setPassword}
                isEditing={editField === "password"}
                onPress={() => setEditField("password")}
                secure
              />
      
        </InnerContainer>
        
       
      
      </KeyboardAvoidingWrapper>
    </BackgroundContainer>
    
  );
};

export default Profil;
