import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage, formatNumber } from 'common/format';
import DualStatisticBox, { STATISTIC_ORDER } from 'interface/others/DualStatisticBox';
import Combatants from 'parser/shared/modules/Combatants';
import Analyzer, { SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { DamageEvent, HealEvent } from 'parser/core/Events';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import calculateEffectiveHealing from 'parser/core/calculateEffectiveHealing';
import { Options } from 'parser/core/Module';

import isAtonement from '../core/isAtonement';
import Atonement from './Atonement';

const SINS_OF_THE_MANY_FLOOR_BONUS = 0.03;

/**
 * Sins isn't linear,
 * it allows you to have one Atonement active whilst keeping the full bonus
 * from the passive and from 6 onwards it only decreases 0.005.
 * Hence this map with the values for each Atonement count.
 */
const BONUS_DAMAGE_ARRAY = [
  0.12,
  0.12,
  0.10,
  0.08,
  0.07,
  0.06,
  0.055,
  0.05,
  0.045,
  0.04,
];

class SinsOfTheMany extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    atonement: Atonement,
  };
  protected atonement!: Atonement;
  protected combatants!: Combatants;

  bonusDamage = 0;
  bonusHealing = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SINS_OF_THE_MANY_TALENT.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET), this.onDamage);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
  }

  get currentBonus() {
    const activeBuffs = this.atonement.numAtonementsActive;

    // Return an override, if necessary
    if (BONUS_DAMAGE_ARRAY[activeBuffs]) {
      return BONUS_DAMAGE_ARRAY[activeBuffs];
    }

    // Return the floor if we have more atonements than in the map
    return SINS_OF_THE_MANY_FLOOR_BONUS;
  }

  /**
   * Sins of the Many buffs all of your damage, there is no whitelist
   */
  onDamage(event: DamageEvent) {
    this.bonusDamage += calculateEffectiveDamage(event, this.currentBonus);
  }

  /**
   * This is whitelisted by virtue of Atonement naturally not occuring
   * from abilities not in the whitelist.
   */
  onHeal(event: HealEvent) {
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
          `${formatNumber((this.bonusHealing / this.owner.fightDuration) * 1000)} HPS`,
          `${formatNumber((this.bonusDamage / this.owner.fightDuration) * 1000)} DPS`,
        ]}
        footer={(
          <>
            <SpellLink id={SPELLS.SINS_OF_THE_MANY_TALENT.id} /> throughput
          </>
        )}
        tooltip={(
          <>
            The effective healing contributed by Sins of the Many was {formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.bonusHealing))}% of total healing done.<br />
            The direct damage contributed by Sins of the Many was {formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.bonusDamage))}% of total damage done.
          </>
        )}
        alignIcon="center"
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL();
}

export default SinsOfTheMany;
