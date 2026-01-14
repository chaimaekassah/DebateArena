import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Chat from '../../Debate/Chat';

jest.useFakeTimers();

// test for Chat screen

describe('Chat Screen', () => {
  it("permet d'envoyer un message et affiche la réponse IA", async () => {
    const { getByPlaceholderText, getByText, getByTestId } = render(<Chat />);

    const input = getByPlaceholderText('Tapez ici');

    fireEvent.changeText(input, 'Bonjour');
    fireEvent.press(getByTestId('send-button'));

    expect(getByText('Bonjour')).toBeTruthy();

    // Avancer le timer de l’IA
    jest.advanceTimersByTime(1200);

    await waitFor(() => {
      expect(getByText('🤖 Réponse simulée de l’IA.')).toBeTruthy();
    });
  });
});
