// mediaLoadStore.ts
export const loadedMedia = new Set<string>();

// Sequential load queue — limits concurrent media loads
const CONCURRENCY = 6;
let active = 0;
const queue: (() => void)[] = [];

export function requestLoad(cb: () => void) {
  if (active < CONCURRENCY) {
    active++;
    cb();
  } else {
    queue.push(cb);
  }
}

export function cancelLoad(cb: () => void) {
  const idx = queue.indexOf(cb);
  if (idx !== -1) queue.splice(idx, 1);
}

export function signalLoaded() {
  active = Math.max(0, active - 1);
  if (queue.length > 0 && active < CONCURRENCY) {
    active++;
    queue.shift()!();
  }
}
