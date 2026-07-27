# Laboratorio — especificación base

## Propósito

Laboratorio será un módulo interno de mantenimiento, diagnóstico y evolución. No pertenece a la experiencia normal de una presentación ni requiere conocimientos de programación para usarse.

Su resultado central será un informe de diagnóstico en texto plano, claro y reproducible, para copiar y pegar en cualquier IA y facilitar la resolución de problemas.

## Estado

Requisito aprobado para una fase futura. Esta documentación no implementa código ni habilita diagnósticos todavía.

## Principios de seguridad

- Diagnosticar antes de proponer y proponer antes de reparar.
- No modificar ni eliminar datos automáticamente.
- No ejecutar reparaciones sin autorización explícita.
- No enviar información a Internet sin consentimiento.
- Conservar solo el historial local que el usuario autorice.

## Cobertura mínima de diagnóstico

El diseño deberá revisar, cuando sea aplicable:

- errores de JavaScript, promesas rechazadas, recursos y errores HTTP;
- Service Worker, Cache Storage, IndexedDB, LocalStorage y SessionStorage;
- estado offline, sincronización, permisos, espacio usado y compatibilidad del navegador;
- tiempo de carga, consumo aproximado de memoria, dependencias y versiones internas;
- módulos sin inicializar, estados inconsistentes y archivos o configuraciones importantes ausentes.

NEXUS Present añadirá comprobaciones propias de su motor de renderizado, temas, contenido y navegación.

## Informe de diagnóstico

El informe incluirá siempre: proyecto, versión, fecha, navegador, sistema operativo, URL, estado general, errores, advertencias, módulos cargados y fallidos, rendimiento básico, almacenamiento, Service Worker, últimos eventos, causa probable cuando sea deducible, pasos de reproducción y recomendaciones.

La interfaz ofrecerá el botón **Copiar informe de diagnóstico**, que copiará el informe completo al portapapeles.

## Estado de salud

Laboratorio calculará una puntuación verificable de 0 a 100 basada en múltiples comprobaciones reales. La interfaz mostrará, como mínimo:

- 🟢 Excelente: 90–100
- 🟡 Atención: 70–89
- 🔴 Revisión necesaria: 0–69

El informe debe desglosar qué comprobaciones afectaron la puntuación; nunca será un valor aleatorio.

## Historial

Conservará diagnósticos para comparar cuándo apareció o desapareció un problema y qué versión lo resolvió. El formato concreto, retención y controles de privacidad se definirán durante la arquitectura.
