import CombatLogParser from 'parser/core/CombatLogParser';
import EventEmitter from 'parser/core/modules/EventEmitter';

class TestCombatLogParser extends CombatLogParser {
  static defaultModules = {};

  toPlayer = jest.fn(() => true);
  byPlayer = jest.fn(() => true);
  toPlayerPet = jest.fn(() => true);
  byPlayerPet = jest.fn(() => true);

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
      // use fight interface when converting to TS
      // eslint-disable-next-line @typescript-eslint/camelcase
      start_time: 0,
      // eslint-disable-next-line @typescript-eslint/camelcase
      offset_time: 0,
      filtered: false,
    },
    combatantInfoEvents = [],
  ) {
    super(report, selectedPlayer, selectedFight, combatantInfoEvents);
  }

  processEvents(events) {
    events.forEach(event => this.getModule(EventEmitter).triggerEvent(event));
  }
}

export default TestCombatLogParser;
