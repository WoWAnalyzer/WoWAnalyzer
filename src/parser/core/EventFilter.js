class EventFilter {
  event;
  constructor(event) {
    this.event = event;
  }
  by;
  by(by) {
    this.by = by;
    return this;
  }
  spell;
  spell(spell) {
    this.spell = spell;
    return this;
  }
}

export default EventFilter;
