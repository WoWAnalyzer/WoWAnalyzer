import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import Combatants from 'Parser/Core/Modules/Combatants';
import StatTracker from 'Parser/Core/Modules/StatTracker';
import Analyzer from 'Parser/Core/Analyzer';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import { formatNumber, formatPercentage } from 'common/format';

import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';
import PRIEST_SPELLS from 'common/SPELLS/PRIEST';
import PRIEST_TALENTS from 'common/SPELLS/TALENTS/PRIEST';

// Use the priest spell list to whitelist abilities
const PRIEST_WHITELIST = Object.entries({
  ...PRIEST_SPELLS,
  ...PRIEST_TALENTS,
}).map(ability => ability[1].id);

class Reverence extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    statTracker: StatTracker,
  };

  reverenceHealing = 0;
  baseHealing = 0; // Healing that mastery stemmed from

  getReverenceHealing(event) {
    // Get our mastery level at the moment, this is required for temporary buffs
    const currentMastery = this.statTracker.currentMasteryPercentage;
    const masteryContribution = calculateEffectiveHealing(
      event,
      currentMastery
    );

    return masteryContribution;
  }

  on_byPlayer_heal(event) {
    // Check if the heal is whitelisted
    if (!PRIEST_WHITELIST.includes(event.ability.guid)) {
      return;
    }

    // Get the target
    const target = this.combatants.getEntity(event);

    if (!target) return;

    // Mastery only buffs players benefitting from Atonement
    if (!target.hasBuff(SPELLS.ATONEMENT_BUFF.id)) {
      return;
    }

    // Calculate healing
    const reverenceHealing = this.getReverenceHealing(event);

    // Account for base healing without mastery (??? JD ???)
    const baseHealing = event.amount - reverenceHealing;

    this.baseHealing += baseHealing;
    this.reverenceHealing += reverenceHealing;
  }

  statistic() {
    const reverenceHealingPerc = this.owner.getPercentageOfTotalHealingDone(
      this.reverenceHealing
    );
    const baseHealingPerc = this.owner.getPercentageOfTotalHealingDone(
      this.baseHealing
    );
    const healingWithoutMastery = baseHealingPerc / (1 - reverenceHealingPerc);

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.REVERENCE.id} />}
        value={`${formatNumber(
          this.reverenceHealing / this.owner.fightDuration * 1000
        )} HPS`}
        label="Mastery Healing"
        tooltip={`
            Reverence contributed towards ${formatPercentage(
              reverenceHealingPerc
            )}% of your healing. \n

            ${formatPercentage(
              healingWithoutMastery
            )}% of your healing benefitted from Reverence.
            `}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE();
}

export default Reverence;
