function ga() {
  if (window.ga !== undefined) {
    return window.ga.getAll()[0];
  }
  return undefined;
}
function installed() {
  return ga !== undefined;
}

export function install() {}

export function track(oldLocation, newLocation) {
  if (installed()) {
    ga().set('page', newLocation);
    ga().send('pageview');
  }
}
