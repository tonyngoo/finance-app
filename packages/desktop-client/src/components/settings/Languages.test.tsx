import type { ReactElement } from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import '@testing-library/jest-dom';
import { AuthProvider } from '../../auth/AuthProvider';
import { TestProvider } from '../../redux/mock';
import { ResponsiveProvider } from '../responsive/ResponsiveProvider';
import { SidebarProvider } from '../sidebar/SidebarProvider';

import { LanguageSettings } from './Languages';

function renderWithProviders(ui: ReactElement) {
  return render(
    <TestProvider>
      <AuthProvider>
        <ResponsiveProvider>
          <SidebarProvider>{ui}</SidebarProvider>
        </ResponsiveProvider>
      </AuthProvider>
    </TestProvider>,
  );
}

describe('Settings.Languages', () => {
  beforeEach(() => {
    renderWithProviders(<LanguageSettings />);
  });

  test('Language state gets updated when changed to french', async () => {
    const select = screen.getByRole('button');

    expect(select).toBeInTheDocument();
    fireEvent.change(select, { target: { value: 'fr' } });

    expect(select).toHaveValue('fr');
  });

  test('Language has system default selected by default', async () => {
    const select = screen.getByRole('button');

    expect(select).toBeInTheDocument();
    const textElement = screen.getByText('System default');
    expect(textElement).toBeInTheDocument();
  });
});
