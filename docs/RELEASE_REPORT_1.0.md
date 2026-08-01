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

- Build estático normalizado: 82 archivos, 245.841 bytes, incluida la señal `.nojekyll` de Pages.
- Archivo: `nexus-present-1.0.0.zip`, 100.242 bytes.
- SHA-256: `A323BA8D3D7F4DF983FB5CBABB6A0D8B722814995FFE7F5F9553BA817EA608AE`.
- Reproducibilidad: el build normaliza archivos de texto a LF y dos ejecuciones consecutivas produjeron el mismo checksum.
- Dependencias: `fflate@0.8.3`, sin transitivas; `npm audit --omit=dev`: 0 vulnerabilidades.

## Publicación verificada

- Rama release: `af81f62f8f938b94584a8b29990f7c9f002df757`.
- Commit certificado y destino de `v1.0.0`: `ae08c592dbdb5ecd455ec9c3cf563c3a818446eb`.
- Pages: rama `gh-pages`, commit `15898fe87eae81a59c957973a4d4ff0413ecd455`, raíz `/`, HTTPS forzado.
- Producción: `https://unporciento.github.io/NEXUS-Present/`.
- GitHub Release: `https://github.com/Unporciento/NEXUS-Present/releases/tag/v1.0.0`.
- Smoke test público: entrada, Biblioteca, IndexedDB, creación, guardado, importación JSON, Studio, paquete portable, Player, finalización, reinicio y viewport móvil emulado.
- Descarga pública del ZIP: 100.242 bytes y checksum idéntico al certificado.

No existe sincronización: los borradores creados durante el smoke test pertenecen solo al origen y perfil de navegador usados.
