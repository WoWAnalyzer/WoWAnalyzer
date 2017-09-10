export function processEvents(events, module) {
  events.forEach(event => {
    module.triggerEvent(event.type, event);
  });
}
