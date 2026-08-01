# Informe de candidata NEXUS 1.0

## Identidad

- Versión: `1.0.0-rc.1`.
- Rama: `phase-9/nexus-1.0-rc` → `program/nexus-1.0-rc`.
- Publicación: no realizada.
- GitHub Pages: debe permanecer desactivado.
- Release y tag `v1.0.0`: no creados.

## Alcance certificado

Biblioteca local, importación JSON, Studio guiado, persistencia y recovery, assets reales, preview, Player, JSON público, backup/restauración y paquete portable con verificación. Sin backend, cuentas, nube, sincronización, colaboración, IA, PWA ni Service Worker.

## Evidencia final

- Suite automatizada: 104/104 pruebas aprobadas en el gate final.
- Build estático: 77 archivos; 240.001 bytes.
- Artefacto local: `nexus-present-1.0.0-rc.1.zip`; 97.034 bytes.
- SHA-256: `F0C83A331B7247DAEB6C9EED31C03ABBABBDA3F700D9D6BB1545380EEC723683`.
- Responsive en navegador real de escritorio con tamaños emulados: 320×568, 360×640, 375×667, 390×844, 412×915, 768×1024, 820×1180, 1024×768, 1366×768 y 1920×1080.
- Resultado responsive: sin desbordamiento horizontal, acciones de al menos 44 px y foco de teclado visible.
- Flujos observados: guardado, conflicto entre pestañas, imagen SVG segura, fallo multimedia recuperable, backup, ZIP corrupto y Player portable servido por HTTP.
- Rendimiento local: Biblioteca 12,20 ms de mediana; navegación 0,0015 ms; ZIP sin assets 2,88 ms. Metodología y límites en `PERFORMANCE_BUDGET_1.0.md`.

## Límites de la evidencia

- La revisión usó navegador real de escritorio con emulación responsive; no equivale a pruebas físicas en iPhone, iPad o Android.
- Safari, Firefox y dispositivos físicos permanecen en el gate humano.
- El zoom automatizado al 200 % no produjo una lectura fiable del viewport y queda como comprobación manual.
- El video sintético verificó el error recuperable, no la reproducción completa de un códec real.
- `npm audit` no se ejecutó porque la política del entorno bloqueó el envío de metadatos de dependencias; el árbol local confirma únicamente `fflate@0.8.3`, sin dependencias transitivas.
- Las evidencias visuales se guardaron fuera del repositorio para no incorporar archivos de auditoría al producto.

## Gate humano

La RC queda preparada para revisión. Publicar exige pruebas físicas pendientes, auditoría externa de la dependencia, aprobación legal/visual, actualización a `1.0.0` y autorización separada para Pages.
