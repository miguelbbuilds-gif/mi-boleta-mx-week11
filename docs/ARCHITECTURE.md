# Arquitectura

Mi Boleta MX es una aplicación de una sola página. El navegador guarda el archivo. El único extremo de servidor previsto es `/api/interpret`, y en esta entrega responde en modo simulación porque no hay clave de IA.

## Módulos

| Ruta | Pantalla | Responsabilidad |
| --- | --- | --- |
| `/` | Inicio | Promesa, demo y cifras del archivo local |
| `/resumen` | Resumen | Totales, gráficas y boletas recientes |
| `/nueva` | Nueva boleta | Captura, cálculo y texto simulado |
| `/boletas` | Mis boletas | Búsqueda, filtros, CSV |
| `/boletas/:folio` | Detalle | Papel, copia y aclaraciones del folio |
| `/precios` | Precios | Mediana interna contra un precio ofrecido |
| `/modelo` | Modelo de negocio | Escenarios, margen y equilibrio |
| `/aclaraciones` | Aclaraciones | Alta y seguimiento sin tocar el original |
| `/evidencia` | Evidencia | Metadatos, no prueba |
| `/piloto` | Métricas del piloto | Indicadores simulados y regla de paro |
| `/privacidad` | Tus datos | Exportar, restaurar, borrar |
| `/condiciones` | Condiciones | Las seis condiciones del borrador |

## Cálculo

`src/lib/money.ts` convierte kilos a gramos enteros y pesos a centavos. El total es `gramos × centavos / 1000`, con mitad hacia arriba. El modelo de negocio usa la misma escala. Ningún total pasa por un modelo de lenguaje.

## Estado

`AppState` carga `localStorage` con la clave `mi-boleta-mx-week11-v1`. Si no hay nada, siembra 30 boletas ficticias, cuatro aclaraciones y tres escenarios editables. Borrar deja el archivo vacío y conserva los supuestos del modelo para que la pantalla económica siga usable. Restaurar demo vuelve a la semilla.

## Interpretación de texto

`shared/interpret.mjs` extrae material, peso, precio y otros campos con reglas. No calcula el total. `api/interpret.js` y el middleware de Vite, incluido el de `vite preview`, llaman a la misma función. Una clave vacía, corta o de ejemplo no sale del modo simulación. Si el modelo responde algo que no es JSON, el servidor también vuelve a simulación. El navegador envía el texto como `text/plain`, no como JSON, para que la plataforma no rechace el cuerpo antes de la función. Lee la respuesta como texto: si no puede interpretarla, muestra las reglas locales y el distintivo SIMULACIÓN, sin publicar el fallo de lectura. La interfaz exige una casilla de confirmación antes de copiar sugerencias al formulario. Una boleta ya guardada no se modifica.

## Lo que no hay

No hay base de datos, autenticación, cola de mensajes ni almacenamiento de imágenes. Un uso real con varias personas requeriría otro diseño, descrito en `SECURITY.md` y `LIMITATIONS.md`, y no se simuló con un backend público inseguro.
