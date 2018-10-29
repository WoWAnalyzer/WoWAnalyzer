class EventFilter {
  eventType;
  constructor(eventType) {
    this.eventType = eventType;
  }
  _by;
  by(value) {
    if (value === undefined) {
      return this._by;
    }
    this._by = value;
    return this;
  }
  _to;
  to(value) {
    if (value === undefined) {
      return this._to;
    }
    this._to = value;
    return this;
  }
  _spell;
  spell(value) {
    if (value === undefined) {
      return this._spell;
    }
    this._spell = value;
    return this;
  }
}

export default EventFilter;
