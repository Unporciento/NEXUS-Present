# Auditoría del motor — Fase 7

## Alcance

Se revisaron Player Core, máquina de estados, navegación, eventos, renderers, layouts, temas, PreviewBridge, entradas, transformación pública, lifecycle, pestaña oculta y `destroy`. La auditoría no justificó reescribir Player Core: su estado sigue independiente del DOM, clona el documento y bloquea navegación después de destruirse.

## Hallazgos y cambios mínimos

| Evidencia | Regresión añadida | Corrección |
| --- | --- | --- |
| Studio creaba `content/stack`, pero Layout Registry no aceptaba `stack` | layout por defecto de Studio renderizable | se registró `stack` |
| un fallo de renderer permanecía anunciado después de una escena válida | error seguido por renderer válido | el DOM Adapter limpia solo el error obsoleto |
| ausencia de archivo devolvía un mensaje genérico | importación sin archivo | se conserva el mensaje controlado del validador |
| los renderers no liberaban explícitamente su ciclo anterior | destroy y navegación | `dispose` antes de reemplazar y al destruir |
| multimedia local necesitaba URLs temporales | pool con referencias y doble destroy | `ObjectUrlPool` revoca al liberar |
| el CSS animaba cada escena sin coordinador | transición rápida, reducida y pestaña oculta | `TransitionController` cancelable |

No se detectaron listeners duplicados, temporizadores retenidos ni mutación del documento público en Player Core.

## Medición local

Microbenchmark Node 24, 20 ejecuciones de 10.000 cambios por índice sobre siete escenas:

| Muestra | Mediana por navegación | p95 por navegación |
| --- | ---: | ---: |
| antes | 0,000349 ms | 0,001590 ms |
| después | 0,000189 ms | 0,000518 ms |

La diferencia está dentro de la sensibilidad de un microbenchmark y no se declara como garantía de mejora. El resultado importante es que el refuerzo de recursos y movimiento no añadió trabajo al Player Core.

## Evidencia de navegador

Se validó en Chrome de escritorio servido por HTTP: Biblioteca, Studio, selección de escena Multimedia, formulario adaptable, preview, navegación rápida, fallback recuperable y corrección del estado obsoleto. La subida física quedó bloqueada por el permiso de archivos de la extensión de automatización; formatos, archivos, MIME, hash, SVG y lifecycle se cubren con pruebas locales.
