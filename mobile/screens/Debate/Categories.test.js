import React from 'react';
import { render } from '@testing-library/react-native';
import Categories from './Categories';

describe('Categories Screen', () => {
  it('affiche le titre et les catégories', () => {
    const { getByText } = render(<Categories />);

    expect(getByText('Choisissez une catégorie')).toBeTruthy();
    expect(getByText('Art')).toBeTruthy();
    expect(getByText('Informatique')).toBeTruthy();
    expect(getByText('Musique')).toBeTruthy();
  });
});
