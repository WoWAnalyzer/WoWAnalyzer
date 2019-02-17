import React from 'react';

import SPELLS from 'common/SPELLS';
import { formatNumber, formatPercentage } from 'common/format';
import { calculateAzeriteEffects } from 'common/stats';
import Analyzer from 'parser/core/Analyzer';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import StatTracker from 'parser/shared/modules/StatTracker';
import SpellLink from 'common/SpellLink';

import MarrowrendUsage from '../../features/MarrowrendUsage';
import BoneShieldTimesByStacks from '../../features/BoneShieldTimesByStacks';

const bonesOfTheDamnedStats = traits => Object.values(traits).reduce((obj, rank) => {
  const [armor] = calculateAzeriteEffects(SPELLS.BONES_OF_THE_DAMNED.id, rank);
  obj.armor += armor;
  return obj;
}, {
  armor: 0,
});

/**
 * Bones of the Damned
 * Marrowrend has a chance to proc an additional stack of Bone Shield (multiple traits do not allow increase the amount of stacks)
 * Bone Shield increase armor
 * 
 * Example Report: https://www.warcraftlogs.com/reports/bnQ4fpjv8hz9mJY3/#fight=1&source=9&translate=true
 */
class BonesOfTheDamned extends Analyzer{

  static dependencies = {
    marrowrendUsage: MarrowrendUsage,
    boneShieldTimesByStacks: BoneShieldTimesByStacks,
    statTracker: StatTracker,
  };

  armor = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.BONES_OF_THE_DAMNED.id);
    if (!this.active) {
      return;
    }

    const { armor } = bonesOfTheDamnedStats(this.selectedCombatant.traitsBySpellId[SPELLS.BONES_OF_THE_DAMNED.id]);
    this.armor = armor;

    this.statTracker.add(SPELLS.BONES_OF_THE_DAMNED_BUFF.id, {
      armor,
    });
  }

  get suggestionThresholds() {
    // suggestion based on wasted possible procs in relation to total MR casts
    return {
      actual: this.marrowrendUsage.wastedbonesOfTheDamnedProcs / this.marrowrendUsage.marrowrendCasts,
      isGreaterThan: {
        minor: 0,
        average: 0.3,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<>{formatPercentage(actual)}% <SpellLink id={SPELLS.MARROWREND.id} /> casts locked you out of possible <SpellLink id={SPELLS.BONES_OF_THE_DAMNED.id} /> procs. Only cast <SpellLink id={SPELLS.MARROWREND.id} /> at {this.marrowrendUsage.refreshWithStacks} stacks or below to maximize the benefit of this trait.</>)
          .icon(SPELLS.BONES_OF_THE_DAMNED.icon);
      });
  }

  get bonesOfTheDamnedProcPercentage() {
    return this.marrowrendUsage.bonesOfTheDamnedProcs / (this.marrowrendUsage.totalBoneShieldStacksGenerated - this.marrowrendUsage.bonesOfTheDamnedProcs);
  }

  get bonesOfTheDamnedMarrowrendProcPercentage() {
    return this.marrowrendUsage.bonesOfTheDamnedProcs / this.marrowrendUsage.marrowrendCasts;
  }

  get averageArmor() {
    return this.selectedCombatant.getBuffUptime(SPELLS.BONES_OF_THE_DAMNED_BUFF.id) / this.owner.fightDuration * this.armor;
  }

  statistic(){
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.BONES_OF_THE_DAMNED.id}
        value={(
          <>
            {formatNumber(this.marrowrendUsage.bonesOfTheDamnedProcs)} Procs <br />
            {formatNumber(this.averageArmor)} average Armor
          </>
        )}
        tooltip={`
          ${formatPercentage(this.bonesOfTheDamnedProcPercentage)}% of your gained ${SPELLS.BONE_SHIELD.name} stacks are from ${SPELLS.BONES_OF_THE_DAMNED.name}.<br/>
          ${formatPercentage(this.bonesOfTheDamnedMarrowrendProcPercentage)}% of your ${SPELLS.MARROWREND.name} casts procced ${SPELLS.BONES_OF_THE_DAMNED.name}.<br/>
          ${formatNumber(this.marrowrendUsage.wastedbonesOfTheDamnedProcs)} of your ${SPELLS.MARROWREND.name} casts locked you out of an potential ${SPELLS.BONES_OF_THE_DAMNED.name} proc
        `}
      />
    );
  }
}

export default BonesOfTheDamned; 
