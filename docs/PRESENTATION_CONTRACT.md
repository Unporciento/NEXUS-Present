# Contrato de presentación

## Forma y versión

El documento inicial es JSON UTF-8 validado localmente. No contiene funciones, código ejecutable, HTML arbitrario ni instrucciones evaluables. `contractVersion` usa SemVer y el motor rechaza versiones mayores no soportadas; versiones menores se aceptan solo con compatibilidad declarada.

## Campos

| Campo | Tipo | Regla |
|---|---|---|
| `contractVersion` | cadena SemVer | obligatorio |
| `id` | cadena | obligatoria, única, `^[a-z0-9][a-z0-9-]{2,63}$` |
| `version` | cadena SemVer | obligatorio |
| `minimumEngineVersion` | cadena SemVer | obligatorio |
| `title` | cadena | obligatorio, 1–120 caracteres |
| `description` | cadena | opcional, máximo 500 caracteres |
| `author`, `holder` | cadena | opcionales, máximo 120 caracteres |
| `createdAt`, `updatedAt` | ISO 8601 UTC | obligatorios; `updatedAt` no anterior |
| `theme` | objeto o id | obligatorio; valores validados |
| `metadata`, `rights`, `navigation` | objeto | opcionales, valores predeterminados documentados |
| `resources` | lista | opcional, ids únicos |
| `presenter` | objeto | opcional, notas privadas de interfaz |
| `scenes` | lista | obligatorio, 1–200 escenas ordenadas con ids únicos |

Valores predeterminados: navegación habilitada, progreso visible, tema por defecto y listas vacías de recursos/notas. Campos desconocidos generan advertencia y se conservan solo si un prefijo de extensión aprobado los identifica; los demás se ignoran, nunca se ejecutan.

## Referencias y recursos

Una escena referencia recursos por `resourceId`; toda referencia debe existir y su tipo debe ser compatible. URLs permiten `https:` y rutas relativas internas; se bloquean `javascript:`, `data:` salvo política explícita de recurso seguro, credenciales embebidas y orígenes no permitidos. Recursos externos requieren declaración de titularidad/licencia y alternativa cuando sean esenciales.

## Errores y privacidad

La validación acumula errores por ruta de campo, código y mensaje; un documento inválido no inicia reproducción. Las notas de presentador se ocultan en la interfaz de audiencia, pero no constituyen confidencialidad criptográfica: un usuario con acceso al documento puede leerlas.
