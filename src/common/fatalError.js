export default function fatalError(error) {
  window.Raven && window.Raven.captureException(error); // eslint-disable-line no-undef
  console.error(error);
}
