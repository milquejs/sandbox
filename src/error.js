window.addEventListener('error', error, true);
window.addEventListener('unhandledrejection', error, true);

let errored = false;
export function error(e) {
  if (errored) {
    return;
  }
  if (typeof e === 'object') {
    if (e instanceof PromiseRejectionEvent) {
      error(e.reason);
    } else if (e instanceof ErrorEvent) {
      error(e.error);
    } else if (e instanceof Error) {
      window.alert(e.stack);
    } else {
      window.alert(JSON.stringify(e));
    }
  } else {
    window.alert(e);
  }
  errored = true;
}
