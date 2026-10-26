import { describe, expect, it } from 'vitest';
import { interpretReceipt, usableApiKey } from '../../shared/interpret.mjs';
import { acceptInterpretation } from './interpret.ts';

const sample = 'Material: PET\nPeso: 12.5 kg\nPrecio: 8.50 por kilo\nAlias: Don Ernesto';

describe('interpretación', () => {
  it('sin clave válida responde simulación y no consulta la red', async () => {
    expect(usableApiKey('')).toBe('');
    expect(usableApiKey('sk-example-placeholder-key-123456')).toBe('');
    let called = false;
    const result = await interpretReceipt(sample, {
      apiKey: 'changeme',
      fetchImpl: async () => {
        called = true;
        return new Response('no');
      },
    });
    expect(called).toBe(false);
    expect(result.mode).toBe('simulacion');
    expect(result.disclaimer).toMatch(/SIMULACIÓN/);
    expect(result.suggestions.weightKg).toBe('12.5');
    expect(result.suggestions.pricePerKg).toBe('8.50');
    expect(result.suggestions).not.toHaveProperty('total');
  });

  it('si el modelo responde algo que no es JSON, vuelve a simulación', async () => {
    const result = await interpretReceipt(sample, {
      apiKey: 'sk-live-abcdefghijklmnopqrstuvwxyz',
      fetchImpl: async () => new Response('<html>Failed to parse JSON response</html>', { status: 200 }),
    });
    expect(result.mode).toBe('simulacion');
    expect(result.fallback).toBe(true);
    expect(result.disclaimer).toMatch(/SIMULACIÓN/);
    expect(result.suggestions.material).toBe('PET');
  });

  it('un texto de error del servidor no se muestra como resultado', () => {
    const accepted = acceptInterpretation('Failed to parse JSON response', sample);
    expect(accepted.mode).toBe('simulacion');
    expect(accepted.disclaimer).toMatch(/SIMULACIÓN/);
    expect(accepted.suggestions.material).toBe('PET');
    expect(accepted.disclaimer).not.toMatch(/Failed to parse/);
  });
});
