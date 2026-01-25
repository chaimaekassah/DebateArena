import React, { useState, useEffect, useRef } from 'react';
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
  TextInput,
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
  FieldHeader,
} from '../../components/styles';

const {
  dark,
  yellow,
  blue,
  lightPink,
  pink,
  white,
  grey,
  brand,
  green,
  darkLight,
} = Colors;

const BASE_URL = 'http://192.168.11.169:8080';

const Profil = ({ navigation }) => {
  const [user, setUser] = useState({
    id: null,
    nom: '',
    prenom: '',
    email: '',
    role: '',
    imagePath: null,
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
    niveau: 'DÉBUTANT',
    score: 0,
  });
  const isMounted = useRef(true);

  // Fonction utilitaire pour construire l'URL complète de l'image
  const buildImageUrl = (imagePath) => {
    if (!imagePath) return null;

    // Si c'est déjà une URL complète
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    // Si c'est un chemin de fichier local
    if (imagePath.startsWith('file://')) {
      return imagePath;
    }

    // Si c'est un chemin relatif
    if (
      imagePath.startsWith('/uploads/') ||
      imagePath.startsWith('/images/') ||
      imagePath.startsWith('/profile/')
    ) {
      return `${BASE_URL}${imagePath}`;
    }

    // Si c'est juste un nom de fichier
    return `${BASE_URL}/uploads/${imagePath}`;
  };

  useEffect(() => {
    isMounted.current = true;

    loadUserData();

    return () => {
      isMounted.current = false;
    };
  }, []);

  const loadUserData = async () => {
    try {
      if (isMounted.current) {
        setLoading(true);
      }

      // Vérifiez d'abord le token
      const token = await AsyncStorage.getItem('userToken');

      if (!token) {
        Alert.alert(
          'Erreur',
          'Vous devez être connecté pour voir votre profil',
        );
        navigation.replace('Login');
        return;
      }

      // Récupérer les données du profil depuis l'API
      const response = await api.get('/me');

      if (response.data) {
        // Construire l'URL de l'image
        const imageUrl = buildImageUrl(
          response.data.imagePath ||
            response.data.imageUrl ||
            response.data.profileImage ||
            response.data.photoUrl ||
            response.data.image,
        );

        setUser({
          id: response.data.id || null,
          nom: response.data.nom || '',
          prenom: response.data.prenom || '',
          email: response.data.email || '',
          role: response.data.role || 'UTILISATEUR',
          imagePath: imageUrl,
        });

        // Sauvegarder dans AsyncStorage
        await AsyncStorage.multiSet([
          ['nom', response.data.nom || ''],
          ['prenom', response.data.prenom || ''],
          ['email', response.data.email || ''],
          ['userId', response.data.id?.toString() || ''],
          ['profileImage', imageUrl || ''],
        ]);

        // Charger les statistiques
        try {
          const dashboardResponse = await api.get('/dashboard');
          if (dashboardResponse.data) {
            setStats({
              totalDebats: dashboardResponse.data.totalDebats || 0,
              debatsGagnes: dashboardResponse.data.debatsGagnes || 0,
              tauxReussite: dashboardResponse.data.tauxReussite || 0,
              niveau: dashboardResponse.data.niveau || 'DÉBUTANT',
              score: dashboardResponse.data.score || 0,
            });
          }
        } catch (dashboardError) {
          // Silencieux en cas d'erreur de statistiques
        }
      }
    } catch (error) {
      // Charger depuis AsyncStorage en cas d'erreur
      const nom = (await AsyncStorage.getItem('nom')) || 'Utilisateur';
      const prenom = (await AsyncStorage.getItem('prenom')) || '';
      const email = (await AsyncStorage.getItem('email')) || '';
      const userId = (await AsyncStorage.getItem('userId')) || '';
      const profileImage = await AsyncStorage.getItem('profileImage');

      setUser({
        id: userId,
        nom,
        prenom,
        email,
        role: 'UTILISATEUR',
        imagePath: profileImage,
      });

      // Charger les stats depuis AsyncStorage
      const score = parseInt(await AsyncStorage.getItem('score')) || 0;
      const totalDebats =
        parseInt(await AsyncStorage.getItem('totalDebats')) || 0;
      const debatsGagnes =
        parseInt(await AsyncStorage.getItem('debatsGagnes')) || 0;
      const tauxReussite =
        totalDebats > 0 ? Math.round((debatsGagnes / totalDebats) * 100) : 0;

      setStats({
        totalDebats,
        debatsGagnes,
        tauxReussite,
        niveau: 'DÉBUTANT',
        score,
      });

      Alert.alert(
        'Erreur',
        'Impossible de charger les données du profil. Affichage des données locales.',
        [{ text: 'OK' }],
      );
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async () => {
    try {
      setUpdating(true);

      // CRÉEZ UN FormData COMME DANS SIGNUP
      const formData = new FormData();

      // Ajoutez les champs (comme dans signup.js)
      formData.append('nom', newNom.trim() || user.nom);
      formData.append('prenom', newPrenom.trim() || user.prenom);

      // UTILISEZ L'ENDPOINT CORRECT
      const response = await api.put('/me', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data) {
        // Construire l'URL de l'image si elle est retournée
        const imageUrl = response.data.imagePath
          ? buildImageUrl(response.data.imagePath)
          : user.imagePath;

        // Mettez à jour l'état
        setUser((prev) => ({
          ...prev,
          nom: response.data.nom,
          prenom: response.data.prenom,
          imagePath: imageUrl,
        }));

        // Sauvegardez dans AsyncStorage
        await AsyncStorage.multiSet([
          ['nom', response.data.nom],
          ['prenom', response.data.prenom],
        ]);

        Alert.alert('Succès', 'Profil mis à jour avec succès !');

        // Fermez les modales
        setEditNomModal(false);
        setEditPrenomModal(false);

        // Réinitialiser les valeurs
        setNewNom('');
        setNewPrenom('');
      }
    } catch (error) {
      // Essayez avec JSON si FormData échoue
      if (error.response?.status === 400 || error.response?.status === 415) {
        try {
          const jsonResponse = await api.put('/me', {
            nom: newNom.trim() || user.nom,
            prenom: newPrenom.trim() || user.prenom,
          });

          if (jsonResponse.data) {
            setUser((prev) => ({
              ...prev,
              nom: jsonResponse.data.nom,
              prenom: jsonResponse.data.prenom,
            }));

            await AsyncStorage.multiSet([
              ['nom', jsonResponse.data.nom],
              ['prenom', jsonResponse.data.prenom],
            ]);

            Alert.alert('Succès', 'Profil mis à jour avec succès !');
            setEditNomModal(false);
            setEditPrenomModal(false);
            setNewNom('');
            setNewPrenom('');
            return;
          }
        } catch (jsonError) {
          // Continuer avec l'erreur originale
        }
      }

      Alert.alert(
        'Erreur',
        error.response?.data?.message ||
          'Impossible de mettre à jour le profil.',
      );
    } finally {
      setUpdating(false);
    }
  };

  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission requise',
          'Nous avons besoin de votre permission pour accéder à vos photos.',
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sélectionner une image.');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission requise',
          'Nous avons besoin de votre permission pour utiliser la caméra.',
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de prendre une photo.');
    }
  };

  const uploadImage = async (imageUri) => {
    try {
      setUploading(true);

      const formData = new FormData();

      // Créez un nom de fichier unique
      const timestamp = Date.now();
      const filename = `profile_${timestamp}.jpg`;

      // Ajoutez le fichier au FormData
      formData.append('image', {
        uri: imageUri,
        name: filename,
        type: 'image/jpeg',
      });

      // Essayez différents endpoints
      let response;
      try {
        // Premier essai : endpoint standard
        response = await api.put('/me/image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } catch (firstError) {
        try {
          response = await api.post('/upload', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
        } catch (secondError) {
          response = await api.put('/profile/image', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
        }
      }

      if (response.data) {
        // Gérer différentes réponses du backend
        const imageData =
          response.data.imagePath ||
          response.data.imageUrl ||
          response.data.url ||
          response.data.profileImage ||
          response.data.image ||
          response.data.photoUrl;

        // Construire l'URL complète
        const imageUrl = buildImageUrl(imageData);

        // Mettez à jour l'état
        setUser((prev) => ({
          ...prev,
          imagePath: imageUrl,
        }));

        // Sauvegarder dans AsyncStorage
        await AsyncStorage.setItem('profileImage', imageUrl || '');

        Alert.alert('Succès', 'Photo de profil mise à jour !');
      }
    } catch (error) {
      Alert.alert(
        'Erreur',
        error.response?.data?.message ||
          'Impossible de mettre à jour la photo.',
      );
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
      { cancelable: true },
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
              // Erreur silencieuse lors de la déconnexion
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  if (loading) {
    return (
      <BackgroundContainer
        source={require('../../assets/img/fond.png')}
        resizeMode="cover"
      >
        <InnerContainer
          style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}
        >
          <ActivityIndicator size="large" color={white} />
          <Label style={{ marginTop: 20, fontSize: 16 }}>
            Chargement du profil...
          </Label>
        </InnerContainer>
      </BackgroundContainer>
    );
  }

  return (
    <BackgroundContainer
      source={require('../../assets/img/fond.png')}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <InnerContainer style={{ paddingBottom: 30 }}>
            {/* Header avec bouton retour */}
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20,
              }}
            >
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={{ padding: 5 }}
              >
                <Ionicons name="arrow-back" size={24} color={white} />
              </TouchableOpacity>

              <Label style={{ fontSize: 24, fontWeight: 'bold' }}>
                Mon Profil
              </Label>

              <View style={{ width: 24 }} />
            </View>

            {/* Section Photo de profil */}
            <View
              style={{
                alignItems: 'center',
                marginBottom: 30,
                width: '100%',
              }}
            >
              <View style={{ position: 'relative', marginBottom: 20 }}>
                {user.imagePath ? (
                  <Image
                    source={{ uri: user.imagePath }}
                    style={{
                      width: 140,
                      height: 140,
                      borderRadius: 70,
                      borderWidth: 4,
                      borderColor: yellow,
                      backgroundColor: '#f0f0f0',
                    }}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    style={{
                      width: 140,
                      height: 140,
                      borderRadius: 70,
                      backgroundColor: lightPink,
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderWidth: 4,
                      borderColor: yellow,
                    }}
                  >
                    <Text
                      style={{ fontSize: 48, color: dark, fontWeight: 'bold' }}
                    >
                      {user.prenom?.charAt(0) || ''}
                      {user.nom?.charAt(0) || ''}
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
                    borderColor: white,
                  }}
                >
                  {uploading ? (
                    <ActivityIndicator size="small" color={white} />
                  ) : (
                    <Ionicons name="camera" size={22} color={white} />
                  )}
                </TouchableOpacity>
              </View>

              <Text
                style={{
                  fontSize: 28,
                  fontWeight: 'bold',
                  color: white,
                  marginBottom: 5,
                  textAlign: 'center',
                }}
              >
                {user.prenom} {user.nom}
              </Text>

              <Text
                style={{
                  fontSize: 16,
                  color: lightPink,
                  marginBottom: 10,
                  textAlign: 'center',
                }}
              >
                {user.email}
              </Text>
            </View>

            {/* Section Informations personnelles */}
            <Shadow
              style={{
                backgroundColor: white,
                borderRadius: 38,
                padding: 25,
                marginBottom: 20,
                width: '100%',
              }}
            >
              <SectionTitle>Informations Personnelles</SectionTitle>

              <FieldContainer>
                <FieldHeader>
                  <FieldLabel>Nom</FieldLabel>
                  <TouchableOpacity
                    onPress={() => {
                      setNewNom(user.nom);
                      setEditNomModal(true);
                    }}
                  >
                    <Ionicons name="create-outline" size={20} color={brand} />
                  </TouchableOpacity>
                </FieldHeader>
                <View
                  style={{
                    backgroundColor: '#F8F9FA',
                    padding: 15,
                    borderRadius: 15,
                    borderWidth: 1,
                    borderColor: '#E0E0E0',
                    marginBottom: 20,
                  }}
                >
                  <StatLabel style={{ fontSize: 16 }}>
                    {user.nom || 'Non défini'}
                  </StatLabel>
                </View>
              </FieldContainer>

              <FieldContainer>
                <FieldHeader>
                  <FieldLabel>Prénom</FieldLabel>
                  <TouchableOpacity
                    onPress={() => {
                      setNewPrenom(user.prenom);
                      setEditPrenomModal(true);
                    }}
                  >
                    <Ionicons name="create-outline" size={20} color={brand} />
                  </TouchableOpacity>
                </FieldHeader>
                <View
                  style={{
                    backgroundColor: '#F8F9FA',
                    padding: 15,
                    borderRadius: 15,
                    borderWidth: 1,
                    borderColor: '#E0E0E0',
                    marginBottom: 20,
                  }}
                >
                  <StatLabel style={{ fontSize: 16 }}>
                    {user.prenom || 'Non défini'}
                  </StatLabel>
                </View>
              </FieldContainer>

              <FieldContainer>
                <FieldHeader>
                  <FieldLabel>Email</FieldLabel>
                </FieldHeader>
                <View
                  style={{
                    backgroundColor: '#F8F9FA',
                    padding: 15,
                    borderRadius: 15,
                    borderWidth: 1,
                    borderColor: '#E0E0E0',
                    marginBottom: 10,
                  }}
                >
                  <StatLabel style={{ fontSize: 16 }}>
                    {user.email || 'Non défini'}
                  </StatLabel>
                </View>
              </FieldContainer>
            </Shadow>

            {/* Section Statistiques */}
            <Shadow
              style={{
                backgroundColor: white,
                borderRadius: 38,
                padding: 25,
                marginBottom: 20,
                width: '100%',
              }}
            >
              <SectionTitle>Mes Statistiques</SectionTitle>

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-around',
                  marginBottom: 25,
                }}
              >
                <View style={{ alignItems: 'center' }}>
                  <View
                    style={{
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
                      elevation: 4,
                    }}
                  >
                    <Text
                      style={{ fontSize: 24, fontWeight: 'bold', color: white }}
                    >
                      {stats.totalDebats}
                    </Text>
                  </View>
                  <StatLabel style={{ textAlign: 'center', fontSize: 14 }}>
                    Débats
                  </StatLabel>
                </View>

                <View style={{ alignItems: 'center' }}>
                  <View
                    style={{
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
                      elevation: 4,
                    }}
                  >
                    <Text
                      style={{ fontSize: 24, fontWeight: 'bold', color: dark }}
                    >
                      {stats.debatsGagnes}
                    </Text>
                  </View>
                  <StatLabel style={{ textAlign: 'center', fontSize: 14 }}>
                    Victoires
                  </StatLabel>
                </View>

                <View style={{ alignItems: 'center' }}>
                  <View
                    style={{
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
                      elevation: 4,
                    }}
                  >
                    <Text
                      style={{ fontSize: 24, fontWeight: 'bold', color: white }}
                    >
                      {stats.tauxReussite}%
                    </Text>
                  </View>
                  <StatLabel style={{ textAlign: 'center', fontSize: 14 }}>
                    Réussite
                  </StatLabel>
                </View>
              </View>

              <View style={{ marginBottom: 20 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginBottom: 8,
                  }}
                >
                  <StatLabel style={{ fontSize: 16 }}>Niveau</StatLabel>
                  <StatLabel
                    style={{ color: brand, fontWeight: 'bold', fontSize: 16 }}
                  >
                    {stats.niveau}
                  </StatLabel>
                </View>
                <ProgressBar>
                  <ProgressFill style={{ width: `${stats.tauxReussite}%` }} />
                </ProgressBar>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: '#F8F9FA',
                  padding: 15,
                  borderRadius: 15,
                  borderWidth: 1,
                  borderColor: '#E0E0E0',
                }}
              >
                <StatLabel style={{ fontSize: 16 }}>Score total</StatLabel>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons
                    name="trophy"
                    size={20}
                    color={yellow}
                    style={{ marginRight: 8 }}
                  />
                  <StatLabel
                    style={{ fontWeight: 'bold', color: dark, fontSize: 18 }}
                  >
                    {stats.score} points
                  </StatLabel>
                </View>
              </View>
            </Shadow>

            {/* Actions */}
            <View
              style={{ width: '100%', alignItems: 'center', marginTop: 10 }}
            >
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
                  elevation: 4,
                }}
              >
                <Text style={{ color: pink, fontSize: 18, fontWeight: 'bold' }}>
                  <Ionicons name="log-out-outline" size={18} /> Déconnexion
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={loadUserData}
                style={{ marginTop: 10, padding: 10 }}
              >
                <Text style={{ color: yellow, fontSize: 14 }}>
                  <Ionicons
                    name="refresh"
                    size={14}
                    style={{ marginRight: 5 }}
                  />
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
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
        >
          <View
            style={{
              backgroundColor: white,
              borderRadius: 20,
              padding: 25,
              width: '85%',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 22,
                marginBottom: 20,
                color: dark,
                fontWeight: 'bold',
                textAlign: 'center',
              }}
            >
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
                backgroundColor: '#F8F9FA',
              }}
            />
            <View style={{ flexDirection: 'row', width: '100%', gap: 15 }}>
              <TouchableOpacity
                onPress={() => {
                  setNewNom('');
                  setEditNomModal(false);
                }}
                style={{
                  flex: 1,
                  padding: 16,
                  borderRadius: 12,
                  alignItems: 'center',
                  backgroundColor: '#f0f0f0',
                  borderWidth: 1,
                  borderColor: '#ddd',
                }}
              >
                <Text
                  style={{ fontWeight: 'bold', color: '#666', fontSize: 16 }}
                >
                  Annuler
                </Text>
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
                  borderColor: brand,
                }}
              >
                {updating ? (
                  <ActivityIndicator size="small" color={white} />
                ) : (
                  <Text
                    style={{ fontWeight: 'bold', color: white, fontSize: 16 }}
                  >
                    Enregistrer
                  </Text>
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
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
        >
          <View
            style={{
              backgroundColor: white,
              borderRadius: 20,
              padding: 25,
              width: '85%',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 22,
                marginBottom: 20,
                color: dark,
                fontWeight: 'bold',
                textAlign: 'center',
              }}
            >
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
                backgroundColor: '#F8F9FA',
              }}
            />
            <View style={{ flexDirection: 'row', width: '100%', gap: 15 }}>
              <TouchableOpacity
                onPress={() => {
                  setNewPrenom('');
                  setEditPrenomModal(false);
                }}
                style={{
                  flex: 1,
                  padding: 16,
                  borderRadius: 12,
                  alignItems: 'center',
                  backgroundColor: '#f0f0f0',
                  borderWidth: 1,
                  borderColor: '#ddd',
                }}
              >
                <Text
                  style={{ fontWeight: 'bold', color: '#666', fontSize: 16 }}
                >
                  Annuler
                </Text>
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
                  borderColor: brand,
                }}
              >
                {updating ? (
                  <ActivityIndicator size="small" color={white} />
                ) : (
                  <Text
                    style={{ fontWeight: 'bold', color: white, fontSize: 16 }}
                  >
                    Enregistrer
                  </Text>
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
