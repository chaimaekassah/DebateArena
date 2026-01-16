import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Chat from '../../Debate/Chat';

jest.useFakeTimers();

describe('Chat Screen - Integration', () => {
  it('envoie un message et affiche la réponse IA', async () => {
    const { getByPlaceholderText, getByTestId, getByText } = render(<Chat />);

    fireEvent.changeText(getByPlaceholderText('Tapez ici'), 'Bonjour');

    fireEvent.press(getByTestId('send-button'));

    expect(getByText('Bonjour')).toBeTruthy();

    // Avancer le timer (réponse IA simulée)
    jest.advanceTimersByTime(1200);

    await waitFor(() => {
      expect(getByText('🤖 Réponse simulée de l’IA.')).toBeTruthy();
    });
  });
});
