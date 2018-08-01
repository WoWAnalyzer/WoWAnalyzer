import React from 'react';
import SpellIcon from 'common/SpellIcon';
import Analyzer from 'Parser/Core/Analyzer';
import {formatNumber, formatPercentage} from 'common/format';
import {calculateAzeriteEffects} from 'common/stats';
import StatisticBox from 'Interface/Others/StatisticBox';
import SPELLS from 'common/SPELLS/index';
import MarrowrendUsage from '../../Features/MarrowrendUsage';
import BoneShieldTimesByStacks from '../../Features/BoneShieldTimesByStacks';



export function bonesOfTheDamnedStats(combatant){
  if(!combatant.hasTrait(SPELLS.BONES_OF_THE_DAMNED.id)){
    return null;
  }
  let armor = 0;
  for(const rank of combatant.traitsBySpellId[SPELLS.BONES_OF_THE_DAMNED.id]){
    const [arm] = calculateAzeriteEffects(SPELLS.BONES_OF_THE_DAMNED.id, rank);
    armor += arm;
  }

  return {armor};
}

export const STAT_TRACKER = {
  armor: (combatant) => {
    if (bonesOfTheDamnedStats(combatant) !== null) {
      //get the last change in BoneShield stacks and update armor
      const boneShieldEvent = combatant.owner.eventHistory.filter(e => e.ability && e.ability.guid === SPELLS.BONE_SHIELD.id && e.type === "changebuffstack").slice(-1)[0];
      return boneShieldEvent ? boneShieldEvent.stacksGained * bonesOfTheDamnedStats(combatant).armor : 0;
    }

    return 0;
  },
};

/**
 * Bones of the Damned
 * Marrowrend has a chance to proc an additional stack of Bone Shield (multiple traits do not allow increase the amount of stacks)
 * Bone Shield stacks increase armor
 */
class BonesOfTheDamned extends Analyzer{

  static dependencies = {
    marrowrendUsage: MarrowrendUsage,
    boneShieldTimesByStacks: BoneShieldTimesByStacks,
  };

  armor = 0;

  constructor(...args) {
    super(...args);
    const response = bonesOfTheDamnedStats(this.selectedCombatant);
    if (response === null) {
      this.active = false;
      return;
    }
    this.armor += response.armor;
  }

  get bonesOfTheDamnedProcPercentage() {
    return this.marrowrendUsage.bonesOfTheDamnedProcs / (this.marrowrendUsage.totalBoneShieldStacksGenerated - this.marrowrendUsage.bonesOfTheDamnedProcs);
  }

  get averageArmor() {
    return this.boneShieldTimesByStacks.averageBoneShieldStacks * this.armor;
  }

  statistic(){
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.BONES_OF_THE_DAMNED.id} />}
        value={(
          <React.Fragment>
            {formatNumber(this.marrowrendUsage.bonesOfTheDamnedProcs)} Procs <br />
            {formatNumber(this.averageArmor)} average Armor
          </React.Fragment>
        )}
        label={SPELLS.BONES_OF_THE_DAMNED.name}
        tooltip={`${formatPercentage(this.bonesOfTheDamnedProcPercentage)}% of your gained ${SPELLS.BONE_SHIELD.name} stacks are from ${SPELLS.BONES_OF_THE_DAMNED.name}`}
      />
    );
  }
}

export default BonesOfTheDamned; 