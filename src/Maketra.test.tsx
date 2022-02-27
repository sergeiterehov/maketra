import React from 'react';
import { render, screen } from '@testing-library/react';
import Maketra from './Maketra';

test('renders learn react link', () => {
  render(<Maketra />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
