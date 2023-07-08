import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, EventType, HealEvent } from 'parser/core/Events';
import EventEmitter from 'parser/core/modules/EventEmitter';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';

import CooldownThroughputTracker from '../features/CooldownThroughputTracker';

/**
 * When your health is brought below 35%, you instantly heal for 20% of your maximum health.
 * Cannot occur more than once every 45 sec.
 *
 * As this talent has no cast event, but you should still be able to see it on the timeline,
 * this module creates that event whenever this talent heals the player.
 */
class NaturesGuardian extends Analyzer {
  static dependencies = {
    eventEmitter: EventEmitter,
    cooldownThroughputTracker: CooldownThroughputTracker,
  };

  protected eventEmitter!: EventEmitter;
  protected cooldownThroughputTracker!: CooldownThroughputTracker;

  healing = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.NATURES_GUARDIAN_TALENT);

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.NATURES_GUARDIAN_HEAL),
      this._onHeal,
    );
  }

  _onHeal(event: HealEvent) {
    const fabricatedCastEvent: CastEvent = {
      ability: {
        ...event.ability,
        guid: TALENTS.NATURES_GUARDIAN_TALENT.id,
      },
      sourceID: event.sourceID,
      sourceIsFriendly: event.sourceIsFriendly,
      targetIsFriendly: event.targetIsFriendly,
      timestamp: event.timestamp,
      type: EventType.Cast,
    };

    this.eventEmitter.fabricateEvent(fabricatedCastEvent, event);

    this.healing += event.amount + (event.absorbed || 0);
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink spell={TALENTS.NATURES_GUARDIAN_TALENT} />}
        value={`${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing))} %`}
      />
    );
  }
}

export default NaturesGuardian;
