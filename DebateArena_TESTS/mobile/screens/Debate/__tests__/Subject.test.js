import React from 'react';
import { render } from '@testing-library/react-native';
import Subject from '../Subject';

describe('Subject Screen', () => {
  it('affiche le sujet et les choix', () => {
    const { getByText } = render(<Subject />);

    expect(getByText(/Sujet/)).toBeTruthy();
    expect(getByText('Pour')).toBeTruthy();
    expect(getByText('Contre')).toBeTruthy();
  });
});
