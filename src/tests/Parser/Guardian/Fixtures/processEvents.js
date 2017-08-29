//TODO: Need to move this to a central shared test location
export function processEvents(events, module) {
  events.forEach(event => {
    module.triggerEvent(event.type, event);
  });
}
