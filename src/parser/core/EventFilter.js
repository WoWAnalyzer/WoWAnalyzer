export const SELECTED_PLAYER = 1;
export const SELECTED_PLAYER_PET = 2;
const VALID_BY_FLAGS = SELECTED_PLAYER | SELECTED_PLAYER_PET;

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
    if (!this.constructor.validateBy(value)) {
      throw new Error(`by filter not recognized: ${value}`);
    }
    this._by = value;
    return this;
  }
  static validateBy(value) {
    return (value & VALID_BY_FLAGS) === value;
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
