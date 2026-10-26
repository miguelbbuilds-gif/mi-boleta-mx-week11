# Resultados de pruebas

Equipo: Windows, Node v24.19.0, npm 11.17.0. Fecha de la corrida principal: 25 de octubre de 2026, noche local.

## TypeScript

Comando: `npx tsc -b --pretty false`

Resultado: terminó con código 0, sin errores, después de corregir tipos del extractor, el nombre de la mediana y un estrechamiento en la pantalla de aclaración.

## Producción

Comando: `npm run build`

Resultado: código 0. Vite 8.3.5 generó `dist/index.html`, CSS de 26.59 kB (gzip 5.95 kB) y un JS de 750.44 kB (gzip 222.99 kB). Vite avisó que el paquete supera 500 kB. No es un fallo de compilación. Quedó anotado en `LIMITATIONS.md`.

## Unidad y componente

Comando: `npx vitest run`

Resultado, corrido dos veces en la misma sesión, ambas con código 0:

```
Test Files  8 passed (8)
Tests       25 passed (25)
```

La segunda corrida tardó 5.20 s. Cubre los casos 1 a 19 del plan.

## Navegador

Se instaló Chromium de Playwright (Chrome for Testing 156.0.8078.4) y se sirvió el build con `npm run preview` en `http://127.0.0.1:4173`.

Primera corrida de `npx playwright test`: 2 pasaron y 1 falló. El fallo no fue del cálculo. La prueba pedía que el valor del material no contuviera el texto `0.00`. El valor correcto del escenario base es `$300,960.00`, que sí contiene esos caracteres. Ingreso del patrocinador en cero y el resto del recorrido ya habían pasado.

Se cambió la afirmación para exigir `$300,960.00` en el valor del material y `$0.00` en el ingreso del patrocinador.

Segunda corrida: código 0.

```
ok  escritorio muestra la barra lateral
ok  el menú móvil abre el modelo
ok  Don Ernesto ve kilos, precio y total sin entregar RFC
3 passed
```

La tercera prueba escribió `docs/persona-run.json`.

## Corrida del 25 de octubre de 2026, después de corregir `/api/interpret`

Misma máquina. `npx tsc -b --pretty false` terminó con código 0.

`npm run build` terminó con código 0. Vite 8.3.5 escribió `dist/index.html` (0.99 kB, gzip 0.53 kB), CSS de 24.95 kB (gzip 5.73 kB) y JS de 751.14 kB (gzip 223.20 kB). El aviso de paquete mayor a 500 kB se repitió. La compilación no falló.

`npx vitest run` terminó con código 0 en 4.17 s:

```
Test Files  9 passed (9)
Tests       29 passed (29)
```

Las cuatro pruebas nuevas cubren una clave ausente o de ejemplo, una respuesta del modelo que no es JSON, el texto `Failed to parse JSON response` y el formulario cuando `/api/interpret` devuelve ese texto.

`npx playwright test` terminó con código 0 en 8.9 s, contra el preview del build nuevo en `http://127.0.0.1:4173`:

```
ok  las páginas abren y la interpretación queda en simulación
ok  escritorio muestra la barra lateral
ok  el menú móvil abre el modelo
ok  Don Ernesto ve kilos, precio y total sin entregar RFC
4 passed
```

La primera recorrió inicio, resumen, nueva boleta, archivo, precios, modelo, aclaraciones, evidencia, métricas, datos y condiciones. En nueva boleta, Proponer campos dejó el distintivo SIMULACIÓN, el peso 12.5 y ningún error de página. La prueba de Don Ernesto volvió a escribir `docs/persona-run.json`.

Después de cambiar el envío a `text/plain`, `npx vitest run` volvió a terminar con código 0: 9 archivos y 29 pruebas, en 5.36 s. La prueba del formulario comprueba que la petición no usa `Content-Type: application/json`. `npm run build` también terminó con código 0; el JS quedó en 751.15 kB (gzip 223.20 kB), con el mismo aviso de tamaño. `npx playwright test` volvió a terminar con código 0 en 8.7 s: las mismas 4 pruebas, incluida la de simulación.

## Lo que no se afirma

No se corrió una suite en otro sistema operativo. No se hizo una prueba de carga. No se llamó a un modelo de lenguaje real: no hay `AI_API_KEY` en este entorno, y el distintivo de la pantalla es SIMULACIÓN.
