# Sistema de movimiento

Las intenciones narrativas siguen siendo `reveal`, `emphasize`, `compare`, `transition`, `focus` y `exit`. El registro inicial limita la representación a:

- `cut`: sin animación;
- `fade`: 180 ms;
- `slide`: 220 ms;
- `focus`: 200 ms.

El tema puede cambiar su representación en el futuro sin modificar Player Core.

`TransitionController` mantiene una única animación. Una navegación nueva cancela la anterior antes de pintar; no bloquea el estado ni la entrada. `prefers-reduced-motion: reduce` y pestaña oculta fuerzan `cut`. `destroy` cancela y retira el listener de visibilidad.

No existen bucles decorativos, movimiento permanente ni efectos basados en coordenadas libres.
