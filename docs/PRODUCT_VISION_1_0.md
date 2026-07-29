# Visión de producto — NEXUS 1.0

NEXUS es un estudio local para crear, organizar, presentar, publicar y compartir experiencias narrativas web. No es un clon de PowerPoint, Canva ni solo un reproductor: organiza un flujo completo.

```text
crear → estructurar → diseñar → previsualizar → ensayar → validar
→ publicar → obtener enlace → compartir → actualizar o revertir
```

NEXUS 1.0 se completa cuando una persona puede crear, presentar, publicar y compartir una presentación real mediante una URL.

## Necesidades que resuelve

- Guía el relato mediante escenas, layouts y bloques permitidos.
- Mantiene consistencia visual con temas basados en tokens.
- Funciona en móvil y escritorio, con recursos validados antes de publicar.
- Separa notas privadas del contenido público, permite ensayar y presentar.
- Actualiza una URL estable, conserva releases válidos y permite reversión trazable.
- Exporta documento fuente y paquete estático sin depender del proveedor.
- Conserva propiedad del contenido y valida accesibilidad, rendimiento y compatibilidad.

## Responsabilidades

| Pilar | Alcance 1.0 |
|---|---|
| Studio | Biblioteca local y editor estructurado de presentaciones, escenas, bloques, tema, recursos y notas |
| Player | Reproductor de audiencia independiente, sin acceso a datos privados |
| Presenter | Notas, escena actual/siguiente, tiempo, progreso, controles y avisos |
| Publisher | Paquete público, publicación mediante adaptador, URL, versión y reversión |
| Laboratory | Validación previa e informes; observa y recomienda, nunca repara sin autorización |

La identidad inicial es técnica, editorial y cinematográfica moderada. Motor, interfaz Studio, temas, contenido, escenas, animación y recursos permanecen separados. Las escenas declaran intenciones semánticas (`reveal`, `emphasize`, `compare`, `transition`, `focus`, `exit`); cada tema las representa respetando rendimiento y movimiento reducido.

No incluye colaboración simultánea, cuentas, nube propia, backend completo, IA, salas, videollamada, chat, analítica remota, marketplace, lienzo libre ni animación 3D compleja.

## Evolución futura

Salas NEXUS tendrá un modo compartido estático —URL pública y navegación libre— y NEXUS Live —sala sincronizada por presentador—. Live no pertenece a 1.0 ni introduce todavía audio, vídeo o chat.
