import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import StatTracker from 'Parser/Core/Modules/StatTracker';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { calculateAzeriteEffects } from 'common/stats';
import { formatNumber, formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

const TON_SCALE = {
  [SPELLS.LIGHT_STAGGER_DEBUFF.id]: 1,
  [SPELLS.MODERATE_STAGGER_DEBUFF.id]: 2,
  [SPELLS.HEAVY_STAGGER_DEBUFF.id]: 3,
};

export function trainingOfNiuzao_stats(combatant) {
  if(!combatant.hasTrait(SPELLS.TRAINING_OF_NIUZAO.id)) {
    return null;
  }
  let mastery = 0;
  for(const rank of combatant.traitsBySpellId[SPELLS.TRAINING_OF_NIUZAO.id]) {
    mastery += calculateAzeriteEffects(SPELLS.TRAINING_OF_NIUZAO.id, rank)[0];
  }
  return {mastery};
}

class TrainingOfNiuzao extends Analyzer {
  static dependencies = {
    stats: StatTracker,
  };

  mastery = 0;
  constructor(...args) {
    super(...args);
    const stats = trainingOfNiuzao_stats(this.selectedCombatant);
    if(!stats) {
      this.active = false;
      return;
    }
    this.mastery = stats.mastery;
  }

  get avgMastery() {
    return Object.entries(TON_SCALE).reduce((current, [buff, scale]) => this.selectedCombatant.getBuffUptime(buff) / this.owner.fightDuration * scale * this.mastery + current, 0);
  }

  statistic() {
    const lightUptime = this.selectedCombatant.getBuffUptime(SPELLS.LIGHT_STAGGER_DEBUFF.id) / this.owner.fightDuration;
    const moderateUptime = this.selectedCombatant.getBuffUptime(SPELLS.MODERATE_STAGGER_DEBUFF.id) / this.owner.fightDuration;
    const heavyUptime = this.selectedCombatant.getBuffUptime(SPELLS.HEAVY_STAGGER_DEBUFF.id) / this.owner.fightDuration;

    const lightMastery = TON_SCALE[SPELLS.LIGHT_STAGGER_DEBUFF.id] * this.mastery;
    const moderateMastery = TON_SCALE[SPELLS.MODERATE_STAGGER_DEBUFF.id] * this.mastery;
    const heavyMastery = TON_SCALE[SPELLS.HEAVY_STAGGER_DEBUFF.id] * this.mastery;

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.TRAINING_OF_NIUZAO.id} />}
        value={`${formatPercentage(this.stats.masteryPercentage(this.avgMastery, false))}%`}
        label={"Avg. Mastery from Training of Niuzao"}
        tooltip={`Contribution Breakdown:
          <ul>
          <li>No Stagger: <b>${formatPercentage(1 - lightUptime - moderateUptime - heavyUptime)}%</b> of the fight.</li>
          <li>Light Stagger: <b>${formatPercentage(lightUptime)}%</b> of the fight at <b>${formatNumber(lightMastery)} Mastery</b>.</li>
          <li>Moderate Stagger: <b>${formatPercentage(moderateUptime)}%</b> of the fight at <b>${formatNumber(moderateMastery)} Mastery</b>.</li>
          <li>Heavy Stagger: <b>${formatPercentage(heavyUptime)}%</b> of the fight at <b>${formatNumber(heavyMastery)} Mastery</b>.</li>
          </ul>`}
        />
    );
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL();
}

export default TrainingOfNiuzao;
