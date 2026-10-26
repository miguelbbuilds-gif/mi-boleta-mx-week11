import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AppStateProvider } from '../context/AppState.tsx';
import { NuevaBoleta } from '../pages/NuevaBoleta.tsx';

function renderForm() {
  return render(
    <MemoryRouter>
      <AppStateProvider>
        <NuevaBoleta />
      </AppStateProvider>
    </MemoryRouter>,
  );
}

describe('formulario de boleta', () => {
  it('muestra el total y rechaza el peso en cero', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.type(screen.getByLabelText('Peso en kilogramos'), '12.5');
    await user.type(screen.getByLabelText('Precio por kilogramo (MXN)'), '8.50');
    expect(screen.getByTestId('total-preview').textContent).toContain('106.25');
    await user.clear(screen.getByLabelText('Peso en kilogramos'));
    await user.type(screen.getByLabelText('Peso en kilogramos'), '0');
    await user.click(screen.getByRole('button', { name: 'Guardar boleta' }));
    expect((await screen.findByRole('alert')).textContent).toMatch(/mayor que cero/i);
  });
});
