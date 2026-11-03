const ownTimeouts = (state) => {
  const originalSet = window.setTimeout;
  const originalClear = window.clearTimeout;
  const pending = new Set();
  let closed = false;
  const schedule = (callback, delay, ...args) => {
    if (typeof callback !== 'function')
      throw state.deny('unsupported owned App timeout callback');
    let handle;
    handle = originalSet.call(
      window,
      (...values) => {
        pending.delete(handle);
        return callback(...values);
      },
      delay,
      ...args
    );
    pending.add(handle);
    return handle;
  };
  const cancel = (handle) => {
    pending.delete(handle);
    originalClear.call(window, handle);
  };
  window.setTimeout = schedule;
  window.clearTimeout = cancel;
  return {
    pendingCount: () => pending.size,
    close: () => {
      if (closed) return;
      closed = true;
      try {
        if (window.setTimeout !== schedule || window.clearTimeout !== cancel)
          throw state.deny('owned App timeout globals replaced');
      } finally {
        pending.forEach((handle) => originalClear.call(window, handle));
        pending.clear();
        window.setTimeout = originalSet;
        window.clearTimeout = originalClear;
      }
    },
  };
};

module.exports = { ownTimeouts };
