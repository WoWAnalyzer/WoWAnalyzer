import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';

import CooldownThroughputTracker from '../Features/CooldownThroughputTracker';
/**
 * When your health is brought below 35%, you instantly heal for 20% of your maximum health.
 * Cannot occur more than once every 45 sec.
 * 
 * As this talent has no cast event, but you should still be able to see it on the timeline,
 * this module creates that event whenever this talent heals the player.
 */
class NaturesGuardian extends Analyzer {
  static dependencies = {
    cooldownThroughputTracker: CooldownThroughputTracker,
  };
  healing = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.NATURES_GUARDIAN_TALENT.id);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (spellId !== SPELLS.NATURES_GUARDIAN_HEAL.id) {
      return;
    }

    const castEvent = {...event};
    castEvent.ability.guid = SPELLS.NATURES_GUARDIAN_TALENT.id;
    castEvent.type = 'cast';
    this.owner.fabricateEvent(castEvent, event);

    this.healing += event.amount;
  }

  get feeding() {
    return this.cooldownThroughputTracker.getIndirectHealing(SPELLS.NATURES_GUARDIAN_HEAL.id);
  }

  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.NATURES_GUARDIAN_TALENT.id} />
        </div>
        <div className="flex-sub text-right">
          {formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing + this.feeding))} %
        </div>
      </div>
    );
  }
}

export default NaturesGuardian;
