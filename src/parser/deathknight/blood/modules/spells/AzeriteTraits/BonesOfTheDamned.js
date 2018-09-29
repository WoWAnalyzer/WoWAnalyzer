import React from 'react';

import SPELLS from 'common/SPELLS';
import { formatNumber, formatPercentage } from 'common/format';
import { calculateAzeriteEffects } from 'common/stats';
import Analyzer from 'parser/core/Analyzer';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';

import MarrowrendUsage from '../../features/MarrowrendUsage';
import BoneShieldTimesByStacks from '../../features/BoneShieldTimesByStacks';

const bonesOfTheDamnedStats = traits => Object.values(traits).reduce((obj, rank) => {
  const [armor] = calculateAzeriteEffects(SPELLS.BONES_OF_THE_DAMNED.id, rank);
  obj.armor += armor;
  return obj;
}, {
  armor: 0,
});

export const STAT_TRACKER = {
  armor: combatant => bonesOfTheDamnedStats(combatant.traitsBySpellId[SPELLS.BONES_OF_THE_DAMNED.id]).armor,
};

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
          <React.Fragment>
            {formatNumber(this.marrowrendUsage.bonesOfTheDamnedProcs)} Procs <br />
            {formatNumber(this.averageArmor)} average Armor
          </React.Fragment>
        )}
        tooltip={`
          ${formatPercentage(this.bonesOfTheDamnedProcPercentage)}% of your gained ${SPELLS.BONE_SHIELD.name} stacks are from ${SPELLS.BONES_OF_THE_DAMNED.name}.<br/>
          ${formatPercentage(this.bonesOfTheDamnedMarrowrendProcPercentage)}% of your ${SPELLS.MARROWREND.name} casts procced ${SPELLS.BONES_OF_THE_DAMNED.name}.
        `}
      />
    );
  }
}

export default BonesOfTheDamned; 
