const handleErrorEventBoundary = (event: ErrorEvent) => {
  const { error } = event;
  // XXX Ignore errors that will be processed by componentDidCatch.
  // SEE: https://github.com/facebook/react/issues/10474
  if (error && error.stack && error.stack.includes('invokeGuardedCallbackDev')) {
    return;
  }
  console.log('Caught a global error');

  return error;
};

export default handleErrorEventBoundary;
