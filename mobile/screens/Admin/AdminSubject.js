// screens/Admin/AdminSujets.js
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
  Dimensions,
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
const { width } = Dimensions.get('window');

const AdminSubject = ({ navigation }) => {
  const [sujets, setSujets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  // États pour le modal
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' ou 'edit'
  const [selectedSujet, setSelectedSujet] = useState(null);
  
  // États pour le formulaire
  const [titre, setTitre] = useState('');
  const [categorie, setCategorie] = useState('');
  const [difficulte, setDifficulte] = useState('INTERMEDIAIRE');
  
  // États pour la recherche/filtre
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategorie, setFilterCategorie] = useState('TOUS');
  const [filterDifficulte, setFilterDifficulte] = useState('TOUS');

  const fetchSujets = async () => {
    try {
      setError(null);
      console.log('🔄 Chargement des sujets...');
      
      const isValid = await verifyToken();
      if (!isValid) {
        Alert.alert(
          "Session expirée",
          "Votre session a expiré. Veuillez vous reconnecter.",
          [{ text: "OK", onPress: () => navigation.replace('Login') }]
        );
        return;
      }
      
      const response = await api.get('/admin/sujets/stats');
      
      if (response.data) {
        console.log('✅ Sujets chargés:', response.data.length);
        setSujets(response.data);
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des sujets:', error);
      setError(error);
      showErrorAlert(error, navigation);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchSujets();
  };

  const handleCreateSujet = async () => {
    try {
      if (!titre.trim() || !categorie.trim() || !difficulte) {
        Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires.');
        return;
      }
      
      const sujetData = {
        titre: titre.trim(),
        categorie: categorie.trim(),
        difficulte: difficulte
      };
      
      console.log('🔄 Création du sujet:', sujetData);
      
      const response = await api.post('/admin/sujets', sujetData);
      
      if (response.data) {
        console.log('✅ Sujet créé avec succès');
        Alert.alert('Succès', 'Le sujet a été créé avec succès.');
        
        // Réinitialiser le formulaire
        resetForm();
        setModalVisible(false);
        
        // Rafraîchir la liste
        fetchSujets();
      }
    } catch (error) {
      console.error('❌ Erreur lors de la création:', error);
      Alert.alert('Erreur', 'Impossible de créer le sujet.');
    }
  };

  const handleUpdateSujet = async () => {
    try {
      if (!selectedSujet || !titre.trim() || !categorie.trim() || !difficulte) {
        Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires.');
        return;
      }
      
      const sujetData = {
        titre: titre.trim(),
        categorie: categorie.trim(),
        difficulte: difficulte
      };
      
      console.log('🔄 Mise à jour du sujet:', selectedSujet.sujetId);
      console.log('Données:', sujetData);
      
      const response = await api.put(`/admin/sujets/${selectedSujet.sujetId}`, sujetData);
      
      if (response.data) {
        console.log('✅ Sujet mis à jour avec succès');
        Alert.alert('Succès', 'Le sujet a été mis à jour avec succès.');
        
        // Réinitialiser le formulaire
        resetForm();
        setModalVisible(false);
        
        // Rafraîchir la liste
        fetchSujets();
      }
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour le sujet.');
    }
  };

  const handleDeleteSujet = (sujet) => {
    Alert.alert(
      "Supprimer le sujet",
      `Êtes-vous sûr de vouloir supprimer le sujet "${sujet.titre}"?`,
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Supprimer", 
          style: "destructive",
          onPress: async () => {
            try {
              console.log('🔄 Suppression du sujet:', sujet.sujetId);
              
              const response = await api.delete(`/admin/sujets/${sujet.sujetId}`);
              
              if (response.status === 204) {
                console.log('✅ Sujet supprimé avec succès');
                Alert.alert('Succès', 'Le sujet a été supprimé avec succès.');
                
                // Rafraîchir la liste
                fetchSujets();
              }
            } catch (error) {
              console.error('❌ Erreur lors de la suppression:', error);
              if (error.response?.status === 400) {
                Alert.alert(
                  'Impossible de supprimer',
                  'Ce sujet a des débats associés et ne peut pas être supprimé.'
                );
              } else {
                Alert.alert('Erreur', 'Impossible de supprimer le sujet.');
              }
            }
          }
        }
      ]
    );
  };

  const openCreateModal = () => {
    resetForm();
    setModalMode('create');
    setModalVisible(true);
  };

  const openEditModal = (sujet) => {
    setSelectedSujet(sujet);
    setTitre(sujet.titre);
    setCategorie(sujet.categorie);
    setDifficulte(sujet.difficulte);
    setModalMode('edit');
    setModalVisible(true);
  };

  const resetForm = () => {
    setSelectedSujet(null);
    setTitre('');
    setCategorie('');
    setDifficulte('INTERMEDIAIRE');
  };

  const getCategorieColor = (categorie) => {
    switch (categorie) {
      case 'SCIENCE': return blue;
      case 'SOCIETE': return yellow;
      case 'POLITIQUE': return pink;
      case 'ECONOMIE': return green;
      case 'CULTURE': return '#9C27B0';
      default: return grey;
    }
  };

  const getCategorieLabel = (categorie) => {
    switch (categorie) {
      case 'SCIENCE': return 'Science';
      case 'SOCIETE': return 'Société';
      case 'POLITIQUE': return 'Politique';
      case 'ECONOMIE': return 'Économie';
      case 'CULTURE': return 'Culture';
      default: return categorie;
    }
  };

  const getDifficulteColor = (difficulte) => {
    switch (difficulte) {
      case 'DEBUTANT': return green;
      case 'INTERMEDIAIRE': return yellow;
      case 'EXPERT': return pink;
      default: return grey;
    }
  };

  const getDifficulteLabel = (difficulte) => {
    switch (difficulte) {
      case 'DEBUTANT': return 'Débutant';
      case 'INTERMEDIAIRE': return 'Intermédiaire';
      case 'EXPERT': return 'Expert';
      default: return difficulte;
    }
  };

  const getCategories = () => {
    const categories = [...new Set(sujets.map(s => s.categorie))];
    return ['TOUS', ...categories];
  };

  const getDifficultes = () => {
    const difficultes = [...new Set(sujets.map(s => s.difficulte))];
    return ['TOUS', ...difficultes];
  };

  const filteredSujets = sujets.filter(sujet => {
    // Filtre par recherche
    if (searchQuery && !sujet.titre.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Filtre par catégorie
    if (filterCategorie !== 'TOUS' && sujet.categorie !== filterCategorie) {
      return false;
    }
    
    // Filtre par difficulté
    if (filterDifficulte !== 'TOUS' && sujet.difficulte !== filterDifficulte) {
      return false;
    }
    
    return true;
  });

  useEffect(() => {
    fetchSujets();
  }, []);

  // Afficher le loader
  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: white }}>
        <InnerContainer>
          <ActivityIndicator size="large" color={blue} />
          <Text style={{ color: dark, marginTop: 20, fontSize: 16 }}>
            Chargement des sujets...
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
          <WhiteButton onPress={fetchSujets} style={{ backgroundColor: yellow }}>
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
        {/* Header avec bouton création */}
        <View style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <ExistingSectionTitle style={{ color: dark, textAlign: 'left' }}>
              Gestion des Sujets
            </ExistingSectionTitle>
            <TouchableOpacity
              onPress={openCreateModal}
              style={{
                backgroundColor: blue,
                paddingHorizontal: 15,
                paddingVertical: 8,
                borderRadius: 20,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Ionicons name="add" size={20} color={white} style={{ marginRight: 5 }} />
              <Text style={{ color: white, fontWeight: '600' }}>Nouveau</Text>
            </TouchableOpacity>
          </View>
          <Text style={{ fontSize: 14, color: grey }}>
            {filteredSujets.length} sujet(s) trouvé(s) sur {sujets.length}
          </Text>
        </View>

        {/* Barre de recherche */}
        <View style={{ marginBottom: 20 }}>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#E0E0E0',
              borderRadius: 25,
              paddingHorizontal: 20,
              paddingVertical: 12,
              backgroundColor: '#F8F9FA',
              fontSize: 14,
            }}
            placeholder="Rechercher un sujet..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filtres */}
        <View style={{ marginBottom: 20 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
            <Text style={{ fontSize: 14, color: dark, marginRight: 10, alignSelf: 'center' }}>
              Catégorie:
            </Text>
            {getCategories().map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setFilterCategorie(cat)}
                style={{
                  backgroundColor: filterCategorie === cat ? getCategorieColor(cat) || blue : '#F0F0F0',
                  paddingHorizontal: 15,
                  paddingVertical: 8,
                  borderRadius: 20,
                  marginRight: 10,
                }}
              >
                <Text style={{
                  color: filterCategorie === cat ? white : dark,
                  fontWeight: '500',
                  fontSize: 12,
                }}>
                  {cat === 'TOUS' ? 'Toutes' : getCategorieLabel(cat)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 14, color: dark, marginRight: 10, alignSelf: 'center' }}>
              Difficulté:
            </Text>
            {getDifficultes().map((diff) => (
              <TouchableOpacity
                key={diff}
                onPress={() => setFilterDifficulte(diff)}
                style={{
                  backgroundColor: filterDifficulte === diff ? getDifficulteColor(diff) || blue : '#F0F0F0',
                  paddingHorizontal: 15,
                  paddingVertical: 8,
                  borderRadius: 20,
                  marginRight: 10,
                }}
              >
                <Text style={{
                  color: filterDifficulte === diff ? white : dark,
                  fontWeight: '500',
                  fontSize: 12,
                }}>
                  {diff === 'TOUS' ? 'Toutes' : getDifficulteLabel(diff)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Liste des sujets */}
        {filteredSujets.length === 0 ? (
          <InfoBox style={{ 
            backgroundColor: '#F8F9FA', 
            borderColor: yellow,
            borderWidth: 1,
            alignItems: 'center',
            padding: 40,
          }}>
            <Ionicons name="search" size={50} color={grey} />
            <Text style={{ fontSize: 18, color: dark, marginTop: 15, textAlign: 'center' }}>
              Aucun sujet trouvé
            </Text>
            <Text style={{ fontSize: 14, color: grey, marginTop: 10, textAlign: 'center' }}>
              {searchQuery ? 'Essayez avec d\'autres termes' : 'Créez votre premier sujet!'}
            </Text>
            <TouchableOpacity
              onPress={openCreateModal}
              style={{
                marginTop: 20,
                backgroundColor: blue,
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 25,
              }}
            >
              <Text style={{ color: white, fontWeight: '600' }}>Créer un sujet</Text>
            </TouchableOpacity>
          </InfoBox>
        ) : (
          filteredSujets.map((sujet) => (
            <View key={sujet.sujetId} style={{ marginBottom: 15 }}>
              <InfoBox style={{ 
                backgroundColor: white,
                borderColor: sujet.estTendance ? yellow : '#E0E0E0',
                borderWidth: 2,
                borderLeftWidth: 5,
                borderLeftColor: getCategorieColor(sujet.categorie),
              }}>
                {/* En-tête du sujet */}
                <View style={{ 
                  flexDirection: 'row', 
                  justifyContent: 'space-between',
                  marginBottom: 10,
                }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: dark }}>
                      {sujet.titre}
                    </Text>
                    <Text style={{ fontSize: 12, color: grey, marginTop: 2 }}>
                      ID: {sujet.sujetId}
                    </Text>
                  </View>
                  {sujet.estTendance && (
                    <View style={{ 
                      backgroundColor: yellow,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 12,
                      flexDirection: 'row',
                      alignItems: 'center',
                      alignSelf: 'flex-start',
                    }}>
                      <Ionicons name="trending-up" size={12} color={dark} style={{ marginRight: 4 }} />
                      <Text style={{ color: dark, fontSize: 11, fontWeight: '500' }}>
                        Tendance
                      </Text>
                    </View>
                  )}
                </View>

                {/* Métadonnées */}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15 }}>
                  <View style={{ 
                    backgroundColor: getCategorieColor(sujet.categorie),
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 12,
                    marginRight: 10,
                    marginBottom: 5,
                  }}>
                    <Text style={{ color: white, fontSize: 12, fontWeight: '500' }}>
                      {getCategorieLabel(sujet.categorie)}
                    </Text>
                  </View>
                  
                  <View style={{ 
                    backgroundColor: getDifficulteColor(sujet.difficulte),
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 12,
                    marginRight: 10,
                    marginBottom: 5,
                  }}>
                    <Text style={{ color: white, fontSize: 12, fontWeight: '500' }}>
                      {getDifficulteLabel(sujet.difficulte)}
                    </Text>
                  </View>
                </View>

                {/* Statistiques */}
                <View style={{ 
                  flexDirection: 'row', 
                  justifyContent: 'space-between',
                  marginBottom: 15,
                  padding: 10,
                  backgroundColor: '#F8F9FA',
                  borderRadius: 10,
                }}>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: dark }}>
                      {sujet.nombreDebats}
                    </Text>
                    <Text style={{ fontSize: 10, color: grey }}>Débats</Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: dark }}>
                      {sujet.debatsEnCours}
                    </Text>
                    <Text style={{ fontSize: 10, color: grey }}>En cours</Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: dark }}>
                      {sujet.noteMoyenne?.toFixed(1) || '0.0'}
                    </Text>
                    <Text style={{ fontSize: 10, color: grey }}>Note moy.</Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: dark }}>
                      {sujet.nombreVues}
                    </Text>
                    <Text style={{ fontSize: 10, color: grey }}>Vues</Text>
                  </View>
                </View>

                {/* Actions */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <TouchableOpacity 
                    onPress={() => openEditModal(sujet)}
                    style={{
                      flex: 1,
                      paddingVertical: 8,
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: blue,
                      borderRadius: 8,
                      marginRight: 5,
                    }}
                  >
                    <Text style={{ color: blue, fontWeight: '600' }}>Modifier</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    onPress={() => handleDeleteSujet(sujet)}
                    style={{
                      flex: 1,
                      paddingVertical: 8,
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: pink,
                      borderRadius: 8,
                      marginLeft: 5,
                    }}
                  >
                    <Text style={{ color: pink, fontWeight: '600' }}>Supprimer</Text>
                  </TouchableOpacity>
                </View>
              </InfoBox>
            </View>
          ))
        )}
      </ScrollView>

      {/* Modal de création/édition */}
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
                  {modalMode === 'create' ? 'Créer un sujet' : 'Modifier le sujet'}
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color={grey} />
                </TouchableOpacity>
              </View>

              {/* Formulaire */}
              <View style={{ marginBottom: 15 }}>
                <Text style={{ fontSize: 16, color: dark, marginBottom: 8, fontWeight: '600' }}>
                  Titre du sujet *
                </Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: '#E0E0E0',
                    borderRadius: 10,
                    padding: 15,
                    backgroundColor: '#F8F9FA',
                    fontSize: 14,
                  }}
                  placeholder="Ex: L'IA va-t-elle remplacer les humains?"
                  value={titre}
                  onChangeText={setTitre}
                  multiline
                  numberOfLines={2}
                />
              </View>

              <View style={{ marginBottom: 15 }}>
                <Text style={{ fontSize: 16, color: dark, marginBottom: 8, fontWeight: '600' }}>
                  Catégorie *
                </Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: '#E0E0E0',
                    borderRadius: 10,
                    padding: 15,
                    backgroundColor: '#F8F9FA',
                    fontSize: 14,
                  }}
                  placeholder="Ex: SCIENCE, SOCIETE, POLITIQUE..."
                  value={categorie}
                  onChangeText={setCategorie}
                />
              </View>

              <View style={{ marginBottom: 25 }}>
                <Text style={{ fontSize: 16, color: dark, marginBottom: 8, fontWeight: '600' }}>
                  Difficulté *
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {['DEBUTANT', 'INTERMEDIAIRE', 'EXPERT'].map((diff) => (
                    <TouchableOpacity
                      key={diff}
                      onPress={() => setDifficulte(diff)}
                      style={{
                        backgroundColor: difficulte === diff ? getDifficulteColor(diff) : '#F0F0F0',
                        paddingHorizontal: 15,
                        paddingVertical: 12,
                        borderRadius: 10,
                        marginRight: 10,
                        minWidth: 100,
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{
                        color: difficulte === diff ? white : dark,
                        fontWeight: '500',
                      }}>
                        {getDifficulteLabel(diff)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
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
                  onPress={modalMode === 'create' ? handleCreateSujet : handleUpdateSujet}
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
                    {modalMode === 'create' ? 'Créer' : 'Mettre à jour'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default AdminSubject;