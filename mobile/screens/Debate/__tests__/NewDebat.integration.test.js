import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import NewDebate from '..//NewDebate';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../../services/api';

jest.mock('@react-native-async-storage/async-storage');
jest.mock('../../../services/api');

describe('NewDebate - Test d’intégration', () => {
  const navigation = {
    navigate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.getItem.mockResolvedValue('token123');
  });

  it('navigue vers Categories avec type TEST', async () => {
    AsyncStorage.getItem.mockResolvedValue('token123');

    const { getByText } = render(<NewDebate navigation={navigation} />);

    fireEvent.press(getByText('Test'));

    await waitFor(() => {
      expect(navigation.navigate).toHaveBeenCalledWith('Categories', {
        debateType: 'TEST',
      });
    });

    expect(api.post).not.toHaveBeenCalled();
  });
});
