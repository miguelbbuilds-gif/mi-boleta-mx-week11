import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
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

  it('muestra SIMULACIÓN cuando el servidor no devuelve JSON', async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('Failed to parse JSON response', { status: 200, headers: { 'Content-Type': 'text/plain' } })),
    );
    renderForm();
    await user.click(screen.getByRole('button', { name: 'Proponer campos' }));
    expect((await screen.findByTestId('interpret-result')).textContent).toMatch(/SIMULACIÓN/);
    expect(screen.getByTestId('sim-badge').textContent).toBe('SIMULACIÓN');
    expect(screen.getByTestId('interpret-result').textContent).toMatch(/PET/);
    expect(screen.getByTestId('interpret-result').textContent).not.toMatch(/Failed to parse/);
    expect(screen.queryByRole('alert')).toBeNull();
    const [, request] = vi.mocked(fetch).mock.calls[0] ?? [];
    const headers = new Headers((request as RequestInit | undefined)?.headers);
    expect(headers.get('Content-Type')).toBe('text/plain; charset=utf-8');
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});
