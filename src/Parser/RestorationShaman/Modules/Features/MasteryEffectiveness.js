import Module from 'Parser/Core/Module';

import { ABILITIES_AFFECTED_BY_MASTERY } from '../../Constants';

class MasteryEffectiveness extends Module {

  totalMasteryHealing = 0;
  totalMaxPotentialMasteryHealing = 0;


  on_byPlayer_heal(event) {
    const isAbilityAffectedByMastery = ABILITIES_AFFECTED_BY_MASTERY.indexOf(event.ability.guid) !== -1;

    const healingDone = event.amount + (event.absorb || 0) + (event.overheal || 0);

    if (isAbilityAffectedByMastery) {
      const healthBeforeHeal = event.hitPoints - event.amount;
      const masteryEffectiveness = 1 - healthBeforeHeal / event.maxHitPoints
      

      // The base healing of the spell (excluding any healing added by mastery)
      const masteryPercent = this.owner.modules.combatants.selected.masteryPercentage;
      const baseHealingDone = healingDone / (1 + masteryPercent * masteryEffectiveness);
      const masteryHealingDone = healingDone - baseHealingDone;
      // The max potential mastery healing if we had a mastery effectiveness of 100% on this spell. This does NOT include the base healing
      // Example: a heal that did 1,324 healing with 32.4% mastery with 100% mastery effectiveness will have a max potential mastery healing of 324.
      const maxPotentialMasteryHealing = baseHealingDone * masteryPercent; // * 100% mastery effectiveness


      this.totalMasteryHealing += Math.max(0, masteryHealingDone - (event.overheal || 0));
      this.totalMaxPotentialMasteryHealing += Math.max(0, maxPotentialMasteryHealing - (event.overheal || 0));


    }

  }
}

export default MasteryEffectiveness;

