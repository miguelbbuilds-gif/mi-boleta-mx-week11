# Lista de entrega

Marcado con lo que esta sesión realmente dejó. Una casilla vacía no se debe presentar como hecha.

- [x] Aplicación en español, con boleta, historial, precios, modelo, aclaraciones, evidencia, privacidad, piloto y condiciones.
- [x] Cálculos deterministas y pruebas de dinero, aclaraciones, modelo, CSV, borrado y salvaguardas.
- [x] `npm run build` terminó sin error.
- [x] Playwright recorrió escritorio, menú móvil y el guion de Don Ernesto. No fue una entrevista humana.
- [x] Documentos del paquete en `/docs`.
- [x] Distintivo de demo y de simulación visibles.
- [x] Seis condiciones del borrador visibles en la aplicación. No hay voto de equipo documentado.
- [ ] Publicación en GitHub. Se llena en `DEPLOYMENT.md` con el resultado real.
- [ ] Dos despliegues en Vercel. Se llena igual. Si falta acceso, queda el bloqueo y no una URL inventada.
- [ ] Video. Solo existe el guion en `DEMO_SCRIPT.md`. No se grabó.

## Cómo correrlo

```bash
npm install
npm run dev
```

Pruebas: `npx vitest run` y, con el build hecho, `npx playwright test`.
