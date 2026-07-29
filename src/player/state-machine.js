const TRANSITIONS = Object.freeze({
  idle: ['loading', 'destroyed'], loading: ['ready', 'error', 'destroyed'], ready: ['presenting', 'destroyed'],
  presenting: ['paused', 'completed', 'error', 'destroyed'], paused: ['presenting', 'ready', 'destroyed'],
  completed: ['presenting', 'ready', 'destroyed'], error: ['idle', 'destroyed'], destroyed: []
});

export function createStateMachine(initial = 'idle') {
  let state = initial;
  return {
    get state() { return state; },
    can(next) { return TRANSITIONS[state].includes(next); },
    transition(next) { if (!this.can(next)) throw new Error(`Invalid transition: ${state} -> ${next}`); state = next; return state; }
  };
}
