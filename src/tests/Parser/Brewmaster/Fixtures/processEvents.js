export default function processEvents(events, ...modules) {
  events.forEach((event) => {
    modules.forEach(module => {
      module.triggerEvent(event.type, event);
    });
  });
}
