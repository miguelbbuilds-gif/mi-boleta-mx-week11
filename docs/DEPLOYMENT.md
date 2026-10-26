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

Pendiente de la corrida de publicación en esta misma sesión. Si el intento falla, la nota de abajo debe reemplazar esta frase con el error real y no con una URL inventada.
