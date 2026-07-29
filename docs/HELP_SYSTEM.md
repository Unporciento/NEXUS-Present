# Ayuda integrada

Ayuda es un diálogo breve disponible desde el encabezado de Studio. Resume cómo empezar, tipos de escenas, temas, validación, vista previa, descarga, límites y preguntas frecuentes. Sus secciones desplegables usan elementos semánticos `details` y `summary`.

`Repetir tutorial` borra únicamente la preferencia versionada del onboarding y abre el tutorial. Cerrar Ayuda mediante botón o Escape devuelve el foco al botón que la abrió. En 320×568, el diálogo usa scroll vertical interno sin crear scroll horizontal; ambas acciones finales son alcanzables por teclado. El sistema no consulta Internet, no guarda contenido y no crea un centro documental paralelo.

## Terminología visible

| Identificador interno | Nombre visible |
| --- | --- |
| `cover` | Portada |
| `statement` | Declaración |
| `content` | Contenido |
| `media` | Multimedia |
| `comparison` | Comparación |
| `evidence` | Evidencia |
| `closing` | Cierre |

Los contratos conservan los identificadores internos. La interfaz usa “vista previa”, “Cerrar vista previa”, “Actualizar vista previa” y “Descargar presentación”; `Formato JSON` permanece como aclaración secundaria.

Los diseños visibles son Destacado, Centrado, Dividido, Comparación, Multimedia a la izquierda/derecha, Métrica destacada, Cita destacada, Cuadrícula de evidencias y Cierre destacado. Sus IDs contractuales no cambian.
