const ignored = new Set(['INPUT','TEXTAREA','SELECT','BUTTON','A']);
export function bindKeyboard(target, player) {
  const handler = (event) => {
    if (ignored.has(event.target?.tagName) || event.target?.isContentEditable) return;
    const actions = { ArrowRight: 'next', ArrowLeft: 'previous', Home: 'restart', End: 'end', Escape: 'pause' };
    if (!actions[event.key]) return; event.preventDefault();
    if (actions[event.key] === 'end') player.goToScene(player.getProgress().total - 1); else player[actions[event.key]]();
  };
  target.addEventListener('keydown', handler); return () => target.removeEventListener('keydown', handler);
}
