import CombatLogParser from 'parser/core/CombatLogParser';
import EventEmitter from 'parser/core/modules/EventEmitter';
import Config from 'parser/Config';
import Report from 'parser/core/Report';
import { PlayerInfo } from 'parser/core/Player';
import Fight from 'parser/core/Fight';
import { AnyEvent, CombatantInfoEvent } from 'parser/core/Events';
import CharacterProfile from 'parser/core/CharacterProfile';
import { PetInfo } from 'parser/core/Pet';
import Combatant from 'parser/core/Combatant';
import TestCombatant from 'parser/core/tests/TestCombatant';

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
  _combatant: Combatant = new TestCombatant(this);
  get selectedCombatant() {
    return this._combatant;
  }
  set selectedCombatant(value) {
    this._combatant = value;
  }

  constructor(
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    config: Config = {} as Config,
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    report: Report = { friendlies: [] as PlayerInfo[], friendlyPets: [] as PetInfo[] } as Report,
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    selectedPlayer: PlayerInfo = { id: 1 } as PlayerInfo,
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    selectedFight: Fight = { start_time: 0, offset_time: 0, filtered: false } as Fight,
    combatantInfoEvents: CombatantInfoEvent[] = [],
  ) {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    super(
      config,
      report,
      selectedPlayer,
      selectedFight,
      combatantInfoEvents,
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      {} as CharacterProfile,
      undefined,
    );
  }

  processEvents(events: AnyEvent[]) {
    events.forEach((event) => this.getModule(EventEmitter).triggerEvent(event));
  }
}

export default TestCombatLogParser;
