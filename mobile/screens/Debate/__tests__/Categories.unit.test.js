import React from 'react';
import { render } from '@testing-library/react-native';
import Categories from '../Categories';
import api from '../../../services/api';

/* 🔹 Mock API (aucun appel réel) */
jest.mock('../../../services/api', () => ({
  get: jest.fn(),
}));

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

const mockRoute = {
  params: { debateType: 'ENTRAINEMENT' },
};

describe('Categories - Tests unitaires', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /* ✅ 1. Rendu du titre */
  it('affiche le titre Catégories', () => {
    api.get.mockResolvedValueOnce({ data: [] });

    const { getByText } = render(
      <Categories navigation={mockNavigation} route={mockRoute} />,
    );

    expect(getByText('Catégories')).toBeTruthy();
  });

  /* ✅ 2. Texte selon le type de débat */
  it('affiche le texte entraînement', () => {
    api.get.mockResolvedValueOnce({ data: [] });

    const { getByText } = render(
      <Categories navigation={mockNavigation} route={mockRoute} />,
    );

    expect(
      getByText('Sélectionnez un domaine pour votre entraînement'),
    ).toBeTruthy();
  });

  /* ✅ 3. Loader visible */
  it('affiche le loader au chargement', () => {
    api.get.mockResolvedValueOnce({ data: [] });

    const { getByText } = render(
      <Categories navigation={mockNavigation} route={mockRoute} />,
    );

    expect(getByText('Chargement des catégories...')).toBeTruthy();
  });

  /* ✅ 4. Bouton retour présent */
  it('affiche le bouton Retour', () => {
    api.get.mockResolvedValueOnce({ data: [] });

    const { getByText } = render(
      <Categories navigation={mockNavigation} route={mockRoute} />,
    );

    expect(getByText('Retour')).toBeTruthy();
  });
});
