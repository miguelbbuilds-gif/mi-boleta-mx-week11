export const TOUR_STEPS = [
  {
    title: '1. Resumen',
    path: '/resumen',
    body: 'Mira kilos, pesos pagados y boletas recientes. El distintivo DEMO significa que los datos son ficticios.',
  },
  {
    title: '2. Nueva boleta',
    path: '/nueva',
    body: 'Abre el formulario. El ejemplo de Don Ernesto llena PET, kilos y precio sin pedir RFC ni banco.',
  },
  {
    title: '3. Total calculado',
    path: '/nueva',
    body: 'El total es kilos × precio por kilo, redondeado al centavo. Un texto interpretado no puede fijarlo solo.',
  },
  {
    title: '4. Papel o copia',
    path: '/nueva',
    body: 'Imprime la boleta o copia el texto. Nada se envía por WhatsApp de forma automática.',
  },
  {
    title: '5. Aclaración',
    path: '/aclaraciones',
    body: 'Abre una aclaración. La boleta original se conserva, aunque el caso se resuelva.',
  },
  {
    title: '6. Precios',
    path: '/precios',
    body: 'Compara un precio ofrecido contra la mediana de este archivo. No es un precio nacional ni un veredicto.',
  },
  {
    title: '7. Quién paga',
    path: '/modelo',
    body: 'Separa el valor del material de la cuota supuesta del patrocinador. Cambia los supuestos.',
  },
  {
    title: '8. Equilibrio',
    path: '/modelo',
    body: 'Observa el punto de equilibrio. Si la cuota no cubre el costo, la gráfica lo muestra sin disfrazarlo de ingreso.',
  },
] as const;
