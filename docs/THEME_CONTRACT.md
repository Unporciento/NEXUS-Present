# Contrato de temas

Un tema es `{ id, tokens }`. Además de fondo, profundidad visual, superficie, texto y acento, exige tokens de borde, control, texto de control, deshabilitado, foco, estado y footer. `--nx-depth` evita que un Player embebido herede un resplandor incompatible con un tema claro. La validación rechaza temas sin identificador o token obligatorio.

`neutral` es la base editorial clara y `nexus` la identidad oscura principal. `aurora`, `ember` y `verdant` son alternativas opcionales violeta, cálida y verde. Todos usan fuentes del sistema, conservan los mismos tokens contractuales y no descargan recursos externos.

El DOM Adapter aplica tokens al contenedor. Player Core, contratos y renderers no conocen colores ni tipografías. Un tema inexistente no altera el tema actual y devuelve un resultado inválido.

Las intenciones `reveal`, `emphasize`, `compare`, `transition`, `focus` y `exit` pertenecen al contenido y cada tema puede representarlas. Fase 4 solo representa `reveal` de forma breve; con `prefers-reduced-motion` se reduce a 1 ms.
