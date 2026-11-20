export function createPhotoConsent(deps: {
  read: () => Promise<string | null>;
  write: () => Promise<void>;
  ask: () => Promise<boolean>;
}) {
  let pending: Promise<boolean> | null = null;
  return () => {
    if (pending) return pending;
    pending = (async () => {
      if (await deps.read() === "accepted") return true;
      if (!await deps.ask()) return false;
      // Fail closed if consent cannot be saved.
      await deps.write();
      return true;
    })().finally(() => { pending = null; });
    return pending;
  };
}
