# Seguridad

Este es un prototipo educativo. No es un servicio financiero ni un archivo legal.

## Qué protege el diseño actual

- Los totales no salen de un modelo generativo.
- La clave `AI_API_KEY`, si se llegara a configurar, se lee en el servidor. El ejemplo `.env.example` no trae un secreto. No hay variables `VITE_` con llaves.
- El formulario rechaza cadenas que parecen RFC, correo, teléfono de 10 a 13 dígitos o una corrida de 16 a 18 dígitos.
- No se llama a la geolocalización del navegador.
- No hay puntaje ni ranking.
- La demo sembrada usa alias ficticios.

## Qué no protege

- `localStorage` lo puede leer cualquiera con acceso a ese navegador y a las herramientas de desarrollo. No es cifrado ni es un control de acceso.
- Exportar JSON o CSV entrega el archivo local a quien oprima el botón.
- Imprimir o copiar el texto saca los datos del navegador a propósito, para que exista un papel.
- Si en el futuro se guarda información personal de trabajadores en un servidor, harían falta autenticación, autorización, una base con acceso restringido y una revisión de privacidad y legal antes de usarlo. Este prototipo no adelanta ese sistema con una API abierta.

## Secretos

No se incluyeron llaves en el código ni en el repositorio. Si un despliegue configura `AI_API_KEY`, debe hacerse en el panel del hosting, no en el cliente.
