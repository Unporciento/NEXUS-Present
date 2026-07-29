# AI HANDOFF — NEXUS Present

## Propósito

NEXUS Present es un motor reutilizable para presentaciones HTML profesionales. No debe acoplarse al contenido de una presentación individual.

## Estado actual

La Fundación documental y contractual está en `phase-1/foundation`. La visión 1.0 incluye Studio, Player, Presenter, Publisher y Laboratory inicial. No iniciar código, PWA, páginas ni publicación hasta aprobar esta fase.

## Decisiones vigentes

- El motor, las presentaciones, temas y recursos permanecen separados.
- `PRESENTATION_CONTRACT.md` y `SCENE_CONTRACT.md` son la fuente de verdad antes de implementar escenas.
- La V1 incorpora Studio estructurado, Publisher y Laboratory inicial; editor libre, nube, cuentas, salas e IA siguen fuera de alcance.
- SourcePresentationDocument y PublicPresentationDocument son contratos distintos; publicación usa PublishAdapter.
- Este proyecto adopta `docs/DEVELOPMENT_STANDARD.md`.

## Siguiente intervención recomendada

1. Revisar y aprobar la ampliación documental de Fase 1.
2. Autorizar explícitamente Fase 2: validación y núcleo contractual.

## Mantenimiento de la ficha técnica

Al cerrar una fase, actualizar en `README.md`: estado, versión, última auditoría, último respaldo y próxima fase.
