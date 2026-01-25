import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import StartDebate from '../StartDebate';

describe('StartDebate - Tests unitaires', () => {
  const navigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
  };

  const route = {
    params: {
      debatId: 1,
      type: 'TEST',
      status: 'EN_COURS',
      choixUtilisateur: 'POUR',
      duree: 300,
      sujet: {
        titre: 'L’IA va-t-elle remplacer les développeurs ?',
        categorie: 'Technologie',
        difficulte: 'INTERMEDIAIRE',
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('affiche le récapitulatif du débat', () => {
    const { getByText } = render(
      <StartDebate navigation={navigation} route={route} />,
    );

    expect(getByText('Récapitulatif')).toBeTruthy();
    expect(getByText(route.params.sujet.titre)).toBeTruthy();
    expect(getByText('Intermédiaire')).toBeTruthy();
    expect(getByText('POUR')).toBeTruthy();
    expect(getByText('Test évalué')).toBeTruthy();
  });

  it('affiche la durée formatée', () => {
    const { getByText } = render(
      <StartDebate navigation={navigation} route={route} />,
    );

    expect(getByText('5 minutes')).toBeTruthy();
  });

  it('affiche le statut EN_COURS', () => {
    const { getByText } = render(
      <StartDebate navigation={navigation} route={route} />,
    );

    expect(getByText('En cours')).toBeTruthy();
  });

  it('bouton retour appelle navigation.goBack()', () => {
    const { getByText } = render(
      <StartDebate navigation={navigation} route={route} />,
    );

    fireEvent.press(getByText('Changer de position'));

    expect(navigation.goBack).toHaveBeenCalled();
  });

  it('redirige vers Home si les données sont manquantes', async () => {
    const navigation = { navigate: jest.fn() };

    render(<StartDebate navigation={navigation} route={{ params: {} }} />);

    await waitFor(() => {
      expect(navigation.navigate).toHaveBeenCalledWith('Home');
    });
  });
});
