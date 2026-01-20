import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';

import {
  BackgroundContainer,
  InnerContainer,
  Label,
  StyledButton,
  ButtonText,
  Colors,
  Shadow
} from '../../components/styles';

const { dark, white, brand, blue, green, pink, yellow, lightPink, grey } = Colors;

const DebateResult = ({ navigation, route }) => {
  const { debatId, note: initialNote } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [debateInfo, setDebateInfo] = useState(null);
  const [stats, setStats] = useState(null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const loadResultData = async () => {
      try {
        setLoading(true);
        
        // 1. Récupérer les infos du débat
        if (debatId) {
          const response = await api.get(`/debats/${debatId}`);
          const data = response.data;
          setDebateInfo(data);
          
          // Générer un feedback basé sur la note
          generateFeedback(data.note || initialNote);
        }
        
        // 2. Récupérer les statistiques globales si disponible
        try {
          const statsResponse = await api.get('/dashboard');
          if (statsResponse.data) {
            setStats(statsResponse.data);
          }
        } catch (statsError) {
          console.log('Erreur stats:', statsError);
        }
        
      } catch (error) {
        console.error('Erreur chargement résultats:', error);
        Alert.alert('Erreur', 'Impossible de charger les résultats du débat.');
      } finally {
        setLoading(false);
      }
    };

    loadResultData();
  }, [debatId, initialNote]);

  const generateFeedback = (note) => {
    const numNote = parseFloat(note) || 0;
    
    if (numNote >= 16) {
      setFeedback("Excellent travail ! Vous maîtrisez parfaitement l'art du débat. Votre argumentation était solide et vos réponses pertinentes.");
    } else if (numNote >= 12) {
      setFeedback("Très bon résultat ! Vous avez bien structuré vos arguments et répondu de manière cohérente au chatbot.");
    } else if (numNote >= 8) {
      setFeedback("Bon effort ! Vous avez les bases, mais vous pourriez travailler sur la structure de vos arguments.");
    } else {
      setFeedback("Continuez à vous entraîner ! Chaque débat vous rapproche de la maîtrise de l'art oratoire.");
    }
  };

  const getGradeColor = (note) => {
    const numNote = parseFloat(note) || 0;
    if (numNote >= 16) return green;
    if (numNote >= 12) return blue;
    if (numNote >= 8) return yellow;
    return pink;
  };

  const getGradeIcon = (note) => {
    const numNote = parseFloat(note) || 0;
    if (numNote >= 16) return 'trophy';
    if (numNote >= 12) return 'star';
    if (numNote >= 8) return 'thumbs-up';
    return 'school';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return '';
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loading) {
    return (
      <BackgroundContainer source={require("../../assets/img/fond.png")} resizeMode="cover">
        <InnerContainer style={{ 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center' 
        }}>
          <ActivityIndicator size="large" color={white} />
          <Label style={{ color: white, marginTop: 20, fontSize: 16 }}>
            Chargement des résultats...
          </Label>
        </InnerContainer>
      </BackgroundContainer>
    );
  }

  const note = debateInfo?.note || initialNote || 'N/A';
  const gradeColor = getGradeColor(note);
  const gradeIcon = getGradeIcon(note);

  return (
    <BackgroundContainer source={require("../../assets/img/fond.png")} resizeMode="cover">
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        <InnerContainer style={{ paddingVertical: 20 }}>
          {/* Header avec bouton retour */}
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color={white} />
            </TouchableOpacity>
            <Label style={styles.title}>Résultats du Débat</Label>
          </View>

          {/* Carte résultat principale */}
          <View style={styles.mainCard}>
            <View style={styles.gradeContainer}>
              <View style={[styles.gradeCircle, { borderColor: gradeColor + '50' }]}>
                <Ionicons name={gradeIcon} size={60} color={gradeColor} />
                <Label style={[styles.gradeText, { color: gradeColor }]}>
                  {note}/20
                </Label>
              </View>
            </View>

            <Label style={styles.debateTitle}>
              {debateInfo?.sujet?.titre || 'Débat terminé'}
            </Label>

            {/* Informations du débat */}
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Ionicons name="calendar" size={16} color={blue} />
                <Label style={styles.infoLabel}>
                  {debateInfo?.dateDebut ? formatDate(debateInfo.dateDebut) : 'Date inconnue'}
                </Label>
              </View>

              <View style={styles.infoItem}>
                <Ionicons name="timer" size={16} color={blue} />
                <Label style={styles.infoLabel}>
                  Durée: {formatDuration(debateInfo?.duree)}
                </Label>
              </View>

              <View style={styles.infoItem}>
                <Ionicons name="flag" size={16} color={blue} />
                <Label style={styles.infoLabel}>
                  Position: {debateInfo?.choixUtilisateur === 'POUR' ? 'POUR' : 'CONTRE'}
                </Label>
              </View>

              <View style={styles.infoItem}>
                <Ionicons name="stats-chart" size={16} color={blue} />
                <Label style={styles.infoLabel}>
                  Type: {debateInfo?.type === 'TEST' ? 'Test' : 'Entraînement'}
                </Label>
              </View>
            </View>
          </View>

          {/* Feedback */}
          <View style={styles.feedbackCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="chatbubble-ellipses" size={24} color={gradeColor} />
              <Label style={styles.sectionTitle}>Feedback</Label>
            </View>
            <Label style={styles.feedbackText}>
              {feedback}
            </Label>
            
            {/* Conseils selon la note */}
            <View style={styles.tipsContainer}>
              <Label style={styles.tipsTitle}>Conseils pour progresser :</Label>
              <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={16} color={green} />
                <Label style={styles.tipText}>
                  Structurez vos arguments avec des exemples concrets
                </Label>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={16} color={green} />
                <Label style={styles.tipText}>
                  Anticipez les contre-arguments de votre adversaire
                </Label>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={16} color={green} />
                <Label style={styles.tipText}>
                  Respectez le temps imparti pour chaque intervention
                </Label>
              </View>
            </View>
          </View>

          {/* Statistiques personnelles */}
          {stats && (
            <View style={styles.statsCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name="trending-up" size={24} color={brand} />
                <Label style={styles.sectionTitle}>Vos Statistiques</Label>
              </View>
              
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Label style={styles.statValue}>{stats.totalDebats || 0}</Label>
                  <Label style={styles.statLabel}>Débats totaux</Label>
                </View>
                
                <View style={styles.statItem}>
                  <Label style={styles.statValue}>{stats.debatsGagnes || 0}</Label>
                  <Label style={styles.statLabel}>Victoires</Label>
                </View>
                
                <View style={styles.statItem}>
                  <Label style={styles.statValue}>{stats.tauxReussite || 0}%</Label>
                  <Label style={styles.statLabel}>Taux de réussite</Label>
                </View>
                
                <View style={styles.statItem}>
                  <Label style={styles.statValue}>{stats.moyenneNotes?.toFixed(1) || '0.0'}</Label>
                  <Label style={styles.statLabel}>Moyenne</Label>
                </View>
              </View>
            </View>
          )}

          {/* Actions */}
          <View style={styles.actionsCard}>
            <StyledButton 
              style={styles.primaryButton}
              onPress={() => navigation.navigate('Dashboard')}
            >
              <ButtonText style={styles.buttonText}>
                <Ionicons name="home" size={20} />
                {'  '}Retour au Tableau de Bord
              </ButtonText>
            </StyledButton>

            <View style={styles.secondaryButtons}>
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={() => navigation.navigate('DebateHistory')}
              >
                <Ionicons name="time" size={20} color={brand} />
                <Label style={styles.secondaryButtonText}>
                  Voir l'Historique
                </Label>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={() => navigation.navigate('Débat')}
              >
                <Ionicons name="add-circle" size={20} color={brand} />
                <Label style={styles.secondaryButtonText}>
                  Nouveau Débat
                </Label>
              </TouchableOpacity>
            </View>
          </View>
        </InnerContainer>
      </ScrollView>
    </BackgroundContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    position: 'relative'
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)'
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: white,
    textAlign: 'center',
    marginLeft: -44
  },
  mainCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    padding: 25,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)'
  },
  gradeContainer: {
    alignItems: 'center',
    marginBottom: 20
  },
  gradeCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    marginBottom: 15
  },
  gradeText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 10
  },
  debateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: white,
    textAlign: 'center',
    marginBottom: 20
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%'
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 10,
    width: '48%'
  },
  infoLabel: {
    fontSize: 12,
    color: white,
    marginLeft: 8,
    opacity: 0.9
  },
  feedbackCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    padding: 25,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)'
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: white,
    marginLeft: 10
  },
  feedbackText: {
    fontSize: 16,
    color: white,
    lineHeight: 24,
    marginBottom: 20
  },
  tipsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 15
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: white,
    marginBottom: 10
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: white,
    marginLeft: 10,
    opacity: 0.9,
    lineHeight: 20
  },
  statsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    padding: 25,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)'
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  statItem: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: white,
    marginBottom: 5
  },
  statLabel: {
    fontSize: 12,
    color: white,
    opacity: 0.8,
    textAlign: 'center'
  },
  actionsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    padding: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)'
  },
  primaryButton: {
    backgroundColor: brand,
    marginBottom: 15
  },
  buttonText: {
    color: white,
    fontSize: 16,
    fontWeight: '600'
  },
  secondaryButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 15,
    width: '48%',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)'
  },
  secondaryButtonText: {
    color: brand,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8
  }
});

export default DebateResult;