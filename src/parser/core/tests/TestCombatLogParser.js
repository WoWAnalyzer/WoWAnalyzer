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
    has4PieceByTier: jest.fn(() => false),
    id: 1,
  };
  get selectedCombatant() {
    return this._combatant;
  }
  set selectedCombatant(value) {
    this._combatant = value;
  }

  constructor(
    config = {},
    report = {
      friendlyPets: [],
    },
    selectedPlayer = {
      id: 1,
    },
    selectedFight = {
      // use fight interface when converting to TS

      start_time: 0,

      offset_time: 0,
      filtered: false,
    },
    combatantInfoEvents = [],
  ) {
    super(config, report, selectedPlayer, selectedFight, combatantInfoEvents);
  }

  processEvents(events) {
    events.forEach((event) => this.getModule(EventEmitter).triggerEvent(event));
  }
}

export default TestCombatLogParser;
