import CombatLogParser from 'parser/core/CombatLogParser';
import EventEmitter from 'parser/core/modules/EventEmitter';
import Config from 'parser/Config';
import Report from 'parser/core/Report';
import { PlayerDetails } from 'parser/core/Player';
import Fight from 'parser/core/Fight';
import { AnyEvent, CombatantInfoEvent } from 'parser/core/Events';
import Combatant from 'parser/core/Combatant';
import TestCombatant from 'parser/core/tests/TestCombatant';
import {
  DEFAULT_CHARACTER_PROFILE,
  DEFAULT_CONFIG,
  DEFAULT_FIGHT,
  DEFAULT_PLAYER_INFO,
  DEFAULT_REPORT,
} from 'parser/core/tests/constants';

class TestCombatLogParser extends CombatLogParser {
  static defaultModules = {};

  toPlayer = vi.fn(() => true);
  byPlayer = vi.fn(() => true);
  toPlayerPet = vi.fn(() => true);
  byPlayerPet = vi.fn(() => true);

  get currentTimestamp() {
    return super.currentTimestamp;
  }
  set currentTimestamp(value) {
    this._timestamp = value;
  }
  _combatant: Combatant = new TestCombatant(this);
  get selectedCombatant() {
    return this._combatant;
  }
  set selectedCombatant(value) {
    this._combatant = value;
  }

  constructor(
    config: Config = DEFAULT_CONFIG,
    report: Report = DEFAULT_REPORT,
    selectedPlayer: PlayerDetails = DEFAULT_PLAYER_INFO,
    selectedFight: Fight = DEFAULT_FIGHT,
    combatantInfoEvents: CombatantInfoEvent[] = [],
  ) {
    super(
      config,
      report,
      selectedPlayer,
      selectedFight,
      combatantInfoEvents,
      DEFAULT_CHARACTER_PROFILE,
    );
  }

  processEvents(events: AnyEvent[]) {
    events.forEach((event) => this.getModule(EventEmitter).triggerEvent(event));
  }
}

export default TestCombatLogParser;
