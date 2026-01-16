import React from 'react';
import { render } from '@testing-library/react-native';
import NewDebate from '../../Debate/NewDebate';

describe('NewDebate Screen', () => {
  it('affiche les options de débat', () => {
    const { getByText } = render(<NewDebate />);

    expect(getByText('Commencer un débat ?')).toBeTruthy();
    expect(getByText('Entraînement')).toBeTruthy();
    expect(getByText('Test')).toBeTruthy();
  });
});
