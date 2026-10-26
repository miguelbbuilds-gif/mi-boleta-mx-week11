# Alineación con el blueprint

El blueprint de T4 es un borrador de discusión. Este repositorio no documenta una votación del equipo. La elección provisional del vacío primario es PEPENADOR RAILS. Las seis condiciones de abajo están implementadas para poder discutirlas, no porque un contrato las haya vuelto obligatorias.

## Condición 1 — Acceso

Quien entrega material no necesita RFC, cuenta bancaria, instalar la aplicación ni usar un teléfono inteligente. La boleta se imprime desde el navegador del patio. El alias es opcional. El formulario rechaza textos que parecen RFC, teléfono, correo o una cuenta.

Dónde: Nueva boleta, detalle imprimible, inicio.

## Condición 2 — Boleta completa

Cada boleta guardada tiene peso, material, precio por kilo, total, fecha, patio y una ruta de aclaración con el folio. El total muestra la multiplicación.

Dónde: Nueva boleta, Mis boletas, detalle.

## Condición 3 — Responsabilidad económica

El modelo separa valor del material, cuota supuesta del patrocinador, incentivo por patio, costo de arranque, hospedaje, soporte, costo por transacción y adopción. La pantalla dice que nadie ha firmado un acuerdo. El valor del material no se presenta como ingreso de la plataforma.

Dónde: Modelo de negocio. Números y fórmulas en `FINANCIAL_MODEL.md`.

## Condición 4 — Integridad de la evidencia

La referencia de báscula, la confirmación de quien opera y la referencia de factura son metadatos. La demo no sube fotos. El texto dice que una imagen no prueba el origen y que una báscula analógica se captura a mano. Una inconsistencia exige una nota y no produce una acusación.

Dónde: Evidencia y campos opcionales de la boleta.

## Condición 5 — Cláusula de sombra

No hay puntaje, ranking, geolocalización ni perfil de comportamiento. No confirmar la copia no invalida la boleta ni aplica una pena. Los filtros dicen cuántas boletas ocultan y que no las borran. La vista de patrocinador, en Métricas del piloto, solo muestra agregados sin alias. Si la regla de paro está activa, ese agregado no se muestra.

Dónde: Tus datos, Mis boletas, Métricas del piloto. Pruebas en `src/lib/safeguards.test.ts`.

## Condición 6 — Medición de daño

Métricas del piloto calcula, a partir del archivo local, boletas emitidas, tasa de entrega de copia, aclaraciones, cierres, tiempo mediano, monto anotado como recuperado, adopción contra los patios supuestos del escenario y daños registrados. Un recuadro fijo dice que los datos de campo observados son cero. Si se anota represalia, exclusión o mal uso, aparece la regla de paro: el piloto se detiene y las boletas siguen disponibles.

Dónde: Métricas del piloto.

## Lo que esta alineación no prueba

No prueba que un patio haya aceptado las condiciones, que una marca vaya a pagar, ni que el diseño evite el daño en la calle. Solo muestra que el prototipo se niega a dar por buenas esas cosas.
