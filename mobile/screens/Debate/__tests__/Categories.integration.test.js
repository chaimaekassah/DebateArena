import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Categories from '../Categories';
import api from '../../../services/api';
import { Alert } from 'react-native';

/* 🔹 Mocks */
jest.mock('../../../services/api', () => ({
  get: jest.fn(),
}));

jest.spyOn(Alert, 'alert');

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

const mockRoute = {
  params: { debateType: 'ENTRAINEMENT' },
};

describe('Categories - Tests d’intégration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /* ✅ 1. Chargement des catégories */
  it('charge et affiche les catégories depuis l’API', async () => {
    api.get.mockResolvedValueOnce({
      data: ['Science', 'Art'],
    });

    const { getByText } = render(
      <Categories navigation={mockNavigation} route={mockRoute} />,
    );

    await waitFor(() => {
      expect(getByText('Science')).toBeTruthy();
      expect(getByText('Art')).toBeTruthy();
    });
  });

  /* ✅ 2. Clic catégorie → sujets affichés */
  it('ouvre le modal avec les sujets filtrés', async () => {
    api.get.mockResolvedValueOnce({ data: ['Science'] }).mockResolvedValueOnce({
      data: [
        {
          id: 1,
          titre: 'Climat et société',
          accessible: true,
          difficulte: 'DEBUTANT',
        },
      ],
    });

    const { getByText } = render(
      <Categories navigation={mockNavigation} route={mockRoute} />,
    );

    await waitFor(() => getByText('Science'));
    fireEvent.press(getByText('Science'));

    await waitFor(() => {
      expect(getByText('Climat et société')).toBeTruthy();
    });
  });

  /* ✅ 3. Sujet verrouillé */
  it('affiche une alerte pour un sujet non accessible', async () => {
    api.get.mockResolvedValueOnce({ data: ['Science'] }).mockResolvedValueOnce({
      data: [
        {
          id: 2,
          titre: 'IA avancée',
          accessible: false,
          difficulte: 'AVANCE',
        },
      ],
    });

    const { getByText } = render(
      <Categories navigation={mockNavigation} route={mockRoute} />,
    );

    await waitFor(() => getByText('Science'));
    fireEvent.press(getByText('Science'));

    await waitFor(() => getByText('IA avancée'));
    fireEvent.press(getByText('IA avancée'));

    expect(Alert.alert).toHaveBeenCalled();
  });

  /* ✅ 4. Sujet accessible → navigation */
  it('navigue vers l’écran Subject si le sujet est accessible', async () => {
    api.get.mockResolvedValueOnce({ data: ['Science'] }).mockResolvedValueOnce({
      data: [
        {
          id: 3,
          titre: 'Science et éthique',
          accessible: true,
          difficulte: 'INTERMEDIAIRE',
        },
      ],
    });

    const { getByText } = render(
      <Categories navigation={mockNavigation} route={mockRoute} />,
    );

    await waitFor(() => getByText('Science'));
    fireEvent.press(getByText('Science'));

    await waitFor(() => getByText('Science et éthique'));
    fireEvent.press(getByText('Science et éthique'));

    expect(mockNavigation.navigate).toHaveBeenCalledWith(
      'Subject',
      expect.objectContaining({
        sujet: expect.any(Object),
        debateType: 'ENTRAINEMENT',
      }),
    );
  });
});
