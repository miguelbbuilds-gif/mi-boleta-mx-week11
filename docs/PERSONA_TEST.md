# Prueba de persona

Persona sintética: Don Ernesto, 56 años. Recoge PET y cartón, usa WhatsApp, desconfía de aplicaciones que no conoce, quiere ver kilos, precio y total, no quiere dar RFC ni datos bancarios, y puede quedarse con un papel en lugar de un teléfono.

Esto no es una entrevista. Nadie con ese nombre probó el producto. El recorrido lo ejecutó Playwright contra el build de producción, en un viewport de 390×844, el 25 de octubre de 2026.

## Guion

1. Abrir el inicio y leer que los datos son ficticios.
2. Entrar a la demo.
3. Crear una boleta con el ejemplo de Don Ernesto: PET, 12.5 kg, 8.50 por kilo.
4. Ver el total junto a esos campos.
5. Confirmar que no hay campo de RFC ni de cuenta.
6. Guardar, y usar imprimir o copiar. No debe enviarse WhatsApp solo.
7. Abrir una aclaración y comprobar que el original no cambia.
8. Mirar precios como referencia interna.
9. Poner la cuota del patrocinador en cero y ver que el ingreso de la plataforma cae y el valor del material no.

## Lista de revisión

| Pregunta | Resultado observado |
| --- | --- |
| ¿El total se explica como kilos por precio? | Sí. El bloque dice 12.5 kg × 8.50 y $106.25. |
| ¿Pide RFC o banco? | No hay esos campos. La prueba contó cero textboxes con ese nombre. |
| ¿La boleta sirve en papel? | El botón Imprimir boleta de papel quedó visible. No se mandó a una impresora física. |
| ¿WhatsApp se envía solo? | No. Hay un texto para copiar y la pantalla lo dice. |
| ¿Aclarar borra la boleta? | No. El aviso dice que la boleta original no cambió. |
| ¿El precio se presenta como mercado nacional? | No. El título dice referencia interna. |
| ¿Cuota cero se disfraza de ingreso? | No. El ingreso del patrocinador pasó a $0.00 y el material siguió en $300,960.00. El equilibrio pasó de 3 patios a “Sin equilibrio”. |

Las frases salen de `docs/persona-run.json`, escrito por la prueba, no redactadas después como si se hubieran observado a ojo.

## Hallazgo y cambio

Durante la construcción, el total vivía en una columna lateral. En un teléfono esa columna queda debajo de todo el formulario, así que la persona vería el resultado tarde. Antes del recorrido que pasó, moví el total para que quede inmediatamente bajo el peso y el precio, y encima de los campos opcionales de evidencia.

No guardé una captura del layout anterior. La evidencia del layout nuevo es la prueba de navegador, que encontró “12.5 kg” y “106.25” en ese bloque, y `docs/screenshots/nueva-mobile.png`, tomada después del botón de ejemplo. En esa captura el primer pantallazo muestra hasta el material; el total está en el tramo siguiente, no escondido al final de la evidencia. No volví a correr una entrevista porque no hay una persona entrevistada.

## Pendiente

Sigue pendiente una prueba con una persona real, en un patio, con una báscula y con el papel en la mano. Marcar este archivo como entrevista de campo sería falso.
