import CombatLogParser from 'parser/core/CombatLogParser';
import EventEmitter from 'parser/core/modules/EventEmitter';
import Config from 'parser/Config';
import Report from 'parser/core/Report';
import { PlayerInfo } from 'parser/core/Player';
import Fight from 'parser/core/Fight';
import { AnyEvent, CombatantInfoEvent } from 'parser/core/Events';
import SelectedCombatant from '../SelectedCombatant';
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
  _combatant: SelectedCombatant = new TestCombatant(this);
  get selectedCombatant() {
    return this._combatant;
  }
  set selectedCombatant(value) {
    this._combatant = value;
  }

  constructor(
    config: Config = DEFAULT_CONFIG,
    report: Report = DEFAULT_REPORT,
    selectedPlayer: PlayerInfo = DEFAULT_PLAYER_INFO,
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
      undefined,
    );
  }

  processEvents(events: AnyEvent[]) {
    events.forEach((event) => this.getModule(EventEmitter).triggerEvent(event));
  }
}

export default TestCombatLogParser;
