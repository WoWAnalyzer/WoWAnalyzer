import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import EventEmitter from 'parser/core/modules/EventEmitter';
import Events, { EventType, HealEvent, RefreshBuffEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS';

/**
 * **Tranquility**
 * Heals all allies within 40 yards for [(59% of Spell power) * 5] over 8 sec.
 * Each heal heals the target for another (6.88% of Spell power) over 8 sec, stacking.
 * Healing increased by 100% when not in a raid.
 */
class Tranquility extends Analyzer {
  static dependencies = {
    eventEmitter: EventEmitter,
  };

  eventEmitter!: EventEmitter;

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.TRANQUILITY_HEAL),
      this.onTranqHeal,
    );
  }

  /**
   * When tranquility directly heals it refreshes the HoT, but no refresh buff event is emitted.
   * This fabricates the event.
   */
  onTranqHeal(event: HealEvent) {
    if (!event.tick) {
      const refreshTranq: RefreshBuffEvent = {
        ability: event.ability,
        sourceID: event.sourceID,
        sourceIsFriendly: event.sourceIsFriendly,
        targetID: event.targetID,
        targetIsFriendly: event.targetIsFriendly,
        type: EventType.RefreshBuff,
        timestamp: event.timestamp,
      };

      this.eventEmitter.fabricateEvent(refreshTranq, event);
    }
  }
}

export default Tranquility;
