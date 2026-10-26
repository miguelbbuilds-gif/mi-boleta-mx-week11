# Modelo financiero

Todos los números de esta página son salida del motor en `src/lib/model.ts` con los supuestos iniciales del escenario Base. No son precios de mercado, no son un contrato y no son resultados de campo.

## Supuestos base, editables en la pantalla

| Supuesto | Valor inicial |
| --- | --- |
| Patios | 8 |
| Transacciones por patio al día | 15 |
| Días al mes | 24 |
| Kilos promedio | 9.5 |
| Pago promedio por kilo | 11.00 MXN |
| Cuota del patrocinador por patio | 4,500 MXN |
| Arranque por patio | 3,500 MXN |
| Hospedaje | 1,200 MXN |
| Soporte | 6,000 MXN |
| Costo por transacción | 1.20 MXN |
| Incentivo piloto por patio | 800 MXN |
| Aclaraciones | 6 % |
| De esas, resueltas | 65 % |
| Monto promedio recuperado | 48 MXN |

Conservador y Optimista tienen otros supuestos en el mismo archivo. Cambiar uno no pisa a los otros.

## Fórmulas

- Transacciones del mes = patios × transacciones por día × días.
- Kilos = transacciones × kilos promedio.
- Valor del material = kilos × pago por kilo. Es dinero del material, no de la plataforma.
- Ingreso del patrocinador = patios × cuota mensual. Es un supuesto.
- Costo del mes = hospedaje + soporte + transacciones × costo por transacción + patios × incentivo. El arranque no entra aquí.
- Margen = ingreso del patrocinador − costo del mes.
- Si la cuota por patio supera el costo variable de ese patio, los patios de equilibrio son los costos fijos divididos entre ese aporte, redondeados hacia arriba. Si no lo supera, no hay equilibrio.
- Beneficio estimado por aclaraciones = transacciones × porcentaje de aclaraciones × porcentaje resuelto × monto promedio. El producto se trunca al centavo. Es un supuesto.

## Salida verificada del escenario base

Estas cifras las afirmaron las pruebas y la pantalla del modelo:

| Salida | Valor |
| --- | --- |
| Transacciones | 2,880 |
| Kilos documentados | 27,360 kg |
| Valor del material | 300,960.00 MXN |
| Ingreso supuesto del patrocinador | 36,000.00 MXN |
| Costo operativo | 17,056.00 MXN |
| Margen | 18,944.00 MXN |
| Patios de equilibrio | 3 |
| Beneficio estimado por aclaraciones | 5,391.36 MXN |

Con la cuota en cero, las pruebas exigen ingreso de plataforma 0, valor del material mayor que cero y equilibrio nulo. La prueba de navegador vio el material en 300,960.00 MXN y el ingreso del patrocinador en 0.00 MXN.

## Lectura

Con estos supuestos, ocho patios dejarían margen positivo y el equilibrio estaría en tres. Eso no significa que una marca vaya a pagar 4,500 pesos por patio. Si la cuota no cubre el costo variable, sumar patios empeora el resultado: la escala no salva un modelo al revés. El arranque es un gasto único y no debe sumarse disfrazado de margen mensual.
