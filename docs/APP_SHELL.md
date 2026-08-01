# Carcasa de aplicación NEXUS 1.0

`src/ui/app-shell.js` genera la identidad, navegación, versión y footer compartidos por Biblioteca y Studio. `app-shell.css` define los tokens estables de la aplicación, separados de `src/themes/`, que pertenece exclusivamente a las presentaciones.

## Contrato

- Biblioteca y Studio usan `productHeader` y `productFooter`; no duplican la marca.
- Todas las rutas internas son relativas para funcionar bajo el subdirectorio de GitHub Pages.
- `app-surface` controla la aplicación oscura y no cambia al seleccionar `neutral` o `nexus` en Studio.
- Player embebido omite navegación global y copyright duplicado.
- Player independiente puede recibir `returnUrl`; el runtime portable no lo recibe y permanece autónomo.
- Controles visibles miden al menos 44 px y la marca posee foco explícito.

La entrada `index.html` es una portada mínima que conduce a `library.html`. La demostración independiente vive en `player.html`.
