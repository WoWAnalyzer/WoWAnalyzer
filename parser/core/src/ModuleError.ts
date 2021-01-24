//states modules can be disabled in due to errors alongside the description to show in the degraded experience toaster
enum ModuleError {
  INITIALIZATION = "initialization",
  EVENTS = "event handling",
  RESULTS = "result generation",
  DEPENDENCY = "one or more dependencies",
}

export default ModuleError;
