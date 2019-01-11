export const SELECTED_PLAYER = 1;
export const SELECTED_PLAYER_PET = 2;
const VALID_BY_FLAGS = SELECTED_PLAYER | SELECTED_PLAYER_PET;

class EventFilter {
  eventType;
  constructor(eventType) {
    this.eventType = eventType;
  }
  _by;
  /**
   * @param {number} value
   * @returns {EventFilter}
   */
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
  /**
   * @param {number} value
   * @returns {EventFilter}
   */
  to(value) {
    if (value === undefined) {
      return this._to;
    }
    this._to = value;
    return this;
  }
  _spell;
  /**
   * @param {object} value
   * @returns {EventFilter}
   */
  spell(value) {
    if (value === undefined) {
      return this._spell;
    } else if (typeof value !== 'object') {
      throw new Error('The spell filter must be a spell object, not a spell id.');
    }
    this._spell = value;
    return this;
  }
}

export default EventFilter;
