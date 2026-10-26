# Plan de pruebas

Cada caso de abajo tiene una prueba automática, salvo la navegación, que está en Playwright.

| # | Caso | Dónde |
| --- | --- | --- |
| 1 | Total de la boleta: 12.5 kg × 8.50 = 106.25 MXN | `src/lib/money.test.ts` |
| 2 | Redondeo al centavo, mitad hacia arriba, y producto que no debe arrastrar error binario | `src/lib/money.test.ts` |
| 3 | Rechazo de peso cero | `src/lib/validation.test.ts` y formulario |
| 4 | Rechazo de precio negativo | `src/lib/validation.test.ts` |
| 5 | Rechazo de fecha imposible, fecha futura, RFC y texto demasiado largo | `src/lib/validation.test.ts` |
| 6 | Crear boleta y folio | `src/lib/receipts.test.ts` y `src/pages/NuevaBoleta.test.tsx` |
| 7 | Filtrar por material y declarar cuántas boletas oculta el filtro | `src/lib/receipts.test.ts` |
| 8 | Abrir aclaración | `src/lib/disputes.test.ts` |
| 9 | La boleta original no cambia al abrir ni al resolver | `src/lib/disputes.test.ts` |
| 10 | Ingreso del patrocinador en el escenario base | `src/lib/model.test.ts` |
| 11 | Costo operativo del escenario base | `src/lib/model.test.ts` |
| 12 | Equilibrio en 3 patios y signo del margen antes y en ese punto | `src/lib/model.test.ts` |
| 13 | Cuota cero: ingreso de plataforma cero, valor del material distinto de cero, sin equilibrio | `src/lib/model.test.ts` |
| 14 | Los tres escenarios no comparten la cuota | `src/lib/model.test.ts` y `src/lib/storage.test.ts` |
| 15 | Restaurar demo | `src/lib/storage.test.ts` |
| 16 | CSV con folio y aviso de archivo no certificado | `src/lib/storage.test.ts` |
| 17 | Borrar el archivo local | `src/lib/storage.test.ts` |
| 18 | No hay puntaje de personas | `src/lib/safeguards.test.ts` |
| 19 | El código de `src` no llama geolocalización | `src/lib/safeguards.test.ts` |
| 20 | Barra lateral en escritorio y menú en 390 px | `e2e/persona.spec.ts` |

Además, el recorrido de Don Ernesto en Playwright cubre demo, ejemplo de boleta, ausencia de RFC, impresión y copia, aclaración, precios y el cambio de la cuota a cero.

Comandos previstos:

- `npm run typecheck`
- `npm run build`
- `npx vitest run`
- `npx playwright test`

Los resultados ejecutados están en `TEST_RESULTS.md`. No se debe leer este plan como si sustituyera esa bitácora.
