import CombatLogParser from 'parser/core/CombatLogParser';

class TestCombatLogParser extends CombatLogParser {
  static defaultModules = {};

  toPlayer = jest.fn(() => true);
  byPlayer = jest.fn(() => true);
  toPlayerPet = jest.fn(() => true);
  byPlayerPet = jest.fn(() => true);
  triggerEvent = jest.fn(super.triggerEvent);

  get currentTimestamp() {
    return super.currentTimestamp;
  }
  set currentTimestamp(value) {
    this._timestamp = value;
  }
  _combatant = {
    hasBuff: jest.fn(() => true),
    hasTalent: jest.fn(() => true),
    hasFinger: jest.fn(() => true),
  };
  get selectedCombatant() {
    return this._combatant;
  }
  set selectedCombatant(value) {
    this._combatant = value;
  }

  constructor(
    report = {
      friendlyPets: [],
    },
    selectedPlayer = {
      id: 1,
    },
    selectedFight = {
      start_time: 0,
    },
    combatantInfoEvents = []
  ) {
    super(report, selectedPlayer, selectedFight, combatantInfoEvents);
  }

  processEvents(events) {
    events.forEach(event => this.triggerEvent(event));
  }
}

export default TestCombatLogParser;
