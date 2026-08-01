# Matriz de compatibilidad 1.0

## Navegadores y dispositivos

| Entorno | Estado | Observación |
|---|---|---|
| Chromium escritorio | validado mediante navegador integrado | Entrada, Biblioteca, Studio, IndexedDB, multimedia, ZIP y Player por HTTP |
| Chrome escritorio externo | pendiente de conexión final | no disponible en la sesión de cierre |
| Safari iPhone físico | pendiente | IndexedDB, descargas, codecs y pantalla completa requieren dispositivo |
| Safari macOS | pendiente | revisar descargas, video H.264/AAC y VoiceOver |
| Android Chrome físico | pendiente | revisar picker, cuotas, video y TalkBack |
| Firefox escritorio | pendiente | validar ZIP, IndexedDB, fullscreen y foco |

## Responsive emulado

Se revisan en navegador real de escritorio con tamaños emulados, no en hardware móvil: 320×568, 360×640, 375×667, 390×844, 412×915, 768×1024, 820×1180, 1024×768, 1366×768 y 1920×1080. Criterios: sin overflow horizontal, controles ≥44 px, foco visible, zoom 200 %, orientación, textos largos y movimiento reducido.

El cierre 1.0 ejecutó 40 combinaciones de página/tamaño sobre Entrada, Biblioteca, Studio y Player: ninguna mostró overflow horizontal y el control visible mínimo midió 44 px. La prueba fue emulada en navegador real de escritorio, no en hardware móvil. El zoom nativo automatizado no produjo una señal verificable y permanece como comprobación física/manual.

Codecs nunca se infieren por extensión: `canPlayType` decide y el Player ofrece fallback recuperable. MP4/H.264/AAC y WebM dependen de plataforma; NEXUS no transcodifica.
