# Seguridad y privacidad

- Sin backend, cuentas, nube, sincronización ni telemetría en V1.
- Datos locales solo con necesidad demostrada; componentes visuales usan una capa de almacenamiento, nunca APIs directas.
- No guardar secretos, tokens, credenciales ni archivos `.env` en Git.
- Dependencias externas requieren justificación, versión fijada y revisión.
- Las entradas web y los paquetes portables declaran una CSP mediante `meta`: solo origen propio, Blob/Data para multimedia e imágenes, sin objetos, código dinámico, base remota ni envíos a otros orígenes. GitHub Pages no permite definir aquí una política de cabeceras; por eso la protección aplicable es la política embebida y debe reevaluarse si cambia el alojamiento.
- Archivos de usuario se validarán por tipo, tamaño y formato; nunca se ejecutan.
- Recursos externos usan URLs permitidas y no reciben datos del usuario sin consentimiento.
- PublicBundle excluye físicamente notas, historial, datos editoriales, rutas locales, secretos y recursos no utilizados.
- La autenticación de publicación se estudia por proveedor; nunca se resuelve guardando tokens personales en cliente o repositorio.
- Hallazgos sensibles se reportan de forma privada.

Fase 6 valida tamaño antes de leer, decodifica UTF-8, rechaza claves de prototipo, campos privados, campos desconocidos y rutas locales. La conversión construye un Source nuevo mediante campos permitidos. IndexedDB usa revisiones optimistas y transacciones; un conflicto nunca sobrescribe silenciosamente. Backups se inspeccionan y validan antes de escribir, se restauran como copias y no incluyen assets ni credenciales.

Fase 7 valida extensión, MIME, firma y tamaño antes de persistir recursos. SVG usa una política conservadora que rechaza scripts, eventos, referencias externas, contenido ejecutable y entidades. Los nombres no admiten rutas, controles ni nombres reservados. Recursos públicos aceptan HTTPS, rutas relativas seguras o `nexus-asset:`; traversal, `file:`, `data:` y JavaScript se rechazan.

Los Blob permanecen en IndexedDB y nunca se insertan como HTML. Object URLs son temporales, cuentan referencias y se revocan al navegar o destruir. Video no usa autoplay con sonido ni continúa al ocultar la pestaña.

Fase 8 inspecciona el directorio central del ZIP antes de descomprimir y limita bytes comprimidos, bytes expandidos, entradas y proporción. Rechaza traversal, rutas absolutas, nombres reservados, archivos inesperados, claves de prototipo, versiones incompatibles y hashes incorrectos. El runtime es código propio en lista cerrada; presentaciones y SVG nunca se evalúan como código.

NEXUS 1.0 se publica como archivos estáticos bajo un subdirectorio. No contiene endpoints privados, secretos, funciones de servidor, manifest, Service Worker ni telemetría. Las rutas de navegación, módulos, favicon y recursos son relativas al documento.
