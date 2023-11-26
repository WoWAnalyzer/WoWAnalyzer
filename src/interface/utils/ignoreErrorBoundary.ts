import isTriggeredByExternalScript from './isTriggeredByExternalScript';

const ignoreErrorBoundary = (error: Error | undefined) => {
  if (!error) {
    return true;
  }
  // NOTE: These filters only prevent the error state from being triggered. Sentry automatically logs them regardless.
  if (isTriggeredByExternalScript(error)) {
    console.log('Ignored because it looks like a third party error.');
    return true;
  }

  return false;
};

export default ignoreErrorBoundary;
