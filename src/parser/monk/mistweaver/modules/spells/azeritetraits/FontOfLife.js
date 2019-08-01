import React from 'react';

import { calculateAzeriteEffects } from 'common/stats';
import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import SpellLink from 'common/SpellLink';

import StatTracker from 'parser/shared/modules/StatTracker';
import Analyzer from 'parser/core/Analyzer';
import Combatants from 'parser/shared/modules/Combatants';
import AzeritePowerStatistic from 'interface/statistics/AzeritePowerStatistic';
import { calculateTraitHealing } from 'parser/shared/modules/helpers/CalculateTraitHealing';

import { ESSENCE_FONT_SPELLPOWER_COEFFICIENT } from '../../../constants';

class FontOfLife extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    statTracker: StatTracker,
    abilityTracker: AbilityTracker,
  };

  getAbility = spellId => this.abilityTracker.getAbility(spellId);
  /**
   * Your Essence Font's initial heal is increased by 150 and has a chance to reduce the cooldown of Thunder Focus Tea by 1 sec.
   */
  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.FONT_OF_LIFE.id);
    if (!this.active) {
      return;
    }
    const ranks = this.selectedCombatant.traitRanks(SPELLS.UPLIFTED_SPIRITS.id) || [];
    this.traitRawHealing = ranks.reduce((total, rank) => total + calculateAzeriteEffects(SPELLS.UPLIFTED_SPIRITS.id, rank)[0], 0);
  }

  healing = 0;
  baseHeal = 0
  traitRawHealing = 0;

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (spellId !== SPELLS.ESSENCE_FONT_BUFF.id || event.tick === true) {
      return;
    }

    this.healing += calculateTraitHealing(this.statTracker.currentIntellectRating, ESSENCE_FONT_SPELLPOWER_COEFFICIENT, this.traitRawHealing, event).healing;
  }

  statistic() {
    return (
      <AzeritePowerStatistic
        size="flexible"
        tooltip={`Added a total of ${formatNumber(this.healing)} to your Essence Font Bolts.`}
      >
        <div className="pad">
          <label><SpellLink id={SPELLS.FONT_OF_LIFE.id} /></label>

          <div className="value" style={{ marginTop: 15 }}>
          <img
            src="/img/healing.png"
            alt="Healing"
            className="icon"
          /> 
          { formatPercentage(this.healing / this.getAbility(SPELLS.ESSENCE_FONT_BUFF.id).healingEffective)}% <small>of Essence Font Healing</small>
          </div>
        </div>

      </AzeritePowerStatistic>
    );
  }

}

export default FontOfLife;
