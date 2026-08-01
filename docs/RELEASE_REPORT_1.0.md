# Informe de lanzamiento NEXUS 1.0

Fecha: 01/08/2026. Versión: `1.0.0`.

## Alcance

Biblioteca local, Studio guiado, Player independiente y embebido, documentos validados, IndexedDB, importación JSON, backup/restauración, imágenes, video, WebVTT, temas y paquetes portables. Sin cuentas, backend, nube, telemetría, sincronización, colaboración ni IA.

## Experiencia

La fragmentación provenía de tokens ausentes en Biblioteca, temas de presentación aplicados a todo Studio y una entrada principal ocupada por la demo. `AppShell` y sus tokens unen Biblioteca y Studio; el Player mantiene su tema narrativo aislado. `index.html` abre una entrada de producto y `player.html` conserva la demostración.

## Evidencia previa

- 110 pruebas automatizadas aprobadas en el gate de rama release.
- 40 combinaciones de página/tamaño revisadas en navegador real de escritorio con viewport emulado: de 320×568 a 1920×1080, sin overflow y con controles de al menos 44 px.
- Importación JSON real, backup, conflicto entre pestañas, imagen segura, MP4 CC0, WebVTT y ZIP portable comprobados.
- Foco, teclado, movimiento reducido por contrato, errores recuperables y separación de temas comprobados.
- Dispositivos físicos, Safari, Firefox y zoom nativo automatizado al 200 % permanecen como límites declarados; la composición equivalente se cubrió mediante reflow estrecho y texto flexible.

## Artefacto

- Build estático normalizado: 81 archivos, 245.841 bytes.
- Archivo: `nexus-present-1.0.0.zip`, 100.106 bytes.
- SHA-256: `44EC9353D1D66B06F4491A7AB499177F8E60A751F620C059001D13E484D412E4`.
- Reproducibilidad: el build normaliza archivos de texto a LF y dos ejecuciones consecutivas produjeron el mismo checksum.
- Dependencias: `fflate@0.8.3`, sin transitivas; `npm audit --omit=dev`: 0 vulnerabilidades.

Los valores definitivos de commit, Pages y smoke test público se registran al completar el despliegue.
