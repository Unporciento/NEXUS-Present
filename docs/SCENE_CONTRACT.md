# Contrato de escenas

## Interfaz común

Cada tipo registrado declara `typeId`, `validate`, `render`, `activate`, `deactivate` y `dispose`.

| Operación | Tipo | Obligación |
|---|---|---|
| `validate(data, resources)` | síncrona | devuelve errores acumulables, sin efectos laterales |
| `render(context)` | síncrona | crea interfaz semántica sin iniciar actividad |
| `activate(context, signal)` | síncrona o asíncrona | inicia recursos propios; respeta cancelación |
| `deactivate(context)` | síncrona o asíncrona | pausa actividad al perder foco |
| `dispose(context)` | síncrona o asíncrona | libera recursos antes de descartar la escena |

Hooks opcionales: `getAccessibility`, `getReducedMotionBehavior`, `handleMissingResource` y `handleRecoverableError`. Sin hook, el motor ofrece alternativa textual, movimiento nulo y error recuperable estándar.

## Límites

- Una escena no navega globalmente, no altera otras escenas y no accede a almacenamiento.
- Toda operación asíncrona recibe `AbortSignal`; al desactivar o descartar se cancela.
- `dispose` elimina listeners, temporizadores, observadores, nodos temporales, reproductores y referencias a multimedia.
- La escena declara nombre accesible, orden de foco, alternativa de contenido y comportamiento con movimiento reducido.
- Recurso ausente: sustituto accesible, registro y continuidad de navegación.
- Error recuperable: estado de escena, acción de reintento o salida; nunca bloqueo silencioso.
- Las intenciones de movimiento son semánticas (`reveal`, `emphasize`, `compare`, `transition`, `focus`, `exit`); los temas deciden su representación o la omiten con movimiento reducido.
