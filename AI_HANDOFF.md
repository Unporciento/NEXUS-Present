# AI HANDOFF — NEXUS Present

## Propósito

NEXUS Present es un motor reutilizable para presentaciones HTML profesionales. No debe acoplarse al contenido de una presentación individual.

## Estado actual

La fase actual es de diseño. Aún no se implementan efectos visuales ni funcionalidades complejas.

## Decisiones vigentes

- Este proyecto adopta [DEVELOPMENT_STANDARD.md](docs/DEVELOPMENT_STANDARD.md).
- El motor y el contenido deben permanecer separados.
- Se privilegian estabilidad, rendimiento y compatibilidad.
- Toda nueva funcionalidad debe ser modular y documentada.
- La identidad visual se definirá mediante temas y tokens, no mediante reglas dispersas.
- El módulo Laboratorio es obligatorio en una fase futura: diagnostica en modo seguro, no modifica datos ni transmite información sin consentimiento.

## Siguiente intervención recomendada

1. Confirmar la estructura de carpetas definitiva.
2. Definir la arquitectura y los límites de privacidad del Laboratorio.
3. Elegir el stack mínimo de HTML, CSS y JavaScript.
4. Implementar el núcleo de renderizado con una presentación de ejemplo aislada.
5. Añadir pruebas básicas de compatibilidad antes de efectos visuales.

## Mantenimiento de la ficha técnica

Al cerrar una fase, actualizar en `README.md`: estado, versión, última auditoría, último respaldo y próxima fase.
