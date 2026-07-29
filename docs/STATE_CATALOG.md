# Catálogo de estados

La máquina del Player usa `idle`, `loading`, `ready`, `presenting`, `paused`, `completed`, `error` y `destroyed`. Las transiciones no permitidas se rechazan; la referencia operativa es [PLAYER_CONTRACT.md](PLAYER_CONTRACT.md).

| Estado | Interfaz mínima | Recuperación |
|---|---|---|
| `idle` | sin presentación activa | cargar documento válido |
| `loading` | preparación interna | validación o error controlado |
| `ready` | documento validado | iniciar |
| `presenting` | escena, progreso y controles | navegar o pausar |
| `paused` | sesión conservada | reanudar |
| `completed` | aviso final y reinicio | reiniciar |
| `error` | mensaje seguro, sin detalles sensibles | volver a cargar documento válido |
| `destroyed` | interfaz y entradas liberadas | crear un Player nuevo |

Los estados futuros de recurso ausente, formato incompatible, sin conexión, actualización, 404 y recuperación segura siguen reservados por el contrato general; todavía no tienen UI productiva en Fase 3.

En Fase 4, recurso visual sin alternativa muestra fallback; renderer ausente muestra escena segura; fallo de renderer ofrece continuar o reiniciar. Carga, error, finalización y destrucción se comunican por texto, no solo por color.

Los fixtures declaran `idle`, `loading`, `ready`, `failed` y `unsupported`. Solo `failed` y `unsupported` muestran fallback recuperable; ningún estado expone códigos técnicos aislados.

PreviewBridge usa `idle`, `validating`, `invalid`, `transforming`, `rendering`, `ready`, `stale`, `recoverable-error`, `fatal-error` y `destroyed`. `stale` conserva el preview anterior pero declara que no está actualizado; `invalid` nunca inicia Player. La tabla operativa completa está en [PREVIEW_BRIDGE.md](PREVIEW_BRIDGE.md).

## Exportación local

| Estado | Significado | Recuperación |
| --- | --- | --- |
| `idle` | Sin exportación en esta sesión | Exportar |
| `validating` / `preparing` | Comprobación y serialización en curso | Esperar |
| `invalid` | El borrador o documento público no cumple el contrato | Corregir y reintentar |
| `downloading` | El navegador inicia la descarga | Esperar |
| `exported` / `ready` | Archivo generado para el borrador actual | Volver a exportar |
| `stale` | El borrador cambió tras exportarse | Exportar otra vez |
| `recoverable-error` | Falló preparación, Blob, URL o descarga | Reintentar |
| `destroyed` | Instancia liberada | Crear otra instancia |
