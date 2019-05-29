const KEY = 'message';

/**
 * Start listening command
 * @param command
 * @param callback
 */
export const listen = (command, callback) => {
  const handler = cmd => cb => ((e) => {
    const message = JSON.parse(e.originalEvent.newValue);
    if (message && message.command === cmd) {
      cb(message.data);
    }
  });
  window.addEventListener('storage', handler(command)(callback));
};
/**
 * Broadcast command
 * @param command {string}
 * @param data {*}
 */
export const broadcast = (command, data) => {
  localStorage.setItem(KEY, JSON.stringify({ command, data }));
  localStorage.removeItem(KEY);
};


