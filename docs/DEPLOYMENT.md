# Despliegue

## Local

```bash
npm install
npm run dev
```

El servidor de desarrollo abre Vite. La demo no pide cuenta ni clave.

Producción local:

```bash
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```

Esa URL, `http://127.0.0.1:4173`, es la que usaron las pruebas de navegador. No es una URL pública.

## Vercel

El proyecto incluye `vercel.json` para que las rutas de la aplicación vuelvan a `index.html` y `/api/interpret` siga siendo la función. El nombre preferido del proyecto es `mi-boleta-mx-week11`.

El resultado real del intento de publicación se anota al final de este archivo después de ejecutarlo. Si esa sección dice que no hubo despliegue, no existe una URL pública que se pueda citar.

## Variables

`AI_API_KEY` y `AI_MODEL` son opcionales y solo de servidor. Sin ellas, `/api/interpret` responde `mode: "simulacion"`.

## Resultado del intento

Se publicaron dos despliegues reales en Vercel, cuenta `miguelbbuilds-gif`, proyecto `mi-boleta-mx-week11`, equipo `miguel-d52d`. El repositorio de GitHub quedó conectado al proyecto. No había `AI_API_KEY`. Una petición anónima a `/api/interpret` respondió `mode: "simulacion"`.

El alias de producción `https://mi-boleta-mx-week11.vercel.app` respondió HTTP 200 sin autenticación, también en `/resumen`. Las URLs propias de cada despliegue respondieron 302; Vercel las marcó con protección de autenticación. Para ver la demo pública hay que usar el alias, no el enlace `*.vercel.app` de un despliegue suelto.

### Despliegue 1

- Estado: READY, destino production. El CLI lo asignó a producción por ser el primero del proyecto.
- Id: `dpl_GngCMpwd9QMWJX386iDiAzLp5kbb`
- URL del despliegue: https://mi-boleta-mx-week11-an2u7xyvh-miguel-d52d.vercel.app
- Inspección: https://vercel.com/miguel-d52d/mi-boleta-mx-week11/GngCMpwd9QMWJX386iDiAzLp5kbb
- Alias: https://mi-boleta-mx-week11.vercel.app

### Despliegue 2

- Comando: `npx vercel --prod --yes`
- Estado: READY, destino production.
- Id: `dpl_4tAWY1oFdzdfsbLCKuMzdEvEcUkT`
- URL del despliegue: https://mi-boleta-mx-week11-eajei0u4s-miguel-d52d.vercel.app
- Inspección: https://vercel.com/miguel-d52d/mi-boleta-mx-week11/4tAWY1oFdzdfsbLCKuMzdEvEcUkT
- Alias, el mismo: https://mi-boleta-mx-week11.vercel.app

Este archivo se escribió después de esos dos despliegues. El commit que lo guarda queda en GitHub y no cambia el comportamiento de la aplicación que ya está en el alias.

## Corrección de `/api/interpret`

El 25 de octubre de 2026 se publicaron otros dos despliegues de producción, después de que la lectura de un texto dejara de depender de `response.json()` y, en el segundo, de que el navegador enviara el texto como `text/plain`.

### Despliegue 3

- Commit: `615ddbe`
- Comando: `npx vercel --prod --yes`
- Estado: READY, destino production. El CLI asignó el alias.
- Id: `dpl_5gjmTa9LGZB3raFiXLUFbeCbjAAo`
- URL del despliegue: https://mi-boleta-mx-week11-myekiphz2-miguel-d52d.vercel.app
- Inspección: https://vercel.com/miguel-d52d/mi-boleta-mx-week11/5gjmTa9LGZB3raFiXLUFbeCbjAAo

### Despliegue 4

- Commit: `057835a`
- Comando: `npx vercel --prod --yes`
- Estado: READY, destino production.
- Id: `dpl_7wNMPn99xvShUCb1JasVfSqPoeTe`
- URL del despliegue: https://mi-boleta-mx-week11-btpzvi0d2-miguel-d52d.vercel.app
- Inspección: https://vercel.com/miguel-d52d/mi-boleta-mx-week11/7wNMPn99xvShUCb1JasVfSqPoeTe
- Alias: https://mi-boleta-mx-week11.vercel.app

Después del despliegue 4, `GET /nueva` en el alias respondió 200 y el paquete `index-CZZpusy_.js` incluye `text/plain; charset=utf-8` y no llama a `response.json()`. Un POST con el texto de PET devolvió `mode: "simulacion"`, peso `12.5` y un aviso que contiene SIMULACIÓN. El mismo POST con el texto `Failed to parse JSON response` devolvió 200 y `mode: "simulacion"`. La URL propia del despliegue 4 respondió 302; el alias público respondió 200. Este registro se agregó después de ese despliegue, así que el alias corresponde al commit `057835a` y no incluye este párrafo.
