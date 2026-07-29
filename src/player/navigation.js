export function createNavigation(scenes) {
  let index = 0;
  const valid = (value) => Number.isInteger(value) && value >= 0 && value < scenes.length;
  return {
    get index() { return index; }, get total() { return scenes.length; }, get scene() { return scenes[index] ?? null; },
    goTo(value) { if (!valid(value)) return false; index = value; return true; },
    next() { return this.goTo(index + 1); }, previous() { return this.goTo(index - 1); },
    restart() { return this.goTo(0); },
    get progress() { return scenes.length ? { current: index + 1, total: scenes.length, ratio: (index + 1) / scenes.length } : { current: 0, total: 0, ratio: 0 }; }
  };
}
