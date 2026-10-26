import { mkdirSync, writeFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

test('escritorio muestra la barra lateral', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/resumen');
  await expect(page.getByTestId('sidebar')).toBeVisible();
  await expect(page.getByTestId('demo-badge').first()).toBeVisible();
});

test('el menú móvil abre el modelo', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/resumen');
  await expect(page.getByTestId('sidebar')).toBeHidden();
  await page.getByTestId('nav-toggle').click();
  await page.getByRole('navigation', { name: 'Principal' }).getByRole('link', { name: 'Modelo de negocio' }).click();
  await expect(page.getByRole('heading', { name: 'Quién paga la transparencia' })).toBeVisible();
});

test('Don Ernesto ve kilos, precio y total sin entregar RFC', async ({ page }) => {
  const notes: string[] = [];
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Cada kilo cuenta. Cada peso también.' })).toBeVisible();
  await page.getByTestId('explorar-demo').click();
  await expect(page.getByRole('heading', { name: 'Lo que ya quedó escrito' })).toBeVisible();
  notes.push('El resumen abre en el teléfono y muestra el distintivo DEMO.');

  await page.getByTestId('nueva-boleta').click();
  await page.getByRole('button', { name: 'Llenar ejemplo de Don Ernesto' }).click();
  const total = page.getByTestId('total-preview');
  await expect(total).toContainText('12.5 kg');
  await expect(total).toContainText('106.25');
  notes.push('El ejemplo deja PET, 12.5 kg y el total $106.25 en el mismo formulario, antes de los campos opcionales.');
  await expect(page.getByRole('textbox', { name: /RFC/i })).toHaveCount(0);
  await expect(page.getByLabel(/cuenta bancaria/i)).toHaveCount(0);
  notes.push('No hay campos de RFC ni de cuenta bancaria.');

  await page.getByTestId('guardar-boleta').click();
  await expect(page.getByRole('status')).toContainText('guardada');
  await expect(page.getByTestId('imprimir-boleta')).toBeVisible();
  await expect(page.getByTestId('copiar-boleta')).toBeVisible();
  notes.push('Al guardar aparecen imprimir en papel y copiar texto. La pantalla no envía WhatsApp.');

  await page.goto('/aclaraciones');
  await page.getByLabel('Descripción').fill('El peso de PET no coincide con lo que se entregó.');
  await page.getByTestId('abrir-aclaracion').click();
  await expect(page.getByRole('status')).toContainText('no cambió');
  notes.push('La aclaración confirma que la boleta original no cambió.');

  await page.goto('/precios');
  await expect(page.getByRole('heading', { name: /Referencia interna/ })).toBeVisible();
  notes.push('Precios se anuncia como referencia interna, no como mercado verificado.');

  await page.goto('/modelo');
  const before = (await page.getByTestId('break-even').innerText()).replace(/\s+/g, ' ');
  await page.getByLabel('Cuota supuesta del patrocinador por patio al mes').fill('0');
  await expect(page.getByTestId('sponsor-revenue')).toContainText('$0.00');
  await expect(page.getByTestId('material-value')).toContainText('300,960.00');
  const after = (await page.getByTestId('break-even').innerText()).replace(/\s+/g, ' ');
  notes.push(`El equilibrio del escenario base decía «${before}». Con cuota 0 pasó a «${after}». El valor del material no se volvió cero.`);

  mkdirSync('docs', { recursive: true });
  writeFileSync(
    'docs/persona-run.json',
    JSON.stringify({ executedAt: new Date().toISOString(), viewport: '390x844', persona: 'Don Ernesto', notes, before, after }, null, 2),
  );
});
