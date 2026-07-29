# Catálogo de estados

| Estado | Respuesta profesional | Recuperación |
|---|---|---|
| Carga | progreso accesible y sin bloqueo | cancelar o reintentar |
| Vacío | explica ausencia de presentación | elegir documento válido |
| Error | mensaje, id y detalle técnico seguro | reintentar o volver |
| Recurso ausente | sustituto textual y escena navegable | reintentar/reemplazar posterior |
| Formato incompatible | versión requerida y detectada | actualizar motor o documento |
| Presentación inválida | errores acumulados por campo | corregir datos, no renderizar parcialmente |
| Sin conexión | indica alcance offline real | reintentar al reconectar |
| Actualización disponible | conserva sesión y ofrece actualizar | activar cuando usuario acepte |
| Recuperación segura | restaura último estado válido | descartar operación fallida |
| 404 | página propia y regreso seguro | volver al inicio |
| Publicación fallida | conserva última release activa | corregir, revalidar y reintentar |
| Reversión | identifica release restaurada | confirmar operación trazable |

Cada estado debe ser semántico, accesible por teclado, visible para lectores de pantalla y no revelar información sensible.
