import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { App } from '../src/App';

describe('App', () => {
  it('renders the header with Sage title', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { name: 'Sage' })).toBeInTheDocument();
  });

  it('renders the welcome message on home page', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    expect(screen.getByText('Welcome to Sage')).toBeInTheDocument();
  });

  it('renders the get started card', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    expect(screen.getByText('Get Started')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g., Machine Learning basics')).toBeInTheDocument();
  });
});
