// screens/Admin/AdminSignal.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api, { verifyToken } from '../../services/api';
import { showErrorAlert } from '../../services/apiErrorHandler';
import { 
  InnerContainer,
  StyledButton,
  ButtonText,
  WhiteButton,
  InfoBox,
  Colors,
  SectionTitle as ExistingSectionTitle
} from '../../components/styles';

const { dark, yellow, blue, white, pink, green, grey } = Colors;

const AdminSignal = ({ navigation }) => {
  const [signalements, setSignalements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSignalement, setSelectedSignalement] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [commentaire, setCommentaire] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('RESOLU');
  const [filterStatus, setFilterStatus] = useState('EN_ATTENTE');

  const fetchSignalements = async () => {
    try {
      setError(null);
      console.log('🔄 Chargement des signalements...');
      
      const isValid = await verifyToken();
      if (!isValid) {
        Alert.alert(
          "Session expirée",
          "Votre session a expiré. Veuillez vous reconnecter.",
          [{ text: "OK", onPress: () => navigation.replace('Login') }]
        );
        return;
      }
      
      // Filtrer par statut si spécifié
      const params = {};
      if (filterStatus) {
        params.statut = filterStatus;
      }
      
      const response = await api.get('/admin/signalements', { params });
      
      if (response.data) {
        console.log('✅ Signalements chargés:', response.data.length);
        setSignalements(response.data);
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des signalements:', error);
      setError(error);
      showErrorAlert(error, navigation);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchSignalements();
  };

  const handleTraiterSignalement = async () => {
    try {
      if (!selectedSignalement) return;
      
      const traitementData = {
        statut: selectedStatus,
        commentaireAdmin: commentaire.trim() || null,
        valid: true
      };
      
      console.log('🔄 Traitement du signalement:', selectedSignalement.id);
      console.log('Données:', traitementData);
      
      const response = await api.put(
        `/admin/signalements/${selectedSignalement.id}`,
        traitementData
      );
      
      if (response.data) {
        console.log('✅ Signalement traité avec succès');
        Alert.alert('Succès', 'Le signalement a été traité avec succès.');
        
        // Mettre à jour la liste
        const updated = signalements.map(s => 
          s.id === selectedSignalement.id ? response.data : s
        );
        setSignalements(updated);
        
        // Fermer le modal
        setModalVisible(false);
        setCommentaire('');
      }
    } catch (error) {
      console.error('❌ Erreur lors du traitement:', error);
      Alert.alert('Erreur', 'Impossible de traiter le signalement.');
    }
  };

  const openModal = (signalement) => {
    setSelectedSignalement(signalement);
    setCommentaire(signalement.commentaireAdmin || '');
    setSelectedStatus(signalement.statut);
    setModalVisible(true);
  };

  const getStatusColor = (statut) => {
    switch (statut) {
      case 'EN_ATTENTE': return yellow;
      case 'EN_COURS': return blue;
      case 'RESOLU': return green;
      case 'REJETE': return pink;
      default: return grey;
    }
  };

  const getStatusLabel = (statut) => {
    switch (statut) {
      case 'EN_ATTENTE': return 'En attente';
      case 'EN_COURS': return 'En cours';
      case 'RESOLU': return 'Résolu';
      case 'REJETE': return 'Rejeté';
      default: return statut;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'BUG_TECHNIQUE': return 'Bug technique';
      case 'CONTENU_INAPPROPRIE': return 'Contenu inapproprié';
      case 'HARCELEMENT': return 'Harcèlement';
      case 'FAUSSES_INFORMATIONS': return 'Fausses informations';
      case 'AUTRE': return 'Autre';
      default: return type;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    fetchSignalements();
  }, [filterStatus]);

  // Afficher le loader
  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: white }}>
        <InnerContainer>
          <ActivityIndicator size="large" color={blue} />
          <Text style={{ color: dark, marginTop: 20, fontSize: 16 }}>
            Chargement des signalements...
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
            Erreur lors du chargement
          </Text>
          <WhiteButton onPress={fetchSignalements} style={{ backgroundColor: yellow }}>
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
        {/* Header */}
        <View style={{ marginBottom: 20 }}>
          <ExistingSectionTitle style={{ color: dark, textAlign: 'left', marginBottom: 10 }}>
            Gestion des Signalements
          </ExistingSectionTitle>
          <Text style={{ fontSize: 14, color: grey }}>
            {signalements.length} signalement(s) trouvé(s)
          </Text>
        </View>

        {/* Filtres */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 16, color: dark, marginBottom: 10, fontWeight: '600' }}>
            Filtrer par statut:
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15 }}>
            {['TOUS', 'EN_ATTENTE', 'EN_COURS', 'RESOLU', 'REJETE'].map((statut) => (
              <TouchableOpacity
                key={statut}
                onPress={() => setFilterStatus(statut === 'TOUS' ? '' : statut)}
                style={{
                  backgroundColor: filterStatus === (statut === 'TOUS' ? '' : statut) ? blue : '#F0F0F0',
                  paddingHorizontal: 15,
                  paddingVertical: 8,
                  borderRadius: 20,
                  marginRight: 10,
                }}
              >
                <Text style={{
                  color: filterStatus === (statut === 'TOUS' ? '' : statut) ? white : dark,
                  fontWeight: '500',
                }}>
                  {statut === 'TOUS' ? 'Tous' : getStatusLabel(statut)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Liste des signalements */}
        {signalements.length === 0 ? (
          <InfoBox style={{ 
            backgroundColor: '#F8F9FA', 
            borderColor: yellow,
            borderWidth: 1,
            alignItems: 'center',
            padding: 40,
          }}>
            <Ionicons name="checkmark-circle" size={50} color={green} />
            <Text style={{ fontSize: 18, color: dark, marginTop: 15, textAlign: 'center' }}>
              Aucun signalement {filterStatus ? getStatusLabel(filterStatus).toLowerCase() : ''}
            </Text>
            <Text style={{ fontSize: 14, color: grey, marginTop: 10, textAlign: 'center' }}>
              Tous les signalements sont traités!
            </Text>
          </InfoBox>
        ) : (
          signalements.map((signalement) => (
            <TouchableOpacity 
              key={signalement.id} 
              onPress={() => openModal(signalement)}
              style={{ marginBottom: 15 }}
            >
              <InfoBox style={{ 
                backgroundColor: white,
                borderColor: getStatusColor(signalement.statut),
                borderWidth: 2,
                borderLeftWidth: 5,
              }}>
                {/* En-tête du signalement */}
                <View style={{ 
                  flexDirection: 'row', 
                  justifyContent: 'space-between',
                  marginBottom: 10,
                }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: dark }}>
                      {signalement.titre}
                    </Text>
                    <Text style={{ fontSize: 12, color: grey, marginTop: 2 }}>
                      #{signalement.id} • {formatDate(signalement.dateCreation)}
                    </Text>
                  </View>
                  <View style={{ 
                    backgroundColor: getStatusColor(signalement.statut),
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 12,
                    alignSelf: 'flex-start',
                  }}>
                    <Text style={{ color: white, fontSize: 12, fontWeight: '500' }}>
                      {getStatusLabel(signalement.statut)}
                    </Text>
                  </View>
                </View>

                {/* Description */}
                <Text style={{ fontSize: 14, color: dark, marginBottom: 10, lineHeight: 20 }}>
                  {signalement.description}
                </Text>

                {/* Informations supplémentaires */}
                <View style={{ 
                  flexDirection: 'row', 
                  flexWrap: 'wrap',
                  marginTop: 10,
                  paddingTop: 10,
                  borderTopWidth: 1,
                  borderTopColor: '#F0F0F0',
                }}>
                  <View style={{ marginRight: 15, marginBottom: 5 }}>
                    <Text style={{ fontSize: 12, color: grey }}>Type</Text>
                    <Text style={{ fontSize: 13, color: dark, fontWeight: '500' }}>
                      {getTypeLabel(signalement.typeProbleme)}
                    </Text>
                  </View>
                  
                  <View style={{ marginRight: 15, marginBottom: 5 }}>
                    <Text style={{ fontSize: 12, color: grey }}>Utilisateur</Text>
                    <Text style={{ fontSize: 13, color: dark, fontWeight: '500' }}>
                      {signalement.utilisateurNom || 'Anonyme'}
                    </Text>
                  </View>
                  
                  {signalement.debatSujetTitre && (
                    <View style={{ marginBottom: 5 }}>
                      <Text style={{ fontSize: 12, color: grey }}>Débat</Text>
                      <Text style={{ fontSize: 13, color: dark, fontWeight: '500' }}>
                        {signalement.debatSujetTitre}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Action */}
                <TouchableOpacity 
                  onPress={() => openModal(signalement)}
                  style={{
                    marginTop: 15,
                    paddingVertical: 8,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: blue,
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ color: blue, fontWeight: '600' }}>
                    {signalement.statut === 'EN_ATTENTE' ? 'Traiter' : 'Voir détails'}
                  </Text>
                </TouchableOpacity>
              </InfoBox>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Modal de traitement */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ 
            backgroundColor: white, 
            margin: 20, 
            borderRadius: 15,
            padding: 20,
            maxHeight: '80%',
          }}>
            <ScrollView>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: dark }}>
                  Traiter le signalement
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color={grey} />
                </TouchableOpacity>
              </View>

              {selectedSignalement && (
                <>
                  <View style={{ marginBottom: 20 }}>
                    <Text style={{ fontSize: 16, color: dark, fontWeight: '600', marginBottom: 5 }}>
                      {selectedSignalement.titre}
                    </Text>
                    <Text style={{ fontSize: 14, color: grey, marginBottom: 10 }}>
                      Signalé par: {selectedSignalement.utilisateurNom || 'Anonyme'}
                    </Text>
                    <Text style={{ fontSize: 14, color: dark, lineHeight: 20 }}>
                      {selectedSignalement.description}
                    </Text>
                  </View>

                  {/* Sélection du statut */}
                  <View style={{ marginBottom: 20 }}>
                    <Text style={{ fontSize: 16, color: dark, marginBottom: 10, fontWeight: '600' }}>
                      Nouveau statut:
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {['EN_ATTENTE', 'EN_COURS', 'RESOLU', 'REJETE'].map((statut) => (
                        <TouchableOpacity
                          key={statut}
                          onPress={() => setSelectedStatus(statut)}
                          style={{
                            backgroundColor: selectedStatus === statut ? getStatusColor(statut) : '#F0F0F0',
                            paddingHorizontal: 15,
                            paddingVertical: 10,
                            borderRadius: 20,
                            marginRight: 10,
                          }}
                        >
                          <Text style={{
                            color: selectedStatus === statut ? white : dark,
                            fontWeight: '500',
                          }}>
                            {getStatusLabel(statut)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>

                  {/* Commentaire admin */}
                  <View style={{ marginBottom: 25 }}>
                    <Text style={{ fontSize: 16, color: dark, marginBottom: 10, fontWeight: '600' }}>
                      Commentaire (optionnel):
                    </Text>
                    <TextInput
                      style={{
                        borderWidth: 1,
                        borderColor: '#E0E0E0',
                        borderRadius: 10,
                        padding: 15,
                        minHeight: 100,
                        textAlignVertical: 'top',
                        backgroundColor: '#F8F9FA',
                        fontSize: 14,
                      }}
                      multiline
                      placeholder="Ajouter un commentaire sur le traitement..."
                      value={commentaire}
                      onChangeText={setCommentaire}
                    />
                  </View>

                  {/* Boutons d'action */}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity
                      onPress={() => setModalVisible(false)}
                      style={{
                        flex: 1,
                        padding: 15,
                        backgroundColor: '#F0F0F0',
                        borderRadius: 10,
                        marginRight: 10,
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ color: dark, fontWeight: '600' }}>Annuler</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      onPress={handleTraiterSignalement}
                      style={{
                        flex: 1,
                        padding: 15,
                        backgroundColor: blue,
                        borderRadius: 10,
                        marginLeft: 10,
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ color: white, fontWeight: '600' }}>
                        {selectedStatus === selectedSignalement.statut ? 'Mettre à jour' : 'Traiter'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default AdminSignal;