export const resourceStates = Object.freeze(['idle','loading','ready','failed','unsupported']);
export function resourceMessage(state) { return ({ idle:'Recurso aún no solicitado.', loading:'Cargando recurso…', ready:'Recurso disponible.', failed:'El recurso no está disponible. Puedes continuar.', unsupported:'Este recurso no es compatible.' })[state] ?? 'Estado de recurso desconocido.'; }
export function resourceFallback(state) { return { state, message: resourceMessage(state), recoverable: ['failed','unsupported'].includes(state) }; }
