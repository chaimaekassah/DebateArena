// screens/Admin/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import styled from 'styled-components/native';
import api, { verifyToken } from '../../services/api';
import { showErrorAlert } from '../../services/apiErrorHandler';
import { 
  InnerContainer,
  StyledButton,
  ButtonText,
  WhiteButton,
  InfoBox,
  StatCircle,
  StatCircleYellow,
  StatLabel,
  ProgressBar,
  ProgressFill,
  SectionTitle as ExistingSectionTitle,
  Colors,
  TextLink,
  TextLinkContent
} from '../../components/styles';

const { dark, yellow, blue, lightPink, pink, white, grey, brand, green, darkLight } = Colors;
const { width } = Dimensions.get('window');

const AdminDashboard = ({ navigation }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      console.log('🔄 Chargement des données du dashboard admin...');
      
      // Vérifier le token d'abord
      const isValid = await verifyToken();
      if (!isValid) {
        Alert.alert(
          "Session expirée",
          "Votre session a expiré. Veuillez vous reconnecter.",
          [{ text: "OK", onPress: () => navigation.navigate("Login") }]
        );
        return;
      }
      
      const response = await api.get('/admin/dashboard');
      
      if (response.data) {
        console.log('✅ Dashboard chargé avec succès');
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement du dashboard:', error);
      setError(error);
      showErrorAlert(error, navigation);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Style commun pour les cartes avec fond clair et accents jaune/bleu
  const cardStyle = {
    backgroundColor: white,
    borderColor: yellow,
    borderWidth: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  };

  // Afficher le loader
  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: white }}>
        <InnerContainer>
          <ActivityIndicator size="large" color={blue} />
          <Text style={{ color: dark, marginTop: 20, fontSize: 16 }}>
            Chargement du dashboard...
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
            Erreur lors du chargement du dashboard
          </Text>
          <WhiteButton onPress={fetchDashboardData} style={{ backgroundColor: yellow }}>
            <ButtonText>Réessayer</ButtonText>
          </WhiteButton>
          <View style={{ marginTop: 20 }}>
            <TextLink onPress={() => navigation.goBack()}>
              <TextLinkContent style={{ color: blue }}>Retour</TextLinkContent>
            </TextLink>
          </View>
        </InnerContainer>
      </SafeAreaView>
    );
  }

  // Afficher le dashboard
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
        style={{ padding: 20, backgroundColor: white }}
      >
        {/* Header avec fond jaune */}
        <View style={{ 
          marginBottom: 30, 
          backgroundColor: yellow, 
          padding: 20, 
          borderRadius: 15,
          elevation: 3,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 3,
          shadowOffset: { width: 0, height: 2 },
        }}>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: dark, marginBottom: 5 }}>
            Dashboard Admin
          </Text>
          <Text style={{ fontSize: 16, color: dark, opacity: 0.8 }}>
            Statistiques globales de la plateforme
          </Text>
        </View>

        {/* Grille de statistiques principales */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 25 }}>
          {/* Utilisateurs - Carte bleue */}
          <InfoBox style={{
            width: width / 2 - 30,
            backgroundColor: blue,
            borderColor: blue,
            elevation: 3,
            shadowColor: '#000',
            shadowOpacity: 0.15,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 2 },
          }}>
            <Text style={{ fontSize: 14, color: white, marginBottom: 10, textAlign: 'center' }}>
              Utilisateurs total
            </Text>
            <Text style={{ fontSize: 32, fontWeight: 'bold', color: white, textAlign: 'center', marginBottom: 5 }}>
              {dashboardData?.totalUtilisateurs || 0}
            </Text>
            <Text style={{ fontSize: 12, color: yellow, textAlign: 'center', marginTop: 5 }}>
              +{dashboardData?.activite30j?.nouveauxUtilisateurs || 0} sur 30j
            </Text>
          </InfoBox>

          {/* Débats - Carte jaune */}
          <InfoBox style={{
            width: width / 2 - 30,
            backgroundColor: yellow,
            borderColor: yellow,
            elevation: 3,
            shadowColor: '#000',
            shadowOpacity: 0.15,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 2 },
          }}>
            <Text style={{ fontSize: 14, color: dark, marginBottom: 10, textAlign: 'center' }}>
              Débats en cours
            </Text>
            <Text style={{ fontSize: 32, fontWeight: 'bold', color: dark, textAlign: 'center', marginBottom: 5 }}>
              {dashboardData?.debatsEnCours || 0}
            </Text>
            <Text style={{ fontSize: 14, color: dark, opacity: 0.8, textAlign: 'center' }}>
              / {dashboardData?.totalDebats || 0} total
            </Text>
          </InfoBox>

          {/* Signalements - Carte bleue */}
          <InfoBox style={{
            width: width / 2 - 30,
            backgroundColor: blue,
            borderColor: blue,
            elevation: 3,
            shadowColor: '#000',
            shadowOpacity: 0.15,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 2 },
          }}>
            <Text style={{ fontSize: 14, color: white, marginBottom: 10, textAlign: 'center' }}>
              Signalements en attente
            </Text>
            <Text style={{ fontSize: 32, fontWeight: 'bold', color: white, textAlign: 'center', marginBottom: 5 }}>
              {dashboardData?.signalementsEnAttente || 0}
            </Text>
            <Text style={{ fontSize: 12, color: yellow, textAlign: 'center', marginTop: 5 }}>
              {dashboardData?.signalementsTraites30j || 0} traités (30j)
            </Text>
          </InfoBox>

          {/* Tests - Carte jaune */}
          <InfoBox style={{
            width: width / 2 - 30,
            backgroundColor: yellow,
            borderColor: yellow,
            elevation: 3,
            shadowColor: '#000',
            shadowOpacity: 0.15,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 2 },
          }}>
            <Text style={{ fontSize: 14, color: dark, marginBottom: 10, textAlign: 'center' }}>
              Note moyenne tests
            </Text>
            <Text style={{ fontSize: 32, fontWeight: 'bold', color: dark, textAlign: 'center', marginBottom: 5 }}>
              {dashboardData?.noteMoyenneTests?.toFixed(1) || '0.0'}
            </Text>
            <Text style={{ fontSize: 14, color: dark, opacity: 0.8, textAlign: 'center' }}>
              / {dashboardData?.totalTests || 0} tests
            </Text>
          </InfoBox>
        </View>

        {/* Section Sujets - Carte avec bordures bleue et jaune */}
        <View style={{ marginBottom: 30 }}>
          <ExistingSectionTitle style={{ color: dark, textAlign: 'left', marginBottom: 15 }}>
            Sujets
          </ExistingSectionTitle>
          <InfoBox style={{
            ...cardStyle,
            borderLeftWidth: 5,
            borderLeftColor: blue,
            borderRightWidth: 5,
            borderRightColor: yellow,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={{ fontSize: 16, color: dark, marginBottom: 5 }}>
                  Sujets total
                </Text>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: blue }}>
                  {dashboardData?.totalSujets || 0}
                </Text>
              </View>
              <View>
                <Text style={{ fontSize: 16, color: dark, marginBottom: 5, textAlign: 'right' }}>
                  Sujets en tendance
                </Text>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: yellow, textAlign: 'right' }}>
                  {dashboardData?.sujetsTendance || 0}
                </Text>
              </View>
            </View>
          </InfoBox>
        </View>

        {/* Section Activité 24h - Carte avec bordures jaune */}
        <View style={{ marginBottom: 30 }}>
          <ExistingSectionTitle style={{ color: dark, textAlign: 'left', marginBottom: 15 }}>
            Activité dernières 24h
          </ExistingSectionTitle>
          <InfoBox style={{
            ...cardStyle,
            borderTopColor: yellow,
            borderTopWidth: 3,
          }}>
            <View style={{ marginBottom: 15 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 }}>
                <Text style={{ fontSize: 16, color: dark }}>
                  Nouveaux utilisateurs
                </Text>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: blue }}>
                  {dashboardData?.activite24h?.nouveauxUtilisateurs || 0}
                </Text>
              </View>
              <View style={{ height: 1, backgroundColor: yellow, opacity: 0.3, marginVertical: 5 }} />
            </View>

            <View style={{ marginBottom: 15 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 }}>
                <Text style={{ fontSize: 16, color: dark }}>
                  Débats créés
                </Text>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: blue }}>
                  {dashboardData?.activite24h?.debatsCrees || 0}
                </Text>
              </View>
              <View style={{ height: 1, backgroundColor: yellow, opacity: 0.3, marginVertical: 5 }} />
            </View>

            <View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 }}>
                <Text style={{ fontSize: 16, color: dark }}>
                  Messages envoyés
                </Text>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: blue }}>
                  {dashboardData?.activite24h?.messagesEnvoyes || 0}
                </Text>
              </View>
            </View>
          </InfoBox>
        </View>

        {/* Section Activité 7 jours - Carte avec bordures bleue */}
        <View style={{ marginBottom: 30 }}>
          <ExistingSectionTitle style={{ color: dark, textAlign: 'left', marginBottom: 15 }}>
            Activité 7 derniers jours
          </ExistingSectionTitle>
          <InfoBox style={{
            ...cardStyle,
            borderBottomColor: blue,
            borderBottomWidth: 3,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 14, color: dark, opacity: 0.7, marginBottom: 5 }}>
                  Utilisateurs
                </Text>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: blue }}>
                  {dashboardData?.activite7j?.nouveauxUtilisateurs || 0}
                </Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 14, color: dark, opacity: 0.7, marginBottom: 5 }}>
                  Débats
                </Text>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: blue }}>
                  {dashboardData?.activite7j?.debatsCrees || 0}
                </Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 14, color: dark, opacity: 0.7, marginBottom: 5 }}>
                  Messages
                </Text>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: blue }}>
                  {dashboardData?.activite7j?.messagesEnvoyes || 0}
                </Text>
              </View>
            </View>
          </InfoBox>
        </View>

        {/* Bouton de rafraîchissement - Dégradé jaune/bleu */}
        <View style={{ marginBottom: 40 }}>
          <StyledButton onPress={fetchDashboardData} style={{ 
            backgroundColor: blue,
            borderWidth: 2,
            borderColor: yellow,
          }}>
            <ButtonText>Actualiser les données</ButtonText>
          </StyledButton>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminDashboard;