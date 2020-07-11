export const SELECTED_PLAYER = 1;
export const SELECTED_PLAYER_PET = 2;
const VALID_BY_FLAGS = SELECTED_PLAYER | SELECTED_PLAYER_PET;

export type SpellInfo = { id: number };
export type SpellFilter = SpellInfo | Array<SpellInfo>;

class EventFilter<T extends string> {
  eventType: T;
  constructor(eventType: T) {
    this.eventType = eventType;
  }
  private _by: number | undefined;
  by(value: number) {
    if (!EventFilter.validateBy(value)) {
      throw new Error(`by filter not recognized: ${value}`);
    }
    this._by = value;
    return this;
  }
  getBy() {
    return this._by;
  }
  static validateBy(value: number) {
    return (value & VALID_BY_FLAGS) === value;
  }
  private _to: number | undefined;
  to(value: number) {
    // TODO: Allow `this.selectedCombatant` (i.e. instances of Combatant) as value instead
    this._to = value;
    return this;
  }
  getTo() {
    return this._to;
  }
  private _spell: SpellFilter | undefined;
  spell(value: SpellFilter) {
    // TODO: Use spell id instead
    if (typeof value !== 'object') {
      throw new Error(
        'The spell filter must be a spell object, not a spell id.',
      );
    }
    this._spell = value;
    return this;
  }
  getSpell() {
    return this._spell;
  }
}

export default EventFilter;
