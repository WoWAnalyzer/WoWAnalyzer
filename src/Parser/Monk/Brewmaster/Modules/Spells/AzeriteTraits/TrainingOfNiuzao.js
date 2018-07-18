import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { calculateAzeriteEffects } from 'common/stats';
import { formatNumber, formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

const TON_SCALE = {
  [SPELLS.LIGHT_STAGGER_DEBUFF.id]: 1/3,
  [SPELLS.MODERATE_STAGGER_DEBUFF.id]: 2/3,
  [SPELLS.HEAVY_STAGGER_DEBUFF.id]: 1,
};

export function trainingOfNiuzaoStats(combatant) {
  if(!combatant.hasTrait(SPELLS.TRAINING_OF_NIUZAO.id)) {
    return null;
  }
  return {
    mastery: combatant.traitsBySpellId[SPELLS.TRAINING_OF_NIUZAO.id]
              .reduce((rank, total) => total + calculateAzeriteEffects(SPELLS.TRAINING_OF_NIUZAO.id, rank)[0], 0),
  };
}

export const MASTERY_FNS = {
  [SPELLS.LIGHT_STAGGER_DEBUFF.id]: combatant => (trainingOfNiuzaoStats(combatant) || {}).mastery * TON_SCALE[SPELLS.LIGHT_STAGGER_DEBUFF.id],
  [SPELLS.MODERATE_STAGGER_DEBUFF.id]: combatant => (trainingOfNiuzaoStats(combatant) || {}).mastery * TON_SCALE[SPELLS.MODERATE_STAGGER_DEBUFF.id],
  [SPELLS.HEAVY_STAGGER_DEBUFF.id]: combatant => (trainingOfNiuzaoStats(combatant) || {}).mastery * TON_SCALE[SPELLS.HEAVY_STAGGER_DEBUFF.id],
};

class TrainingOfNiuzao extends Analyzer {
  mastery = 0;
  constructor(...args) {
    super(...args);
    const stats = trainingOfNiuzaoStats(this.selectedCombatant);
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

    // the `this.owner._modules.statTracker` bit is used because atm
    // StatTracker ALSO imports this module so that the mastery
    // calculation isn't done inline over there. it is possible to
    // import StatTracker, but not to set it as a dependency.
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.TRAINING_OF_NIUZAO.id} />}
        value={`${formatPercentage(this.owner._modules.statTracker.masteryPercentage(this.avgMastery, false))}%`}
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
