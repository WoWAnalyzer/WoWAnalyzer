// TODO: Need to move this to a central shared test location
export default function processEvents(events, module) {
  events.forEach(event => {
    module.triggerEvent(event);
  });
}
