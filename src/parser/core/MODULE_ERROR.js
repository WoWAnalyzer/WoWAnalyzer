//states modules can be disabled in due to errors alongside the description to show in the degraded experience toaster
const MODULE_ERROR = {
  INITIALIZATION: "initialization",
  EVENTS: "event handling",
  RESULTS: "result generation",
  DEPENDENCY: "one or more dependencies",
};

export default MODULE_ERROR;
