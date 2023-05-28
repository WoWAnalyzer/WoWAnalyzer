module.exports = async () => {
  // Give env.LOCALE a value. This variable should be used in the app so that
  // we can force the app to use a specific locale.
  // This is important because snapshots contain numbers that are formatted using
  // 'en-US' locale and without this, updating the snapshots will cause unecessary
  // changes.
  process.env.LOCALE = 'en-US';
};
