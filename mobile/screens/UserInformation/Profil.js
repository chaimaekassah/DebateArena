import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TextInput
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import api from '../../services/api';

// Importez vos styles existants
import {
  BackgroundContainer,
  InnerContainer,
  StyledButton,
  ButtonText,
  WhiteButton,
  Label,
  Colors,
  Shadow,
  ProfileImage,
  CameraButton,
  InfoBox,
  StatCircle,
  StatCircleYellow,
  StatLabel,
  ProgressBar,
  ProgressFill,
  EditButton,
  SecondaryButton,
  SecondaryButtonText,
  SectionTitle,
  FieldLabel,
  FieldContainer,
  FieldHeader
} from '../../components/styles';

const { dark, yellow, blue, lightPink, pink, white, grey, brand, green, darkLight } = Colors;

const Profil = ({ navigation }) => {
  const [user, setUser] = useState({
    id: null,
    nom: '',
    prenom: '',
    email: '',
    role: '',
    imagePath: null
  });

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // États pour les modales
  const [editNomModal, setEditNomModal] = useState(false);
  const [editPrenomModal, setEditPrenomModal] = useState(false);
  
  // États pour les valeurs d'édition
  const [newNom, setNewNom] = useState('');
  const [newPrenom, setNewPrenom] = useState('');
  
  // États pour les données supplémentaires
  const [stats, setStats] = useState({
    totalDebats: 0,
    debatsGagnes: 0,
    tauxReussite: 0,
    niveau: "DÉBUTANT",
    score: 0
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Récupérer les données du profil depuis l'API
      const response = await api.get('/me');
      
      if (response.data) {
        setUser({
          id: response.data.id || null,
          nom: response.data.nom || '',
          prenom: response.data.prenom || '',
          email: response.data.email || '',
          role: response.data.role || 'UTILISATEUR',
          imagePath: response.data.imagePath || null
        });
        
        // Sauvegarder dans AsyncStorage
        await AsyncStorage.setItem('nom', response.data.nom || '');
        await AsyncStorage.setItem('prenom', response.data.prenom || '');
        await AsyncStorage.setItem('email', response.data.email || '');
        await AsyncStorage.setItem('userId', response.data.id?.toString() || '');
        
        // Charger les statistiques
        try {
          const dashboardResponse = await api.get('/dashboard');
          if (dashboardResponse.data) {
            setStats({
              totalDebats: dashboardResponse.data.totalDebats || 0,
              debatsGagnes: dashboardResponse.data.debatsGagnes || 0,
              tauxReussite: dashboardResponse.data.tauxReussite || 0,
              niveau: dashboardResponse.data.niveau || "DÉBUTANT",
              score: dashboardResponse.data.score || 0
            });
          }
        } catch (dashboardError) {
          console.log("Erreur lors du chargement des stats:", dashboardError);
        }
      }
    } catch (error) {
      console.log("Erreur lors du chargement du profil:", error);
      
      // Charger depuis AsyncStorage en cas d'erreur
      const nom = await AsyncStorage.getItem('nom') || 'Utilisateur';
      const prenom = await AsyncStorage.getItem('prenom') || '';
      const email = await AsyncStorage.getItem('email') || '';
      const userId = await AsyncStorage.getItem('userId') || '';
      
      setUser({
        id: userId,
        nom,
        prenom,
        email,
        role: 'UTILISATEUR',
        imagePath: null
      });
      
      // Charger les stats depuis AsyncStorage
      const score = parseInt(await AsyncStorage.getItem('score')) || 0;
      const totalDebats = parseInt(await AsyncStorage.getItem('totalDebats')) || 0;
      const debatsGagnes = parseInt(await AsyncStorage.getItem('debatsGagnes')) || 0;
      const tauxReussite = totalDebats > 0 ? Math.round((debatsGagnes / totalDebats) * 100) : 0;
      
      setStats({
        totalDebats,
        debatsGagnes,
        tauxReussite,
        niveau: "DÉBUTANT",
        score
      });
      
      Alert.alert(
        'Erreur',
        'Impossible de charger les données du profil. Affichage des données locales.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async () => {
    try {
      setUpdating(true);
      
      const updateData = {
        nom: newNom || user.nom,
        prenom: newPrenom || user.prenom,
        image: user.imagePath
      };
      
      const response = await api.put('/me', updateData);
      
      if (response.data) {
        setUser(response.data);
        await AsyncStorage.setItem('nom', response.data.nom);
        await AsyncStorage.setItem('prenom', response.data.prenom);
        
        Alert.alert('Succès', 'Profil mis à jour avec succès !');
      }
    } catch (error) {
      console.log("Erreur lors de la mise à jour:", error);
      Alert.alert('Erreur', 'Impossible de mettre à jour le profil. Veuillez réessayer.');
    } finally {
      setUpdating(false);
      setEditNomModal(false);
      setEditPrenomModal(false);
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission requise', 'Nous avons besoin de votre permission pour accéder à vos photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.log("Erreur lors de la sélection d'image:", error);
      Alert.alert('Erreur', 'Impossible de sélectionner une image.');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission requise', 'Nous avons besoin de votre permission pour utiliser la caméra.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.log("Erreur lors de la prise de photo:", error);
      Alert.alert('Erreur', 'Impossible de prendre une photo.');
    }
  };

  const uploadImage = async (imageUri) => {
    try {
      setUploading(true);
      
      const formData = new FormData();
      const filename = imageUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      
      formData.append('image', {
        uri: imageUri,
        name: filename,
        type,
      });
      
      const response = await api.put('/me/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data) {
        setUser(response.data);
        Alert.alert('Succès', 'Photo de profil mise à jour !');
      }
    } catch (error) {
      console.log("Erreur lors de l'upload de l'image:", error);
      Alert.alert('Erreur', 'Impossible de mettre à jour la photo de profil.');
    } finally {
      setUploading(false);
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      'Changer la photo de profil',
      'Choisissez une option',
      [
        {
          text: 'Prendre une photo',
          onPress: takePhoto,
        },
        {
          text: 'Choisir depuis la galerie',
          onPress: pickImage,
        },
        {
          text: 'Annuler',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const handleLogout = async () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              navigation.replace('Login');
            } catch (error) {
              console.log("Erreur lors de la déconnexion:", error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  if (loading) {
    return (
      <BackgroundContainer source={require("../../assets/img/fond.png")} resizeMode="cover">
        <InnerContainer style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
          <ActivityIndicator size="large" color={white} />
          <Label style={{ marginTop: 20, fontSize: 16 }}>Chargement du profil...</Label>
        </InnerContainer>
      </BackgroundContainer>
    );
  }

  return (
    <BackgroundContainer 
      source={require("../../assets/img/fond.png")} 
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <InnerContainer style={{ paddingBottom: 30 }}>
            
            {/* Header avec bouton retour */}
            <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 5 }}>
                <Ionicons name="arrow-back" size={24} color={white} />
              </TouchableOpacity>
              
              <Label style={{ fontSize: 24, fontWeight: 'bold' }}>
                Mon Profil
              </Label>
              
              <View style={{ width: 24 }} />
            </View>

            {/* Section Photo de profil - SANS CADRE BLANC */}
            <View style={{ 
              alignItems: 'center',
              marginBottom: 30,
              width: '100%'
            }}>
              <View style={{ position: 'relative', marginBottom: 20 }}>
                {user.imagePath ? (
                  <Image
                    source={{ uri: user.imagePath }}
                    style={{ 
                      width: 140, 
                      height: 140, 
                      borderRadius: 70,
                      borderWidth: 4,
                      borderColor: yellow
                    }}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={{ 
                    width: 140, 
                    height: 140, 
                    borderRadius: 70, 
                    backgroundColor: lightPink,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderWidth: 4,
                    borderColor: yellow
                  }}>
                    <Text style={{ fontSize: 48, color: dark, fontWeight: 'bold' }}>
                      {user.prenom?.charAt(0) || ''}{user.nom?.charAt(0) || ''}
                    </Text>
                  </View>
                )}
                
                <TouchableOpacity 
                  onPress={showImagePickerOptions}
                  disabled={uploading}
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    backgroundColor: brand,
                    borderRadius: 20,
                    padding: 10,
                    borderWidth: 3,
                    borderColor: white
                  }}
                >
                  {uploading ? (
                    <ActivityIndicator size="small" color={white} />
                  ) : (
                    <Ionicons name="camera" size={22} color={white} />
                  )}
                </TouchableOpacity>
              </View>
              
              <Text style={{ 
                fontSize: 28, 
                fontWeight: 'bold', 
                color: white, 
                marginBottom: 5,
                textAlign: 'center'
              }}>
                {user.prenom} {user.nom}
              </Text>
              
              <Text style={{ 
                fontSize: 16, 
                color: lightPink, 
                marginBottom: 10,
                textAlign: 'center'
              }}>
                {user.email}
              </Text>
            </View>

            {/* Section Informations personnelles - EN PREMIER */}
            <Shadow style={{ 
              backgroundColor: white,
              borderRadius: 38,
              padding: 25,
              marginBottom: 20,
              width: '100%'
            }}>
              <SectionTitle>Informations Personnelles</SectionTitle>
              
              <FieldContainer>
                <FieldHeader>
                  <FieldLabel>Nom</FieldLabel>
                  <TouchableOpacity onPress={() => {
                    setNewNom(user.nom);
                    setEditNomModal(true);
                  }}>
                    <Ionicons name="create-outline" size={20} color={brand} />
                  </TouchableOpacity>
                </FieldHeader>
                <View style={{ 
                  backgroundColor: '#F8F9FA',
                  padding: 15,
                  borderRadius: 15,
                  borderWidth: 1,
                  borderColor: '#E0E0E0',
                  marginBottom: 20
                }}>
                  <StatLabel style={{ fontSize: 16 }}>{user.nom || 'Non défini'}</StatLabel>
                </View>
              </FieldContainer>
              
              <FieldContainer>
                <FieldHeader>
                  <FieldLabel>Prénom</FieldLabel>
                  <TouchableOpacity onPress={() => {
                    setNewPrenom(user.prenom);
                    setEditPrenomModal(true);
                  }}>
                    <Ionicons name="create-outline" size={20} color={brand} />
                  </TouchableOpacity>
                </FieldHeader>
                <View style={{ 
                  backgroundColor: '#F8F9FA',
                  padding: 15,
                  borderRadius: 15,
                  borderWidth: 1,
                  borderColor: '#E0E0E0',
                  marginBottom: 20
                }}>
                  <StatLabel style={{ fontSize: 16 }}>{user.prenom || 'Non défini'}</StatLabel>
                </View>
              </FieldContainer>
              
              <FieldContainer>
                <FieldHeader>
                  <FieldLabel>Email</FieldLabel>
                </FieldHeader>
                <View style={{ 
                  backgroundColor: '#F8F9FA',
                  padding: 15,
                  borderRadius: 15,
                  borderWidth: 1,
                  borderColor: '#E0E0E0',
                  marginBottom: 10
                }}>
                  <StatLabel style={{ fontSize: 16 }}>{user.email || 'Non défini'}</StatLabel>
                </View>
              </FieldContainer>
            </Shadow>

            {/* Section Statistiques - EN SECOND */}
            <Shadow style={{ 
              backgroundColor: white,
              borderRadius: 38,
              padding: 25,
              marginBottom: 20,
              width: '100%'
            }}>
              <SectionTitle>Mes Statistiques</SectionTitle>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 25 }}>
                <View style={{ alignItems: 'center' }}>
                  <View style={{ 
                    width: 80, 
                    height: 80, 
                    borderRadius: 40, 
                    backgroundColor: brand,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: 12,
                    borderWidth: 3,
                    borderColor: white,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 4
                  }}>
                    <Text style={{ fontSize: 24, fontWeight: 'bold', color: white }}>
                      {stats.totalDebats}
                    </Text>
                  </View>
                  <StatLabel style={{ textAlign: 'center', fontSize: 14 }}>Débats</StatLabel>
                </View>
                
                <View style={{ alignItems: 'center' }}>
                  <View style={{ 
                    width: 80, 
                    height: 80, 
                    borderRadius: 40, 
                    backgroundColor: yellow,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: 12,
                    borderWidth: 3,
                    borderColor: white,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 4
                  }}>
                    <Text style={{ fontSize: 24, fontWeight: 'bold', color: dark }}>
                      {stats.debatsGagnes}
                    </Text>
                  </View>
                  <StatLabel style={{ textAlign: 'center', fontSize: 14 }}>Victoires</StatLabel>
                </View>
                
                <View style={{ alignItems: 'center' }}>
                  <View style={{ 
                    width: 80, 
                    height: 80, 
                    borderRadius: 40, 
                    backgroundColor: green,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: 12,
                    borderWidth: 3,
                    borderColor: white,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 4
                  }}>
                    <Text style={{ fontSize: 24, fontWeight: 'bold', color: white }}>
                      {stats.tauxReussite}%
                    </Text>
                  </View>
                  <StatLabel style={{ textAlign: 'center', fontSize: 14 }}>Réussite</StatLabel>
                </View>
              </View>
              
              <View style={{ marginBottom: 20 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <StatLabel style={{ fontSize: 16 }}>Niveau</StatLabel>
                  <StatLabel style={{ color: brand, fontWeight: 'bold', fontSize: 16 }}>{stats.niveau}</StatLabel>
                </View>
                <ProgressBar>
                  <ProgressFill style={{ width: `${stats.tauxReussite}%` }} />
                </ProgressBar>
              </View>
              
              <View style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                backgroundColor: '#F8F9FA',
                padding: 15,
                borderRadius: 15,
                borderWidth: 1,
                borderColor: '#E0E0E0'
              }}>
                <StatLabel style={{ fontSize: 16 }}>Score total</StatLabel>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="trophy" size={20} color={yellow} style={{ marginRight: 8 }} />
                  <StatLabel style={{ fontWeight: 'bold', color: dark, fontSize: 18 }}>{stats.score} points</StatLabel>
                </View>
              </View>
            </Shadow>

            {/* Actions */}
            <View style={{ width: '100%', alignItems: 'center', marginTop: 10 }}>
              <TouchableOpacity 
                onPress={() => navigation.navigate('Dashboard')}
                style={{
                  alignSelf: 'center',
                  backgroundColor: white,
                  borderWidth: 2,
                  borderColor: brand,
                  paddingVertical: 14,
                  paddingHorizontal: 30,
                  borderRadius: 30,
                  alignItems: 'center',
                  marginBottom: 15,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 4
                }}
              >
                <Text style={{ color: brand, fontWeight: 'bold', fontSize: 16 }}>
                  <Ionicons name="stats-chart" size={18} style={{ marginRight: 8 }} />
                  Retour au Tableau de Bord
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={handleLogout}
                style={{
                  backgroundColor: white,
                  width: 250,
                  justifyContent: 'center',
                  paddingHorizontal: 20,
                  borderRadius: 38,
                  height: 60,
                  alignItems: 'center',
                  marginBottom: 10,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 4
                }}
              >
                <Text style={{ color: pink, fontSize: 18, fontWeight: 'bold' }}>
                  <Ionicons name="log-out-outline" size={18} />
                  {' '}Déconnexion
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={loadUserData}
                style={{ marginTop: 10, padding: 10 }}
              >
                <Text style={{ color: yellow, fontSize: 14 }}>
                  <Ionicons name="refresh" size={14} style={{ marginRight: 5 }} /> 
                  Rafraîchir les données
                </Text>
              </TouchableOpacity>
            </View>

          </InnerContainer>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modale pour modifier le nom */}
      <Modal
        visible={editNomModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setEditNomModal(false)}
      >
        <View style={{ 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)' 
        }}>
          <View style={{ 
            backgroundColor: white,
            borderRadius: 20,
            padding: 25,
            width: '85%',
            alignItems: 'center'
          }}>
            <Text style={{ fontSize: 22, marginBottom: 20, color: dark, fontWeight: 'bold', textAlign: 'center' }}>
              Modifier le nom
            </Text>
            <TextInput
              placeholder="Entrez votre nom"
              value={newNom}
              onChangeText={setNewNom}
              autoCapitalize="words"
              style={{
                width: '100%',
                height: 55,
                borderWidth: 2,
                borderColor: '#E0E0E0',
                borderRadius: 12,
                paddingHorizontal: 15,
                fontSize: 16,
                marginBottom: 25,
                backgroundColor: '#F8F9FA'
              }}
            />
            <View style={{ flexDirection: 'row', width: '100%', gap: 15 }}>
              <TouchableOpacity
                onPress={() => setEditNomModal(false)}
                style={{
                  flex: 1,
                  padding: 16,
                  borderRadius: 12,
                  alignItems: 'center',
                  backgroundColor: '#f0f0f0',
                  borderWidth: 1,
                  borderColor: '#ddd'
                }}
              >
                <Text style={{ fontWeight: 'bold', color: '#666', fontSize: 16 }}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={updateUserProfile}
                disabled={updating}
                style={{
                  flex: 1,
                  padding: 16,
                  borderRadius: 12,
                  alignItems: 'center',
                  backgroundColor: brand,
                  borderWidth: 1,
                  borderColor: brand
                }}
              >
                {updating ? (
                  <ActivityIndicator size="small" color={white} />
                ) : (
                  <Text style={{ fontWeight: 'bold', color: white, fontSize: 16 }}>Enregistrer</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modale pour modifier le prénom */}
      <Modal
        visible={editPrenomModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setEditPrenomModal(false)}
      >
        <View style={{ 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)' 
        }}>
          <View style={{ 
            backgroundColor: white,
            borderRadius: 20,
            padding: 25,
            width: '85%',
            alignItems: 'center'
          }}>
            <Text style={{ fontSize: 22, marginBottom: 20, color: dark, fontWeight: 'bold', textAlign: 'center' }}>
              Modifier le prénom
            </Text>
            <TextInput
              placeholder="Entrez votre prénom"
              value={newPrenom}
              onChangeText={setNewPrenom}
              autoCapitalize="words"
              style={{
                width: '100%',
                height: 55,
                borderWidth: 2,
                borderColor: '#E0E0E0',
                borderRadius: 12,
                paddingHorizontal: 15,
                fontSize: 16,
                marginBottom: 25,
                backgroundColor: '#F8F9FA'
              }}
            />
            <View style={{ flexDirection: 'row', width: '100%', gap: 15 }}>
              <TouchableOpacity
                onPress={() => setEditPrenomModal(false)}
                style={{
                  flex: 1,
                  padding: 16,
                  borderRadius: 12,
                  alignItems: 'center',
                  backgroundColor: '#f0f0f0',
                  borderWidth: 1,
                  borderColor: '#ddd'
                }}
              >
                <Text style={{ fontWeight: 'bold', color: '#666', fontSize: 16 }}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={updateUserProfile}
                disabled={updating}
                style={{
                  flex: 1,
                  padding: 16,
                  borderRadius: 12,
                  alignItems: 'center',
                  backgroundColor: brand,
                  borderWidth: 1,
                  borderColor: brand
                }}
              >
                {updating ? (
                  <ActivityIndicator size="small" color={white} />
                ) : (
                  <Text style={{ fontWeight: 'bold', color: white, fontSize: 16 }}>Enregistrer</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </BackgroundContainer>
  );
};

export default Profil;