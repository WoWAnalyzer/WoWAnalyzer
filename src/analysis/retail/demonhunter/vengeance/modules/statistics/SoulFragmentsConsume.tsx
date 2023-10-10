import SPELLS from 'common/SPELLS/demonhunter';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS/demonhunter';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, ChangeBuffStackEvent, Event, EventType } from 'parser/core/Events';
import EventEmitter from 'parser/core/modules/EventEmitter';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import SoulFragmentsTracker, { MAX_SOUL_FRAGMENTS } from '../features/SoulFragmentsTracker';

const REMOVE_STACK_BUFFER = 100;

export interface ConsumeSoulFragmentsEvent extends Event<EventType.ConsumeSoulFragments> {
  spellId: number;
  numberofSoulFragmentsConsumed: number;
}

class SoulFragmentsConsume extends Analyzer {
  static dependencies = {
    soulFragmentsTracker: SoulFragmentsTracker,
    eventEmitter: EventEmitter,
  };
  castTimestamp?: number;
  trackedSpell?: number;
  totalSoulsConsumedBySpells = 0;
  soulsConsumedBySpell: {
    [spellId: number]: {
      name: string;
      souls: number;
    };
  } = {};
  protected soulFragmentsTracker!: SoulFragmentsTracker;
  protected eventEmitter!: EventEmitter;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.cast
        .by(SELECTED_PLAYER)
        .spell([
          TALENTS_DEMON_HUNTER.SPIRIT_BOMB_TALENT,
          SPELLS.SOUL_CLEAVE,
          TALENTS_DEMON_HUNTER.SOUL_BARRIER_TALENT,
        ]),
      this.onCast,
    );
    this.addEventListener(
      Events.changebuffstack.by(SELECTED_PLAYER).spell(SPELLS.SOUL_FRAGMENT_STACK),
      this.onChangeBuffStack,
    );
  }

  onCast(event: CastEvent) {
    const spellId = event.ability.guid;
    if (!this.soulsConsumedBySpell[spellId]) {
      this.soulsConsumedBySpell[spellId] = {
        name: event.ability.name,
        souls: 0,
      };
    }
    this.castTimestamp = event.timestamp;
    this.trackedSpell = spellId;
  }

  onChangeBuffStack(event: ChangeBuffStackEvent) {
    if (
      event.oldStacks < event.newStacks || // not interested in soul gains
      event.oldStacks > MAX_SOUL_FRAGMENTS
    ) {
      // not interested in overcap corrections
      return;
    }
    if (
      this.castTimestamp !== undefined &&
      event.timestamp - this.castTimestamp < REMOVE_STACK_BUFFER
    ) {
      const consumed = event.oldStacks - event.newStacks;
      if (this.trackedSpell) {
        this.soulsConsumedBySpell[this.trackedSpell].souls += consumed;
        this.totalSoulsConsumedBySpells += consumed;

        this.eventEmitter.fabricateEvent(
          {
            type: EventType.ConsumeSoulFragments,
            timestamp: event.timestamp,
            spellId: this.trackedSpell,
            numberofSoulFragmentsConsumed: consumed,
          },
          event,
        );
      }
    }
  }

  soulCleaveSouls() {
    if (this.soulsConsumedBySpell[SPELLS.SOUL_CLEAVE.id] === undefined) {
      return 0;
    }
    return this.soulsConsumedBySpell[SPELLS.SOUL_CLEAVE.id].souls;
  }

  statistic() {
    const soulsByTouch = this.soulFragmentsTracker.soulsGenerated - this.totalSoulsConsumedBySpells;
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(6)}
        size="flexible"
        dropdown={
          <>
            <table className="table table-condensed">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Souls Consumed</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(this.soulsConsumedBySpell).map((e, i) => (
                  <tr key={i}>
                    <th>{e.name}</th>
                    <td>{e.souls}</td>
                  </tr>
                ))}
                <tr>
                  <th>Overcapped</th>
                  <td>{this.soulFragmentsTracker.overcap}</td>
                </tr>
                <tr>
                  <th>By Touch</th>
                  <td>{soulsByTouch}</td>
                </tr>
              </tbody>
            </table>
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.SOUL_FRAGMENT_STACK}>
          {this.soulFragmentsTracker.soulsSpent} <small>Souls</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SoulFragmentsConsume;
