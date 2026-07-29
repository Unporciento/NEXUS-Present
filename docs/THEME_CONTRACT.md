# Contrato de temas

Un tema es `{ id, tokens }`. Además de fondo, superficie, texto y acento, exige tokens de borde, control, texto de control, deshabilitado, foco, estado y footer. La validación rechaza temas sin identificador o token obligatorio.

`neutral` es la base legible clara. `nexus` es la identidad inicial: azul profundo, superficies sobrias y acento dorado funcional. Ambos usan fuentes del sistema; no descargan fuentes externas.

El DOM Adapter aplica tokens al contenedor. Player Core, contratos y renderers no conocen colores ni tipografías. Un tema inexistente no altera el tema actual y devuelve un resultado inválido.

Las intenciones `reveal`, `emphasize`, `compare`, `transition`, `focus` y `exit` pertenecen al contenido y cada tema puede representarlas. Fase 4 solo representa `reveal` de forma breve; con `prefers-reduced-motion` se reduce a 1 ms.
