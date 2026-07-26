# NEXUS Present

Motor reutilizable para crear presentaciones HTML profesionales.

NEXUS Present no es una presentación concreta: es una base modular, rápida y mantenible para producirlas. El contenido vive separado del motor para conservar la reutilización y reducir la complejidad.

## Ficha técnica

| Campo | Valor |
| --- | --- |
| Proyecto | NEXUS Present |
| Repositorio | https://github.com/Unporciento/NEXUS-Present |
| Producción | Pendiente de publicación en GitHub Pages |
| Estado | En diseño arquitectónico |
| Versión | 0.1.0 |
| Última auditoría | 26/07/2026 |
| Responsable | Usuario |
| IA principal | Codex |
| Documentación | README · CHANGELOG · AI_HANDOFF · SECURITY |
| Último respaldo | 26/07/2026 — copia local inicial |
| Próxima fase | Definir núcleo arquitectónico y estructura de carpetas |

## Principios

- Separación estricta entre el motor de presentación y el contenido.
- Arquitectura modular y fácil de mantener.
- Prioridad a estabilidad, rendimiento y compatibilidad.
- Sin efectos visuales hasta consolidar una base robusta.
- Identidad visual propia, elegante y moderna, diferenciada del resto del ecosistema.

## Arquitectura propuesta

```text
src/
  core/          # Ciclo de vida, renderizado y navegación
  components/    # Componentes visuales reutilizables
  themes/        # Tokens y temas de identidad visual
  content/       # Datos de cada presentación, fuera del motor
  plugins/       # Extensiones opcionales
  styles/        # Estilos base y utilidades
docs/            # Decisiones y guía de arquitectura
```

## Documentación

- [Registro de cambios](CHANGELOG.md)
- [Guía de continuidad para IA](AI_HANDOFF.md)
- [Política de seguridad](SECURITY.md)
