type ReviewState = { scanIds: string[]; requested: boolean };
type Dependencies = {
  read: () => Promise<string | null>;
  write: (value: string) => Promise<void>;
  available: () => Promise<boolean>;
  request: () => Promise<void>;
};

// Serialize completion events and persist before requesting: retrying the same
// scan, reopening history, or restarting the app must not prompt repeatedly.
export function createBarcodeReviewTracker(deps: Dependencies) {
  let queue = Promise.resolve();
  return (scanId: string) => {
    const task = queue.then(async () => {
      const raw = await deps.read();
      const state: ReviewState = raw ? JSON.parse(raw) : { scanIds: [], requested: false };
      if (state.requested) return;
      if (!state.scanIds.includes(scanId) && state.scanIds.length < 3) {
        state.scanIds.push(scanId);
        await deps.write(JSON.stringify(state));
      }
      if (state.scanIds.length < 3 || !(await deps.available())) return;
      state.requested = true;
      await deps.write(JSON.stringify(state));
      await deps.request();
    });
    queue = task.catch(() => {});
    return task;
  };
}
