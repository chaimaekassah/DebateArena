import React from 'react';
import { render } from '@testing-library/react-native';
import StartDebate from '../../Debate/StartDebate';

describe('StartDebate Screen', () => {
  it('affiche le bouton commencer', () => {
    const { getByText } = render(<StartDebate />);

    expect(getByText('COMMENCER')).toBeTruthy();
    expect(getByText(/Vous avez choisi/i)).toBeTruthy();
  });
});
