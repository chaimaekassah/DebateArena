import React, { useState, useEffect } from 'react';
import { 
  ScrollView, 
  RefreshControl, 
  View, 
  Text,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

// Importez vos styles existants
import { 
  BackgroundContainer, 
  InnerContainer, 
  StyledButton, 
  ButtonText, 
  WhiteButton,
  Label,
  TextLink,
  TextLinkContent,
  Colors,
  Shadow,
  StatLabel
} from '../../components/styles';

const { dark, yellow, blue, lightPink, pink, white, grey, brand, green } = Colors;

const Dashboard = ({ navigation }) => {
  const [user, setUser] = useState({
    nom: "Utilisateur",
    prenom: "Test",
    email: "test@email.com"
  });
  
  const [dashboardData, setDashboardData] = useState({
    niveau: "DÉBUTANT",
    progressionPourcentage: 0,
    score: 0,
    pointsPourNiveauSuivant: 100,
    badgeActuel: {
      nom: "Nouveau",
      description: "Commencer l'aventure",
      categorie: "BRONZE"
    },
    totalDebats: 0,
    debatsGagnes: 0,
    tauxReussite: 0,
    moyenneNotes: 0,
    meilleureNote: 0,
    debatsRecents: []
  });
  
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const nom = await AsyncStorage.getItem('nom') || "Utilisateur";
      const prenom = await AsyncStorage.getItem('prenom') || "Test";
      const email = await AsyncStorage.getItem('email') || "test@email.com";
      
      setUser({ nom, prenom, email });
      
      const response = await api.get('/dashboard');
      
      if (response.data) {
        const data = response.data;
        setDashboardData({
          niveau: data.niveau || "DÉBUTANT",
          progressionPourcentage: data.progressionPourcentage || 0,
          score: data.score || 0,
          pointsPourNiveauSuivant: data.pointsPourNiveauSuivant || 100,
          badgeActuel: data.badgeActuel || { 
            nom: "Nouveau", 
            description: "Commencer l'aventure",
            categorie: "BRONZE" 
          },
          totalDebats: data.totalDebats || 0,
          debatsGagnes: data.debatsGagnes || 0,
          tauxReussite: data.tauxReussite || 0,
          moyenneNotes: data.moyenneNotes || 0,
          meilleureNote: data.meilleureNote || 0,
          debatsRecents: data.debatsRecents || []
        });
        
        await AsyncStorage.setItem('score', data.score?.toString() || "0");
        await AsyncStorage.setItem('badgeMom', data.badgeActuel?.nom || "Nouveau");
        await AsyncStorage.setItem('badgeCategorie', data.badgeActuel?.categorie || "BRONZE");
      }
      
    } catch (error) {
      console.log("Erreur lors du chargement des données:", error);
      
      let errorMessage = "Impossible de charger les données.";
      if (error.response?.status === 401) {
        errorMessage = "Session expirée. Veuillez vous reconnecter.";
      } else if (error.response?.status === 500) {
        errorMessage = "Erreur serveur. Veuillez réessayer plus tard.";
      } else if (!error.response) {
        errorMessage = "Problème de connexion. Vérifiez votre réseau.";
      }
      
      setError(errorMessage);
      
      const score = parseInt(await AsyncStorage.getItem('score')) || 0;
      const badgeMom = await AsyncStorage.getItem('badgeMom') || "Nouveau";
      const badgeCategorie = await AsyncStorage.getItem('badgeCategorie') || "BRONZE";
      const totalDebats = parseInt(await AsyncStorage.getItem('totalDebats')) || 0;
      const debatsGagnes = parseInt(await AsyncStorage.getItem('debatsGagnes')) || 0;
      
      setDashboardData(prev => ({
        ...prev,
        score,
        totalDebats,
        debatsGagnes,
        tauxReussite: totalDebats > 0 ? Math.round((debatsGagnes / totalDebats) * 100) : 0,
        badgeActuel: {
          nom: badgeMom,
          categorie: badgeCategorie,
          description: "Badge local"
        }
      }));
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const calculateLevel = () => {
    const level = Math.floor(dashboardData.score / 100) + 1;
    return level;
  };

  const getBadgeColor = (categorie) => {
    switch(categorie?.toUpperCase()) {
      case 'OR': return '#FFD700';
      case 'ARGENT': return '#C0C0C0';
      case 'BRONZE': return '#CD7F32';
      case 'PLATINE': return '#E5E4E2';
      default: return brand;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date inconnue';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return 'Date invalide';
    }
  };

  const formatDuration = (duration) => {
    if (!duration) return 'N/A';
    return duration;
  };

  const getDifficultyColor = (difficulte) => {
    if (!difficulte) return grey;
    switch(difficulte.toUpperCase()) {
      case 'FACILE': return green;
      case 'INTERMEDIAIRE': return blue;
      case 'DIFFICILE': return pink;
      default: return grey;
    }
  };

  const getDifficultyText = (difficulte) => {
    if (!difficulte) return 'N/A';
    return difficulte.charAt(0).toUpperCase() + difficulte.slice(1).toLowerCase();
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      navigation.replace('Login');
    } catch (error) {
      console.log("Erreur lors de la déconnexion:", error);
    }
  };

  if (loading && !refreshing) {
    return (
      <BackgroundContainer source={require("../../assets/img/fond.png")} resizeMode="cover">
        <InnerContainer style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
          <ActivityIndicator size="large" color={white} />
          <Label style={{ marginTop: 20, fontSize: 16 }}>Chargement des données...</Label>
        </InnerContainer>
      </BackgroundContainer>
    );
  }

  return (
    <BackgroundContainer 
      source={require("../../assets/img/fond.png")} 
      resizeMode="cover"
    >
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[white]}
            tintColor={white}
          />
        }
      >
        <InnerContainer style={{ paddingBottom: 30 }}>
          
          {error && (
            <View style={{ 
              backgroundColor: `${pink}20`, 
              padding: 15, 
              marginBottom: 20,
              borderWidth: 1,
              borderColor: pink,
              borderRadius: 20,
              width: '100%'
            }}>
              <Label style={{ color: dark, marginBottom: 10, textAlign: 'center' }}>{error}</Label>
              <StyledButton 
                style={{ backgroundColor: brand, height: 40, marginBottom: 0 }}
                onPress={loadDashboardData}
              >
                <ButtonText style={{ fontSize: 14, color: white }}>
                  Réessayer
                </ButtonText>
              </StyledButton>
            </View>
          )}
          
          {/* Header avec titre */}
          <View style={{ alignItems: 'center', marginBottom: 20, marginTop: 10 }}>
            <Label style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 5, color: white }}>
              Tableau de Bord
            </Label>
            <Label style={{ fontSize: 16, color: lightPink }}>
              Bienvenue {user.prenom} !
            </Label>
          </View>

          {/* Carte Profil - SOLIDE */}
          <Shadow style={{ 
            backgroundColor: white,
            borderRadius: 30,
            padding: 20,
            marginBottom: 20,
            width: '100%'
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
              <View style={{ 
                width: 80, 
                height: 80, 
                borderRadius: 40, 
                marginRight: 15,
                borderWidth: 3,
                borderColor: yellow,
                backgroundColor: lightPink,
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <Text style={{ fontSize: 24, color: dark, fontWeight: 'bold' }}>
                  {user.prenom?.charAt(0) || ''}{user.nom?.charAt(0) || ''}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <StatLabel style={{ fontSize: 20, marginBottom: 2 }}>
                  {user.prenom} {user.nom}
                </StatLabel>
                <Label style={{ color: grey, marginTop: 0, textAlign: 'left' }}>
                  {user.email}
                </Label>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                  <Ionicons name="trophy" size={16} color={yellow} />
                  <StatLabel style={{ marginLeft: 5, fontSize: 14 }}>
                    {dashboardData.score} points
                  </StatLabel>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                  <Ionicons name="stats-chart" size={16} color={blue} />
                  <StatLabel style={{ marginLeft: 5, fontSize: 14 }}>
                    Niveau: {dashboardData.niveau}
                  </StatLabel>
                </View>
              </View>
            </View>
            
            {/* Badge */}
            <View style={{ 
              backgroundColor: getBadgeColor(dashboardData.badgeActuel?.categorie),
              paddingVertical: 8,
              paddingHorizontal: 20,
              borderRadius: 20,
              alignSelf: 'flex-start',
              marginBottom: 15
            }}>
              <StatLabel style={{ color: white, fontSize: 12 }}>
                {dashboardData.badgeActuel?.nom}
              </StatLabel>
            </View>
            
            {dashboardData.badgeActuel?.description && (
              <Label style={{ color: grey, fontSize: 12, marginBottom: 10, fontStyle: 'italic' }}>
                {dashboardData.badgeActuel.description}
              </Label>
            )}
            
            {/* Bouton modifier profil */}
            <StyledButton 
              style={{ 
                backgroundColor: brand,
                marginBottom: 0,
                marginTop: 10
              }}
              onPress={() => navigation.navigate('Profil')}
            >
              <ButtonText style={{ color: white, fontSize: 16 }}>
                <Ionicons name="create-outline" size={16} />
                {' '}Modifier le profil
              </ButtonText>
            </StyledButton>
          </Shadow>

          {/* Section Niveau et Progression - TRANSPARENTE */}
          <View style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 30,
            padding: 20,
            marginBottom: 20,
            width: '100%',
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.2)'
          }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: white, marginBottom: 15, textAlign: 'center' }}>
              Niveau {calculateLevel()}
            </Text>
            
            {/* Barre de progression */}
            <View style={{ marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                <Text style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.8)' }}>Progression</Text>
                <Text style={{ fontSize: 12, color: white, fontWeight: 'bold' }}>
                  {dashboardData.progressionPourcentage.toFixed(1)}%
                </Text>
              </View>
              <View style={{ 
                height: 12, 
                backgroundColor: 'rgba(200, 173, 192, 0.3)', 
                borderRadius: 6, 
                overflow: 'hidden'
              }}>
                <View style={{ 
                  height: '100%', 
                  backgroundColor: green, 
                  borderRadius: 6, 
                  width: `${dashboardData.progressionPourcentage}%` 
                }} />
              </View>
            </View>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 12 }}>
                {dashboardData.score} / {dashboardData.score + dashboardData.pointsPourNiveauSuivant} points
              </Text>
              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                backgroundColor: 'rgba(255, 196, 130, 0.2)', 
                paddingVertical: 5, 
                paddingHorizontal: 10, 
                borderRadius: 15,
                borderWidth: 1,
                borderColor: 'rgba(255, 196, 130, 0.3)'
              }}>
                <Ionicons name="star" size={14} color={yellow} />
                <Text style={{ marginLeft: 5, fontSize: 12, color: white }}>Niveau {calculateLevel()}</Text>
              </View>
            </View>
          </View>

          {/* Section Statistiques */}
          <View style={{ width: '100%', marginBottom: 20 }}>
            <Label style={{ 
              fontSize: 18, 
              fontWeight: 'bold', 
              color: white, 
              marginBottom: 15,
              textAlign: 'center'
            }}>
              Mes Statistiques
            </Label>
            
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              <StatCard 
                icon="chatbubbles" 
                value={dashboardData.totalDebats.toString()} 
                label="Débats" 
                color={blue}
              />
              <StatCard 
                icon="trophy" 
                value={dashboardData.debatsGagnes.toString()} 
                label="Victoires" 
                color={green}
              />
              <StatCard 
                icon="trending-up" 
                value={`${dashboardData.tauxReussite}%`} 
                label="Taux de réussite" 
                color={yellow}
              />
              <StatCard 
                icon="school" 
                value={dashboardData.moyenneNotes.toFixed(1)} 
                label="Moyenne /20" 
                color={pink}
              />
            </View>
            
            {/* Meilleure note - SOLIDE */}
            {dashboardData.meilleureNote > 0 && (
              <Shadow style={{ 
                backgroundColor: white, 
                borderRadius: 20, 
                padding: 15, 
                marginTop: 10,
                alignItems: 'center'
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                  <Ionicons name="ribbon" size={20} color={green} style={{ marginRight: 8 }} />
                  <StatLabel style={{ fontSize: 16 }}>
                    Meilleure note : {dashboardData.meilleureNote}/20
                  </StatLabel>
                </View>
              </Shadow>
            )}
          </View>

          {/* Section Badges - SOLIDE */}
          <Shadow style={{ 
            backgroundColor: white,
            borderRadius: 30,
            padding: 20,
            marginBottom: 20,
            width: '100%'
          }}>
            <StatLabel style={{ fontSize: 18, marginBottom: 15, textAlign: 'center' }}>
              Mes Badges
            </StatLabel>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={{ paddingVertical: 10 }}
              contentContainerStyle={{ paddingHorizontal: 5 }}
            >
              <BadgeItem 
                icon="rocket" 
                name="Débutant" 
                color={blue} 
                unlocked={dashboardData.score >= 0} 
              />
              <BadgeItem 
                icon="megaphone" 
                name="Orateur" 
                color={green} 
                unlocked={dashboardData.score >= 100} 
              />
              <BadgeItem 
                icon="chatbubbles" 
                name="Persuasif" 
                color={yellow} 
                unlocked={dashboardData.score >= 200} 
              />
              <BadgeItem 
                icon="school" 
                name="Expert" 
                color={pink} 
                unlocked={dashboardData.score >= 300} 
              />
              <BadgeItem 
                icon="trophy" 
                name={dashboardData.badgeActuel?.categorie || "Bronze"} 
                color={getBadgeColor(dashboardData.badgeActuel?.categorie)} 
                unlocked={true} 
                isCurrent={true}
              />
            </ScrollView>
          </Shadow>

          {/* Section Derniers Débats - SOLIDE */}
          <Shadow style={{ 
            backgroundColor: white,
            borderRadius: 30,
            padding: 20,
            width: '100%'
          }}>
            <StatLabel style={{ fontSize: 18, marginBottom: 15, textAlign: 'center' }}>
              Derniers Débats
            </StatLabel>
            
            {dashboardData.debatsRecents.length > 0 ? (
              dashboardData.debatsRecents.slice(0, 3).map((debat, index) => (
                <DebateItem 
                  key={debat.id || index}
                  title={debat.sujet}
                  date={formatDate(debat.date)}
                  note={debat.note}
                  categorie={debat.categorie}
                  difficulte={debat.difficulte}
                  duree={formatDuration(debat.duree)}
                />
              ))
            ) : (
              <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                <Ionicons name="chatbubble-outline" size={40} color={grey} />
                <Label style={{ marginTop: 10, color: grey }}>
                  Aucun débat récent
                </Label>
              </View>
            )}
            
            {dashboardData.debatsRecents.length > 0 && (
              <View style={{ alignItems: 'center', marginTop: 15 }}>
                <TextLink onPress={() => navigation.navigate('DebateHistory')}>
                  <TextLinkContent style={{ color: brand, fontSize: 14, fontWeight: '600' }}>
                    Voir tout l'historique →
                  </TextLinkContent>
                </TextLink>
              </View>
            )}
          </Shadow>

          {/* Actions Rapides - Utilisation de WhiteButton avec style modifié */}
          <View style={{ width: '100%', marginTop: 20, marginBottom: 30 }}>
            <Label style={{ 
              fontSize: 18, 
              fontWeight: 'bold', 
              color: white, 
              marginBottom: 15,
              textAlign: 'center'
            }}>
              Actions Rapides
            </Label>
            
            <WhiteButton 
              style={{ 
                marginBottom: 10,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.2)'
              }}
              onPress={() => navigation.navigate('Débat')}
            >
              <ButtonText style={{ color: white, fontSize: 16 }}>
                <Ionicons name="search" size={16} />
                {' '}Nouveau Débat
              </ButtonText>
            </WhiteButton>
            
            <WhiteButton 
              style={{ 
                marginBottom: 10,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.2)'
              }}
              onPress={() => navigation.navigate('DebateHistory')}
            >
              <ButtonText style={{ color: white, fontSize: 16 }}>
                <Ionicons name="time" size={16} />
                {' '}Voir l'Historique
              </ButtonText>
            </WhiteButton>
            
            <WhiteButton 
              style={{ 
                marginBottom: 10,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.2)'
              }}
              onPress={() => navigation.navigate('Settings')}
            >
              <ButtonText style={{ color: white, fontSize: 16 }}>
                <Ionicons name="settings" size={16} />
                {' '}Paramètres
              </ButtonText>
            </WhiteButton>
            
            <StyledButton 
              style={{ 
                backgroundColor: pink, 
                marginBottom: 0
              }}
              onPress={handleLogout}
            >
              <ButtonText style={{ color: white, fontSize: 16 }}>
                <Ionicons name="log-out-outline" size={16} />
                {' '}Déconnexion
              </ButtonText>
            </StyledButton>
          </View>

        </InnerContainer>
      </ScrollView>
    </BackgroundContainer>
  );
};

// Composant de carte de statistique - TRANSPARENT
const StatCard = ({ icon, value, label, color }) => (
  <View style={{ 
    width: '48%', 
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20, 
    padding: 15, 
    marginBottom: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4
  }}>
    <View style={{ 
      width: 50, 
      height: 50, 
      borderRadius: 25, 
      backgroundColor: `rgba(${color === blue ? '109, 177, 191' : color === green ? '76, 175, 80' : color === yellow ? '255, 196, 130' : '219, 127, 142'}, 0.3)`, 
      alignItems: 'center', 
      justifyContent: 'center', 
      marginBottom: 10,
      borderWidth: 1,
      borderColor: `rgba(${color === blue ? '109, 177, 191' : color === green ? '76, 175, 80' : color === yellow ? '255, 196, 130' : '219, 127, 142'}, 0.5)`
    }}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <Text style={{ fontSize: 26, fontWeight: 'bold', color: white, marginBottom: 5 }}>{value}</Text>
    <Text style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.8)', textAlign: 'center' }}>{label}</Text>
  </View>
);

// Composant de badge - SOLIDE
const BadgeItem = ({ icon, name, color, unlocked, isCurrent = false }) => {
  const badgeColor = unlocked ? color : '#F5F5F5';
  const borderColor = isCurrent ? yellow : (unlocked ? color : 'transparent');
  
  return (
    <View style={{ alignItems: 'center', marginRight: 20, width: 80 }}>
      <View style={{ 
        width: 60, 
        height: 60, 
        borderRadius: 30, 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: badgeColor,
        marginBottom: 8,
        borderWidth: isCurrent ? 3 : 2,
        borderColor: borderColor
      }}>
        <Ionicons 
          name={unlocked ? icon : 'lock-closed'} 
          size={24} 
          color={unlocked ? white : grey} 
        />
      </View>
      <Text style={{ 
        fontSize: 12, 
        color: unlocked ? dark : grey, 
        textAlign: 'center',
        fontWeight: '600'
      }}>
        {name}
      </Text>
      {isCurrent && (
        <View style={{ 
          position: 'absolute', 
          top: -5, 
          right: -5, 
          backgroundColor: yellow, 
          borderRadius: 10, 
          width: 20, 
          height: 20, 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <Ionicons name="star" size={12} color={white} />
        </View>
      )}
    </View>
  );
};

// Composant d'élément de débat - SOLIDE
const DebateItem = ({ title, date, note, categorie, difficulte, duree }) => {
  const getNoteColor = (note) => {
    const numNote = parseFloat(note);
    if (numNote >= 16) return green;
    if (numNote >= 12) return blue;
    if (numNote >= 8) return yellow;
    return pink;
  };

  const getNoteText = (note) => {
    if (note === undefined || note === null) return 'N/A';
    return `${note}/20`;
  };

  return (
    <View style={{ 
      borderBottomWidth: 1, 
      borderBottomColor: lightPink, 
      paddingVertical: 15 
    }}>
      <Text style={{ 
        fontSize: 16, 
        fontWeight: '600', 
        color: dark, 
        marginBottom: 8,
        textAlign: 'center'
      }}>
        {title}
      </Text>
      
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 8 
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="calendar" size={14} color={grey} />
          <Text style={{ marginLeft: 5, fontSize: 12, color: grey }}>{date}</Text>
        </View>
        
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="timer" size={14} color={grey} />
          <Text style={{ marginLeft: 5, fontSize: 12, color: grey }}>{duree}</Text>
        </View>
      </View>
      
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <View style={{ 
          backgroundColor: getDifficultyColor(difficulte),
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: 12
        }}>
          <Text style={{ color: white, fontSize: 10, fontWeight: 'bold' }}>
            {getDifficultyText(difficulte)}
          </Text>
        </View>
        
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="school" size={14} color={grey} style={{ marginRight: 5 }} />
          <Text style={{ 
            color: getNoteColor(note),
            fontSize: 14,
            fontWeight: 'bold'
          }}>
            {getNoteText(note)}
          </Text>
        </View>
      </View>
      
      {categorie && (
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          marginTop: 8,
          justifyContent: 'center'
        }}>
          <Ionicons name="pricetag" size={12} color={brand} />
          <Text style={{ marginLeft: 5, fontSize: 11, color: brand }}>
            {categorie}
          </Text>
        </View>
      )}
    </View>
  );
};

export default Dashboard;