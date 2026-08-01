# Matriz de compatibilidad 1.0 RC

## Navegadores y dispositivos

| Entorno | Estado | Observación |
|---|---|---|
| Chromium escritorio | validado mediante navegador integrado | Biblioteca, Studio, ZIP y Player portable por HTTP |
| Chrome escritorio externo | pendiente de conexión final | no disponible en la sesión de cierre |
| Safari iPhone físico | pendiente | IndexedDB, descargas, codecs y pantalla completa requieren dispositivo |
| Safari macOS | pendiente | revisar descargas, video H.264/AAC y VoiceOver |
| Android Chrome físico | pendiente | revisar picker, cuotas, video y TalkBack |
| Firefox escritorio | pendiente | validar ZIP, IndexedDB, fullscreen y foco |

## Responsive emulado

Se revisan en navegador real de escritorio con tamaños emulados, no en hardware móvil: 320×568, 360×640, 375×667, 390×844, 412×915, 768×1024, 820×1180, 1024×768, 1366×768 y 1920×1080. Criterios: sin overflow horizontal, controles ≥44 px, foco visible, zoom 200 %, orientación, textos largos y movimiento reducido.

La corrección de Fase 8 añadió tracks `minmax(0, 1fr)`, hijos reducibles y controles de formulario al 100 %. La medición observable confirmó 45.6 px mínimos y ausencia de overflow en 320, 390, 768 y 1366; la matriz completa se repite al cerrar RC.

Codecs nunca se infieren por extensión: `canPlayType` decide y el Player ofrece fallback recuperable. MP4/H.264/AAC y WebM dependen de plataforma; NEXUS no transcodifica.
