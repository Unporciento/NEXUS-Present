# Plan de Studio — Fase 5

## Objetivo

Un Studio guiado crea y edita `SourcePresentationDocument`, valida con los contratos existentes, previsualiza con Player y exporta un `PublicPresentationDocument` local. No es un lienzo libre ni publica contenido.

## Flujo

Crear documento seguro → editar metadatos → añadir/editar/ordenar escenas → validar → previsualizar → exportar JSON. La eliminación pide confirmación; los errores se asocian al campo y el documento conserva su último estado válido.

## Arquitectura prevista

| Módulo | Responsabilidad | Límite |
|---|---|---|
| StudioController | comandos y coordinación | no renderiza ni valida por duplicado |
| StudioState | borrador, selección, modo y cambios | sin persistencia |
| DocumentEditor | título, descripción, tema | formularios guiados |
| SceneEditor / BlockEditor | campos compatibles por tipo | sin coordenadas libres |
| ThemeSelector | temas registrados | no crea temas arbitrarios |
| ValidationPanel | diagnósticos existentes | no inventa reglas |
| PreviewBridge | convierte, crea y destruye Player | sin DOM interno del Player |
| ExportService | JSON público determinista | sin publicación |
| DraftRepository futuro | persistencia explícita | fuera de Fase 5 |

## Escenas y recursos

`cover`, `statement`, `content`, `media`, `comparison`, `evidence` y `closing` solo exponen bloques/layouts autorizados por `registry.js`; sus formularios muestran valores por defecto seguros. Recursos iniciales: SVG local seguro, imagen local/controlada y placeholder de vídeo. Estados: idle, loading, ready, failed, unsupported.

## UX responsive y accesibilidad

Escritorio muestra lista, editor, preview y validación. Tablet reduce paneles; móvil navega entre paneles. Formularios etiquetados, errores asociados, foco tras selección, aria-live breve, teclado completo, 44 px táctil, contraste y movimiento reducido son requisitos. Pruebas físicas móviles y lector de pantalla permanecen como riesgo.

## Undo / redo futuro

Snapshots inmutables limitados a 50 acciones o 2 MB: campo, alta, baja, orden y tema. No se implementa en Fase 5 inicial; cada comando deberá ser reversible o declarar por qué no lo es.

## Fases internas

5A Estado y controlador implementados sin DOM. 5B Metadatos, lista y formularios de escena. 5C Validación y PreviewBridge. 5D Exportación local. 5E incluye onboarding, ayuda contextual, estados vacíos, tutorial repetible, identidad, footer, derechos, accesibilidad y responsive finales.

## Exclusiones

Sin publicación, Pages, PWA, Service Worker, cuentas, almacenamiento, backend, colaboración, IA, editor libre, multimedia avanzada ni Presenter completo.
