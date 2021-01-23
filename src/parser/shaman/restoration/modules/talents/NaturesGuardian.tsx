import React from 'react';

import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import { formatPercentage } from 'common/format';
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
    this.active = this.selectedCombatant.hasTalent(SPELLS.NATURES_GUARDIAN_TALENT.id);

    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.NATURES_GUARDIAN_HEAL), this._onHeal);
  }

  _onHeal(event: HealEvent) {
    const fabricatedCastEvent: CastEvent = {
      ability: {
        ...event.ability,
        guid: SPELLS.NATURES_GUARDIAN_TALENT.id,
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

  get feeding() {
    return this.cooldownThroughputTracker.getIndirectHealing(SPELLS.NATURES_GUARDIAN_HEAL.id);
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink id={SPELLS.NATURES_GUARDIAN_TALENT.id} />}
        value={`${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing + this.feeding))} %`}
      />
    );
  }
}

export default NaturesGuardian;
