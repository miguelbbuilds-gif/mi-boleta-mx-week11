# Mi Boleta MX

Boletas transparentes para entregas de material reciclable, con un modelo para ver quién pagaría la transparencia antes de salir a la calle.

Cada kilo cuenta. Cada peso también.

Proyecto educativo de Miguel Bravo, AI 2041, semana 11, rol MONEY. Los datos de la demo son ficticios. El blueprint de equipo citado en `docs/PACKET.md` es un borrador, no un voto documentado.

## Correr

```bash
npm install
npm run dev
```

## Probar

```bash
npm run typecheck
npm run build
npx vitest run
npx playwright test
```

`playwright test` usa el preview de producción en el puerto 4173. Hace falta haber corrido `npm run build` antes.

## Documentos

El paquete del curso está en `docs/PACKET.md`. El resto de la carpeta `docs/` cubre arquitectura, pruebas, persona sintética, modelo, seguridad y límites.

## IA

Sin `AI_API_KEY` en el servidor, la lectura de un texto de boleta es una simulación con reglas fijas. No calcula pagos. La pantalla lo marca como SIMULACIÓN y pide confirmación antes de tocar el formulario.
