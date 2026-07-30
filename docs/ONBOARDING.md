# Onboarding de NEXUS Studio

## Propósito y versión

El tutorial `1.0` explica qué es Studio, datos generales, escenas, edición, validación, vista previa y descarga JSON. Es breve, omitible, cerrable, funciona sin conexión y puede repetirse desde Ayuda.

`createOnboardingPreference` usa exclusivamente la clave `nexus:onboarding-version`. Si la versión guardada no coincide, el tutorial reaparece. Si el almacenamiento no está disponible, Studio sigue funcionando y el tutorial puede mostrarse de nuevo.

Esta clave solo recuerda que el tutorial fue visto. No contiene borradores, presentaciones, escenas, historial, selección, validación ni datos privados. Es la única persistencia incorporada en Fase 5E.

## Accesibilidad y ciclo de vida

El contenido vive en un diálogo con título accesible, orden lógico, botones `Omitir` y `Comenzar`, foco inicial y retorno al control de Ayuda cuando corresponde. `destroy()` retira el listener y cierra cualquier diálogo abierto. No existen temporizadores, actividad continua ni dependencia de red.
