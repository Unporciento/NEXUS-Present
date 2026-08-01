# Third-party notices

## fflate 0.8.3

NEXUS usa `fflate` exclusivamente para crear y leer ZIP locales. La versión está fijada exactamente, no tiene dependencias transitivas ni carga runtime remoto o CDN.

El build incluye una copia UMD local sin cambios funcionales, salvo seleccionar `globalThis` como destino universal; esto evita depender de `node_modules` o una red en producción.

Copyright (c) 2020 Arjun Barrett. Licencia MIT. El texto de licencia de la dependencia se conserva en su paquete instalado y su distribución debe mantener el aviso correspondiente.

Repositorio: https://github.com/101arrowz/fflate
