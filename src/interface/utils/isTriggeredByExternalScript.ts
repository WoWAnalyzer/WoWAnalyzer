interface HandledError {
  message: string;
  stack?: string;
  filename?: string;
}

// Some errors are triggered by third party scripts, such as browser plug-ins.
// These errors should generally not affect the application, so we can safely ignore them for
// our error handling. If a plug-in like Google Translate messes with the DOM and that breaks the
// app, that triggers a different error so those third party issues are still handled.
const isTriggeredByExternalScript = (error: HandledError) => {
  if (!error || error.message === 'Script error.') {
    return true;
  }

  // The stack trace includes links to each script involved in the error. Find
  // the first relevant link and check if it was one of our scripts.
  if (!error.stack) {
    return true;
  }
  const paths = error.stack
    .split('\n')
    // The first line may point to the page the error occurred on rather than
    // the script that caused it, so ignore that to avoid false positives.
    .splice(1)
    .map((line) => line.match(/(https?:\/\/[^/]+)\//))
    .filter((line) => line);
  const firstPath = paths[0];
  if (!firstPath) {
    return true;
  }
  if (firstPath[1] !== window.location.origin) {
    return true;
  }

  return false;
};

export default isTriggeredByExternalScript;
