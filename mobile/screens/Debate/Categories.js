import React, { useState, useEffect } from "react";
import { 
  ScrollView, 
  View, 
  ActivityIndicator, 
  Alert,
  Modal,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import api from "../../services/api";

import {
  BackgroundContainer,
  InnerContainer,
  WhiteButton,
  ButtonText,
  Colors,
  Label,
  Choice,
  Shadow,
  StyledButton
} from "../../components/styles";

const { dark, yellow, blue, lightPink, pink, white, grey, brand, green } = Colors;

const Categories = ({ navigation, route }) => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showSubjectsModal, setShowSubjectsModal] = useState(false);
  const [categorySubjects, setCategorySubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const { debateType } = route.params || {};

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      
      // 1. Charger toutes les catégories disponibles depuis l'API
      const categoriesResponse = await api.get('/sujets/categories');
      const apiCategories = categoriesResponse.data || [];
      
      console.log("Catégories API:", apiCategories);
      
      // 2. Organiser les catégories avec icônes et couleurs (utilisant VOS couleurs)
      const organizedCategories = apiCategories.map((catName, index) => {
        // Icônes par catégorie
        const iconMap = {
          'ART': 'color-palette',
          'SCIENCE': 'flask',
          'POLITIQUE': 'megaphone',
          'CULTURE': 'book',
          'INFORMATIQUE': 'code',
          'TECHNOLOGIE': 'hardware-chip',
          'SANTE': 'medkit',
          'ENVIRONNEMENT': 'leaf',
          'ECONOMIE': 'cash',
          'HISTOIRE': 'time',
          'MUSIQUE': 'musical-notes',
          'SPORT': 'fitness',
          'PHILOSOPHIE': 'bulb',
          'EDUCATION': 'school',
          'DROIT': 'scale',
          'SOCIETE': 'people',
          'SCIENCES': 'flask',
          'TECHNOLOGIES': 'hardware-chip'
        };
        
        // Utilisation de VOS couleurs existantes en version opaque
        const colors = [
          lightPink,  // C8ADC0 - rose clair
          blue,       // 6DB1BF - bleu
          yellow,     // FFC482 - jaune
          pink,       // DB7F8E - rose
          green,      // 4CAF50 - vert
          lightPink,  // rotation
          blue,
          yellow
        ];
        
        const color = colors[index % colors.length];
        
        const upperCat = catName.toUpperCase();
        const iconName = iconMap[upperCat] || 'help-circle';
        
        return {
          id: index + 1,
          name: catName,
          value: upperCat,
          icon: iconName,
          color: color,
        };
      });
      
      setCategories(organizedCategories);
      
    } catch (error) {
      console.log("Erreur chargement catégories:", error);
      
      // Si erreur 404 ou autre, utiliser des catégories par défaut avec VOS couleurs
      const defaultCategories = [
        { id: 1, name: "Science", value: "SCIENCE", icon: "flask", color: blue },
        { id: 2, name: "Politique", value: "POLITIQUE", icon: "megaphone", color: lightPink },
        { id: 3, name: "Technologie", value: "TECHNOLOGIE", icon: "hardware-chip", color: yellow },
        { id: 4, name: "Culture", value: "CULTURE", icon: "book", color: pink },
        { id: 5, name: "Économie", value: "ECONOMIE", icon: "cash", color: green },
        { id: 6, name: "Santé", value: "SANTE", icon: "medkit", color: lightPink },
        { id: 7, name: "Environnement", value: "ENVIRONNEMENT", icon: "leaf", color: blue },
        { id: 8, name: "Éducation", value: "EDUCATION", icon: "school", color: yellow },
      ];
      
      setCategories(defaultCategories);
      
      Alert.alert(
        "Mode démonstration",
        "Utilisation de catégories par défaut.",
        [{ text: "OK" }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryPress = async (category) => {
    try {
      setSelectedCategory(category);
      setLoadingSubjects(true);
      
      // Charger les sujets de cette catégorie depuis l'API avec filtrage
      const response = await api.get('/sujets/filtrer', {
        params: {
          categorie: category.value
        }
      });
      
      const sujets = response.data || [];
      console.log(`Sujets filtrés pour ${category.name}:`, sujets);
      
      if (sujets.length === 0) {
        Alert.alert(
          "Aucun sujet disponible",
          `Aucun sujet n'est disponible pour la catégorie "${category.name}".`,
          [{ text: "OK" }]
        );
      } else {
        setCategorySubjects(sujets);
        setShowSubjectsModal(true);
      }
    } catch (error) {
      console.log("Erreur chargement sujets filtrés:", error);
      
      let errorMessage = `Impossible de charger les sujets pour "${category.name}".`;
      
      if (error.response?.status === 400) {
        errorMessage = "Paramètres de filtrage invalides.";
      } else if (error.response?.status === 404) {
        errorMessage = "Aucun sujet trouvé pour cette catégorie.";
      }
      
      Alert.alert("Erreur", errorMessage);
    } finally {
      setLoadingSubjects(false);
    }
  };

  const handleSubjectSelect = (sujet) => {
    // Log pour déboguer l'accessibilité
    console.log("Sujet sélectionné:", {
      id: sujet.id,
      titre: sujet.titre,
      accessible: sujet.accessible,
      difficulte: sujet.difficulte
    });
    
    if (!sujet.accessible) {
      Alert.alert(
        "Sujet non accessible",
        `Ce sujet de niveau "${sujet.difficulte || 'avancé'}" n'est pas accessible avec votre niveau actuel.`,
        [{ text: "OK" }]
      );
      return;
    }
    
    setShowSubjectsModal(false);
    
    // Naviguer vers la page Subject avec le sujet sélectionné
    navigation.navigate("Subject", {
      sujet: sujet,
      debateType: debateType || "ENTRAINEMENT"
    });
  };

  const renderSubjectItem = ({ item }) => {
    const isAccessible = item.accessible;
    
    return (
      <TouchableOpacity 
        style={[
          styles.subjectItem,
          { 
            backgroundColor: isAccessible ? white : '#f5f5f5',
            borderLeftWidth: 4,
            borderLeftColor: isAccessible ? 
              (item.difficulte === 'DEBUTANT' ? green : 
               item.difficulte === 'INTERMEDIAIRE' ? yellow : 
               item.difficulte === 'AVANCE' ? pink : brand) : grey,
            opacity: isAccessible ? 1 : 0.6
          }
        ]}
        onPress={() => handleSubjectSelect(item)}
        disabled={!isAccessible}
      >
        <View style={styles.subjectContent}>
          <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 8}}>
            <Text style={[
              styles.subjectTitle,
              { 
                color: isAccessible ? dark : grey,
                flex: 1
              }
            ]}>
              {item.titre}
            </Text>
            
            {!isAccessible && (
              <Ionicons name="lock-closed" size={16} color={grey} style={{marginLeft: 10}} />
            )}
          </View>
          
          <View style={styles.subjectMeta}>
            <View style={[
              styles.difficultyBadge,
              { 
                backgroundColor: isAccessible ? 
                  (item.difficulte === 'DEBUTANT' ? `${green}20` : 
                   item.difficulte === 'INTERMEDIAIRE' ? `${yellow}20` : 
                   item.difficulte === 'AVANCE' ? `${pink}20` : `${brand}20`) : 
                  '#f0f0f0'
              }
            ]}>
              <Ionicons 
                name={item.difficulte === 'DEBUTANT' ? 'star-outline' : 
                      item.difficulte === 'INTERMEDIAIRE' ? 'star-half' : 
                      'star'} 
                size={12} 
                color={isAccessible ? 
                  (item.difficulte === 'DEBUTANT' ? green : 
                   item.difficulte === 'INTERMEDIAIRE' ? dark : 
                   item.difficulte === 'AVANCE' ? pink : brand) : 
                  grey} 
              />
              <Text style={[
                styles.difficultyText,
                { 
                  color: isAccessible ? 
                    (item.difficulte === 'DEBUTANT' ? green : 
                     item.difficulte === 'INTERMEDIAIRE' ? dark : 
                     item.difficulte === 'AVANCE' ? pink : brand) : 
                    grey,
                  marginLeft: 4
                }
              ]}>
                {item.difficulte || 'N/A'}
              </Text>
            </View>
            
            <Text style={[
              styles.lockedText,
              { color: isAccessible ? green : grey }
            ]}>
              {isAccessible ? 
                <><Ionicons name="checkmark-circle" size={12} /> Accessible</> :
                <><Ionicons name="lock-closed" size={12} /> Verrouillé</>
              }
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <BackgroundContainer
      source={require("../../assets/img/fond.png")}
      resizeMode="cover"
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <InnerContainer style={styles.container}>
          <Label style={styles.title}>
            Catégories
          </Label>
          
          <Label style={styles.subtitle}>
            {debateType === "TEST" ? 
              "Sélectionnez un domaine pour votre test" : 
              "Sélectionnez un domaine pour votre entraînement"}
          </Label>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={white} />
              <Label style={styles.loadingText}>
                Chargement des catégories...
              </Label>
            </View>
          ) : categories.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="folder-open" size={60} color={white} />
              <Label style={styles.emptyText}>
                Aucune catégorie disponible
              </Label>
              <StyledButton 
                style={styles.retryButton}
                onPress={loadCategories}
              >
                <ButtonText style={styles.retryButtonText}>
                  <Ionicons name="refresh" size={16} />
                  {' '}Réessayer
                </ButtonText>
              </StyledButton>
            </View>
          ) : (
            <>
              {/* Grille de catégories - 2 colonnes */}
              <View style={styles.grid}>
                {categories.map((category) => (
                  <View 
                    key={category.id} 
                    style={styles.categoryWrapper}
                  >
                    <Choice 
                      style={[
                        styles.categoryButton,
                        {
                          backgroundColor: category.color,
                          opacity: 1,
                        }
                      ]}
                      onPress={() => handleCategoryPress(category)}
                      disabled={loadingSubjects}
                    >
                      <View style={styles.categoryContent}>
                        <View style={styles.iconContainer}>
                          <Ionicons 
                            name={category.icon} 
                            size={30} 
                            color={dark} 
                          />
                        </View>
                        <Label style={[
                          styles.categoryName,
                          {
                            color: dark,
                          }
                        ]}>
                          {category.name}
                        </Label>
                      </View>
                    </Choice>
                  </View>
                ))}
              </View>

              {/* Information */}
              <View style={styles.infoBox}>
                <Label style={styles.infoText}>
                  ℹ️ Cliquez sur une catégorie pour voir les sujets disponibles
                </Label>
              </View>
            </>
          )}

          {/* Bouton retour */}
          <WhiteButton 
            onPress={() => navigation.goBack()}
            disabled={isLoading || loadingSubjects}
            style={styles.backButton}
          >
            <ButtonText style={styles.backButtonText}>
              <Ionicons name="arrow-back" size={18} />
              {' '}Retour
            </ButtonText>
          </WhiteButton>
        </InnerContainer>
      </ScrollView>

      {/* Modal pour afficher les sujets d'une catégorie */}
      <Modal
        visible={showSubjectsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSubjectsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Shadow style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Sujets - {selectedCategory?.name}
              </Text>
              <TouchableOpacity 
                onPress={() => setShowSubjectsModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={dark} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalSubtitle}>
              <Text style={styles.modalSubtitleText}>
                {categorySubjects.length} sujet{categorySubjects.length !== 1 ? 's' : ''} disponible{categorySubjects.length !== 1 ? 's' : ''}
              </Text>
            </View>
            
            {loadingSubjects ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="large" color={brand} />
                <Text style={styles.modalLoadingText}>
                  Chargement des sujets...
                </Text>
              </View>
            ) : categorySubjects.length > 0 ? (
              <FlatList
                data={categorySubjects}
                renderItem={renderSubjectItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.subjectsList}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View style={styles.noSubjects}>
                <Ionicons name="document-text" size={50} color={grey} />
                <Text style={styles.noSubjectsText}>
                  Aucun sujet disponible dans cette catégorie
                </Text>
              </View>
            )}
            
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.modalCloseBtn}
                onPress={() => setShowSubjectsModal(false)}
              >
                <Text style={styles.modalCloseBtnText}>
                  Retour aux catégories
                </Text>
              </TouchableOpacity>
            </View>
          </Shadow>
        </View>
      </Modal>
    </BackgroundContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 30,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    marginBottom: 10,
    color: white,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    color: lightPink,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  loadingText: {
    marginTop: 15,
    color: white,
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: white,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  retryButton: {
    backgroundColor: brand,
    paddingHorizontal: 30,
  },
  retryButtonText: {
    color: white,
    fontSize: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  categoryWrapper: {
    width: '48%',
    marginBottom: 15,
  },
  categoryButton: {
    height: 150,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    padding: 10,
    opacity: 1,
  },
  categoryContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    backgroundColor: white,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    width: '100%',
  },
  infoText: {
    fontSize: 12,
    color: white,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  backButton: {
    width: '100%',
    borderRadius: 10,
    paddingVertical: 15,
  },
  backButtonText: {
    fontSize: 16,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: white,
    borderRadius: 20,
    width: '100%',
    maxHeight: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: dark,
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
  modalSubtitle: {
    marginBottom: 20,
  },
  modalSubtitleText: {
    fontSize: 14,
    color: grey,
    textAlign: 'center',
  },
  modalLoading: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  modalLoadingText: {
    marginTop: 15,
    color: grey,
    textAlign: 'center',
  },
  subjectsList: {
    paddingBottom: 10,
  },
  subjectItem: {
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  subjectContent: {
    flex: 1,
  },
  subjectTitle: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  subjectMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  difficultyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  lockedText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  noSubjects: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  noSubjectsText: {
    fontSize: 16,
    color: grey,
    textAlign: 'center',
    marginTop: 15,
  },
  modalFooter: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  modalCloseBtn: {
    backgroundColor: brand,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalCloseBtnText: {
    color: white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Categories;