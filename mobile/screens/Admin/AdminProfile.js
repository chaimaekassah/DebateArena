// screens/Admin/AdminProfile.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { verifyToken } from '../../services/api';
import { showErrorAlert } from '../../services/apiErrorHandler';
import { 
  InnerContainer,
  StyledButton,
  ButtonText,
  WhiteButton,
  InfoBox,
  Colors,
  SectionTitle as ExistingSectionTitle,
  ProfileImage as StyledProfileImage
} from '../../components/styles';

const { dark, yellow, blue, white, pink, green, grey } = Colors;

const AdminProfile = ({ navigation }) => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfileData = async () => {
    try {
      setError(null);
      console.log('🔄 Chargement du profil admin...');
      
      const isValid = await verifyToken();
      if (!isValid) {
        Alert.alert(
          "Session expirée",
          "Votre session a expiré. Veuillez vous reconnecter.",
          [{ text: "OK", onPress: () => navigation.replace('Login') }]
        );
        return;
      }
      
      const response = await api.get('/admin/profile');
      
      if (response.data) {
        console.log('✅ Profil admin chargé avec succès');
        setProfileData(response.data);
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement du profil:', error);
      setError(error);
      showErrorAlert(error, navigation);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfileData();
  };

  const handleLogout = async () => {
    Alert.alert(
      "Déconnexion",
      "Êtes-vous sûr de vouloir vous déconnecter?",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Déconnexion", 
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              navigation.replace('Login');
            } catch (error) {
              console.error('Erreur lors de la déconnexion:', error);
              Alert.alert('Erreur', 'Impossible de se déconnecter.');
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  // Afficher le loader
  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: white }}>
        <InnerContainer>
          <ActivityIndicator size="large" color={blue} />
          <Text style={{ color: dark, marginTop: 20, fontSize: 16 }}>
            Chargement du profil...
          </Text>
        </InnerContainer>
      </SafeAreaView>
    );
  }

  // Afficher l'erreur
  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: white }}>
        <InnerContainer style={{ padding: 20 }}>
          <Text style={{ color: pink, fontSize: 18, textAlign: 'center', marginBottom: 20 }}>
            Erreur lors du chargement du profil
          </Text>
          <WhiteButton onPress={fetchProfileData} style={{ backgroundColor: yellow }}>
            <ButtonText>Réessayer</ButtonText>
          </WhiteButton>
        </InnerContainer>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: white }}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={blue}
            colors={[blue]}
          />
        }
        style={{ padding: 20 }}
      >
        {/* Header avec photo de profil */}
        <View style={{ alignItems: 'center', marginBottom: 30 }}>
          <View style={{ position: 'relative', marginBottom: 15 }}>
            {profileData?.imagePath ? (
              <StyledProfileImage
                source={{ uri: profileData.imagePath }}
                style={{ borderColor: blue, borderWidth: 3 }}
              />
            ) : (
              <View style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: blue,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 3,
                borderColor: yellow,
              }}>
                <Text style={{ fontSize: 40, color: white, fontWeight: 'bold' }}>
                  {profileData?.prenom?.charAt(0) || 'A'}
                </Text>
              </View>
            )}
            <View style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              backgroundColor: yellow,
              borderRadius: 20,
              padding: 8,
              borderWidth: 3,
              borderColor: white,
            }}>
              <Ionicons name="shield" size={20} color={dark} />
            </View>
          </View>
          
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: dark, marginBottom: 5 }}>
            {profileData?.prenom} {profileData?.nom}
          </Text>
          <View style={{
            backgroundColor: blue,
            paddingHorizontal: 15,
            paddingVertical: 5,
            borderRadius: 15,
            marginBottom: 10,
          }}>
            <Text style={{ color: white, fontWeight: '600', fontSize: 14 }}>
              {profileData?.role || 'ADMINISTRATEUR'}
            </Text>
          </View>
          <Text style={{ fontSize: 16, color: grey }}>
            {profileData?.email}
          </Text>
        </View>

        {/* Section Informations du compte */}
        <View style={{ marginBottom: 30 }}>
          <ExistingSectionTitle style={{ color: dark, textAlign: 'left', marginBottom: 15 }}>
            Informations du compte
          </ExistingSectionTitle>
          
          <InfoBox style={{ 
            backgroundColor: '#F8F9FA', 
            borderColor: blue,
            borderWidth: 1,
            borderLeftWidth: 5,
          }}>
            <View style={{ marginBottom: 15 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <Ionicons name="person" size={20} color={blue} style={{ marginRight: 10 }} />
                <Text style={{ fontSize: 16, color: dark, fontWeight: '600' }}>
                  Identité
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ fontSize: 14, color: grey }}>Nom complet:</Text>
                <Text style={{ fontSize: 14, color: dark, fontWeight: '500' }}>
                  {profileData?.prenom} {profileData?.nom}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ fontSize: 14, color: grey }}>Email:</Text>
                <Text style={{ fontSize: 14, color: dark, fontWeight: '500' }}>
                  {profileData?.email}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 14, color: grey }}>ID Admin:</Text>
                <Text style={{ fontSize: 14, color: dark, fontWeight: '500' }}>
                  #{profileData?.id}
                </Text>
              </View>
            </View>

            <View style={{ height: 1, backgroundColor: '#E0E0E0', marginVertical: 15 }} />

            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <Ionicons name="calendar" size={20} color={blue} style={{ marginRight: 10 }} />
                <Text style={{ fontSize: 16, color: dark, fontWeight: '600' }}>
                  Historique
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ fontSize: 14, color: grey }}>Date d'inscription:</Text>
                <Text style={{ fontSize: 14, color: dark, fontWeight: '500' }}>
                  {formatDate(profileData?.dateInscription)}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 14, color: grey }}>Rôle:</Text>
                <View style={{
                  backgroundColor: yellow,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 12,
                }}>
                  <Text style={{ color: dark, fontSize: 12, fontWeight: '500' }}>
                    {profileData?.role || 'ADMIN'}
                  </Text>
                </View>
              </View>
            </View>
          </InfoBox>
        </View>

        {/* Section Statistiques admin (à venir) */}
        <View style={{ marginBottom: 30 }}>
          <ExistingSectionTitle style={{ color: dark, textAlign: 'left', marginBottom: 15 }}>
            Statistiques d'administration
          </ExistingSectionTitle>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <InfoBox style={{ 
              width: '48%', 
              backgroundColor: blue, 
              borderColor: blue,
              alignItems: 'center',
              padding: 15,
              marginBottom: 10,
            }}>
              <Ionicons name="shield-checkmark" size={30} color={white} style={{ marginBottom: 10 }} />
              <Text style={{ fontSize: 12, color: white, textAlign: 'center', marginBottom: 5 }}>
                Signalements traités
              </Text>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: white }}>
                --
              </Text>
            </InfoBox>

            <InfoBox style={{ 
              width: '48%', 
              backgroundColor: yellow, 
              borderColor: yellow,
              alignItems: 'center',
              padding: 15,
              marginBottom: 10,
            }}>
              <Ionicons name="people" size={30} color={dark} style={{ marginBottom: 10 }} />
              <Text style={{ fontSize: 12, color: dark, textAlign: 'center', marginBottom: 5 }}>
                Utilisateurs gérés
              </Text>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: dark }}>
                --
              </Text>
            </InfoBox>

            <InfoBox style={{ 
              width: '48%', 
              backgroundColor: '#F0F7FF', 
              borderColor: blue,
              borderWidth: 1,
              alignItems: 'center',
              padding: 15,
            }}>
              <Ionicons name="chatbubbles" size={30} color={blue} style={{ marginBottom: 10 }} />
              <Text style={{ fontSize: 12, color: dark, textAlign: 'center', marginBottom: 5 }}>
                Débats modérés
              </Text>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: blue }}>
                --
              </Text>
            </InfoBox>

            <InfoBox style={{ 
              width: '48%', 
              backgroundColor: '#FFF8F0', 
              borderColor: yellow,
              borderWidth: 1,
              alignItems: 'center',
              padding: 15,
            }}>
              <Ionicons name="settings" size={30} color={yellow} style={{ marginBottom: 10 }} />
              <Text style={{ fontSize: 12, color: dark, textAlign: 'center', marginBottom: 5 }}>
                Actions totales
              </Text>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: yellow }}>
                --
              </Text>
            </InfoBox>
          </View>
        </View>

        {/* Section Actions */}
        <View style={{ marginBottom: 40 }}>
          <ExistingSectionTitle style={{ color: dark, textAlign: 'left', marginBottom: 15 }}>
            Actions
          </ExistingSectionTitle>
          
          <TouchableOpacity
            onPress={() => navigation.navigate('AdminSignal')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#F0F7FF',
              padding: 15,
              borderRadius: 10,
              marginBottom: 10,
              borderWidth: 1,
              borderColor: blue,
            }}
          >
            <Ionicons name="warning" size={24} color={blue} style={{ marginRight: 15 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, color: dark, fontWeight: '600' }}>
                Gérer les signalements
              </Text>
              <Text style={{ fontSize: 12, color: grey }}>
                Consulter et traiter les signalements
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={grey} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('AdminSujets')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#FFF8F0',
              padding: 15,
              borderRadius: 10,
              marginBottom: 10,
              borderWidth: 1,
              borderColor: yellow,
            }}
          >
            <Ionicons name="list" size={24} color={yellow} style={{ marginRight: 15 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, color: dark, fontWeight: '600' }}>
                Gérer les sujets
              </Text>
              <Text style={{ fontSize: 12, color: grey }}>
                Modérer les sujets de débats
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={grey} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={fetchProfileData}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#F8F9FA',
              padding: 15,
              borderRadius: 10,
              marginBottom: 15,
              borderWidth: 1,
              borderColor: '#E0E0E0',
            }}
          >
            <Ionicons name="refresh" size={24} color={dark} style={{ marginRight: 15 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, color: dark, fontWeight: '600' }}>
                Actualiser les données
              </Text>
              <Text style={{ fontSize: 12, color: grey }}>
                Rafraîchir les informations du profil
              </Text>
            </View>
          </TouchableOpacity>

          {/* Bouton de déconnexion */}
          <StyledButton 
            onPress={handleLogout} 
            style={{ 
              backgroundColor: pink,
              marginTop: 10,
            }}
          >
            <ButtonText>Déconnexion</ButtonText>
          </StyledButton>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminProfile;