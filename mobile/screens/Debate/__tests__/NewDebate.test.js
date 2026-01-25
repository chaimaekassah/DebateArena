import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import NewDebate from '../NewDebate';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../../services/api';
import { Alert } from 'react-native';

jest.mock('@react-native-async-storage/async-storage');
jest.mock('../../../services/api');

describe('NewDebate - Tests unitaires', () => {
  const navigation = {
    navigate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redirige vers Login si aucun token', async () => {
    AsyncStorage.getItem.mockResolvedValue(null);

    render(<NewDebate navigation={navigation} />);

    await waitFor(() => {
      expect(navigation.navigate).toHaveBeenCalledWith('Login');
    });
  });

  it('ne redirige pas si le token existe', async () => {
    AsyncStorage.getItem.mockResolvedValue('token123');

    render(<NewDebate navigation={navigation} />);

    await waitFor(() => {
      expect(navigation.navigate).not.toHaveBeenCalledWith('Login');
    });
  });

  it('navigue vers Categories avec type ENTRAINEMENT', async () => {
    AsyncStorage.getItem.mockResolvedValue('token123');

    const { getByText } = render(<NewDebate navigation={navigation} />);

    fireEvent.press(getByText('Entraînement'));

    expect(navigation.navigate).toHaveBeenCalledWith('Categories', {
      debateType: 'ENTRAINEMENT',
    });
  });
});
