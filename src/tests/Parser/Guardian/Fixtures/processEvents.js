//TODO: Need to move this to a central shared test location
export function processEvents(events, module) {
  events.forEach(event => {
    module.triggerEvent('toPlayer_' + event.type, event);
    module.triggerEvent('byPlayer_' + event.type, event);
  });
}
