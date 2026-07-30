export function bindPersistenceUi(root, session) {
  let destroyed = false;
  const button = root.querySelector?.('[data-save]');
  const status = root.querySelector?.('#save-status');
  const render = (state) => {
    if (status) status.textContent = state.message;
    if (button) {
      button.disabled = state.status === 'saving' || state.status === 'destroyed';
      button.setAttribute('aria-busy', String(state.status === 'saving'));
    }
  };
  const click = (event) => {
    if (event.target?.closest?.('[data-save]')) session.save();
  };
  root.addEventListener('click', click);
  const stop = session.subscribe(render);
  render(session.getState());
  return {
    destroy() {
      if (destroyed) return;
      destroyed = true;
      stop();
      root.removeEventListener('click', click);
      session.destroy();
    }
  };
}
