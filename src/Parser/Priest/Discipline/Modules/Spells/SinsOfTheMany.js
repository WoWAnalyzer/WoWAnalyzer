import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';

import DualStatisticBox, { STATISTIC_ORDER } from 'Main/DualStatisticBox';
import { formatPercentage, formatNumber } from 'common/format';
import Combatants from 'Parser/Core/Modules/Combatants';
import Analyzer from 'Parser/Core/Analyzer';

import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';
import isAtonement from '../Core/isAtonement';
import Atonement from './Atonement';

const SINS_OF_THE_MANY_BASE_BONUS = 0.12;
const SINS_OF_THE_MANY_FLOOR_BONUS = 0.03;

/**
 * Sins allows you to have one Atonement active whilst keeping the full bonus
 * from the passive. Hence this map should be seen as overrides for a linear
 * progression from the max to the floor per Atonement active.
 */
const BONUS_DAMAGE_MAP = {
  1: 0.12,
};

class SinsOfTheMany extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    atonement: Atonement,
  };

  bonusDamage = 0;
  bonusHealing = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SINS_OF_THE_MANY_TALENT.id);
  }

  get currentBonus() {
    const baseBonus = SINS_OF_THE_MANY_BASE_BONUS * 100;
    const floorBonus = SINS_OF_THE_MANY_FLOOR_BONUS * 100;
    const activeBuffs = this.atonement.numAtonementsActive;

    // Return an override, if necessary
    if (BONUS_DAMAGE_MAP[activeBuffs]) return BONUS_DAMAGE_MAP[activeBuffs];

    // Return the floor if we're below it
    if (floorBonus >= baseBonus - activeBuffs) {
      return SINS_OF_THE_MANY_FLOOR_BONUS;
    }

    // Return the calculated bonus
    return (baseBonus - activeBuffs) / 100;
  }

  /**
   * Sins of the Many buffs all of your damage, there is no whitelist
   */
  on_byPlayer_damage(event) {
    this.bonusDamage += calculateEffectiveDamage(event, this.currentBonus);
  }

  on_byPlayerPet_damage(event) {
    this.bonusDamage += calculateEffectiveDamage(event, this.currentBonus);
  }

  /**
   * This is whitelisted by virtue of Atonement naturally not occuring
   * from abilities not in the whitelist.
   */
  on_byPlayer_heal(event) {
    if (!isAtonement(event)) {
      return;
    }

    this.bonusHealing += calculateEffectiveHealing(event, this.currentBonus);
  }

  statistic() {
    return (
      <DualStatisticBox
        icon={<SpellIcon id={SPELLS.SINS_OF_THE_MANY_TALENT.id} />}
        values={[
          `${formatNumber(
            (this.bonusHealing / this.owner.fightDuration) * 1000
          )} HPS`,
          `${formatNumber(
            (this.bonusDamage /
              this.owner.fightDuration) *
              1000
          )} DPS`,
        ]}
        footer={(
          <dfn
            data-tip={`
              The effective healing contributed by Sins of the Many was ${formatPercentage(
                this.owner.getPercentageOfTotalHealingDone(this.bonusHealing)
              )}% of total healing done.

              The direct damage contributed by Sins of the Many was ${formatPercentage(
                this.owner.getPercentageOfTotalDamageDone(this.bonusDamage)
              )}% of total damage done.
            `}
          >
            Sins of the Many Output Details
          </dfn>
        )}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL();
}

export default SinsOfTheMany;
