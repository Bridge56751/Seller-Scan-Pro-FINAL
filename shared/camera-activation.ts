/**
 * Stop immediately, resume only after focus settles. Canceling the timer also
 * invalidates its callback, so a queued callback cannot restart a hidden camera.
 */
export function createCameraActivationGate(
  changed: (active: boolean) => void,
  delayMs = 250,
  schedule: (callback: () => void, ms: number) => ReturnType<typeof setTimeout> = setTimeout,
  unschedule: (timer: ReturnType<typeof setTimeout>) => void = clearTimeout,
) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let generation = 0;
  let active = false;
  function stop() {
    generation++;
    if (timer !== undefined) unschedule(timer);
    timer = undefined;
    if (active) { active = false; changed(false); }
  }
  function start() {
    if (active || timer !== undefined) return;
    const version = ++generation;
    timer = schedule(() => {
      if (version !== generation) return;
      timer = undefined;
      active = true;
      changed(true);
    }, delayMs);
  }
  return { start, stop, isActive: () => active };
}
