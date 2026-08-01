# Revisión de seguridad 1.0 RC

Fecha: 01/08/2026. Alcance: rama `phase-9/nexus-1.0-rc`, versión `1.0.0-rc.1`.

| Vector | Control | Evidencia |
|---|---|---|
| JSON hostil | UTF-8 estricto, 5 MiB, claves peligrosas y campos privados rechazados | pruebas ImportService |
| Prototype pollution | rechazo recursivo de `__proto__`, `prototype`, `constructor` | pruebas de importación y paquete |
| ZIP traversal | rutas relativas NFC, segmentos y nombres reservados bloqueados | `path-policy.js` |
| ZIP bomb | preflight: 250 MiB comprimidos, 500 MiB expandidos, 512 entradas, 100:1 | `archive-adapter.js` |
| Integridad | tamaño y SHA-256 de documento, runtime y assets antes de persistir | IntegrityVerifier |
| SVG | sanitización conservadora; sin scripts, eventos ni referencias externas | pruebas SVG |
| MIME falso | firma de PNG/JPEG/WebP/MP4/WebM/VTT y MIME coherente | AssetRepository |
| HTML/script | renderers escapan texto; no existe `eval` ni `new Function` | búsqueda estática y pruebas DOM |
| Datos privados | conversión por lista permitida; paquete excluye Source y estado Studio | contratos públicos |
| Rutas privadas | `file:`, unidades, UNC y rutas de usuario rechazadas | validadores y escaneo Git |
| Persistencia corrupta | validación al leer; revisiones, recovery y rollback transaccional | repositorios |
| Object URLs | pool con conteo y revocación; descarga revoca en `finally` | pruebas lifecycle |

`fflate` 0.8.3 está fijada, sin dependencias transitivas y vendorizada para el build estático. La auditoría final ejecutó `npm audit --omit=dev` usando el almacén de certificados de Windows y obtuvo 0 vulnerabilidades. También se verificaron lockfile, árbol local, licencia y ausencia de runtime remoto.

No se detectaron secretos, telemetría, endpoints de datos, ejecución dinámica ni publicación. Riesgo residual: codecs, cuotas y políticas de descarga dependen del navegador; los ZIP extremos deben seguir sometidos a límites antes de descomprimir.

## Cierre de lanzamiento

La revisión final añade CSP embebida a las cinco entradas públicas y al HTML portable, rutas relativas compatibles con subdirectorio y separación estricta entre tema de aplicación y contenido. La búsqueda final cubre secretos conocidos, rutas privadas absolutas, endpoints, ejecución dinámica y artefactos internos. El resultado de `npm audit` y los identificadores definitivos se registran en `RELEASE_REPORT_1.0.md`.
