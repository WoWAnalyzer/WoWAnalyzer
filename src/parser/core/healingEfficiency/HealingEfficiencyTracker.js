import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import HealingDone from 'parser/shared/modules/HealingDone';
import DamageDone from 'parser/shared/modules/DamageDone';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import CoreAbilities from 'parser/shared/modules/Abilities';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/index';
import ManaTracker from './ManaTracker';

class HealingEfficiencyTracker extends Analyzer {
  static dependencies = {
    manaTracker: ManaTracker,
    abilityTracker: AbilityTracker,
    healingDone: HealingDone,
    damageDone: DamageDone,
    castEfficiency: CastEfficiency,
    abilities: CoreAbilities,
  };

  get topHpm() {
    let top = 0;
    for (const spellId in this.spellDetails) {
      if (this.spellDetails[spellId].hpm > top) {
        top = this.spellDetails[spellId].hpm;
      }
    }
    return top;
  }

  get topHpet() {
    let top = 0;
    for (const spellId in this.spellDetails) {
      if (this.spellDetails[spellId].hpet > top) {
        top = this.spellDetails[spellId].hpet;
      }
    }
    return top;
  }

  get topDpm() {
    let top = 0;
    for (const spellId in this.spellDetails) {
      if (this.spellDetails[spellId].dpm > top) {
        top = this.spellDetails[spellId].dpm;
      }
    }
    return top;
  }

  get topDpet() {
    let top = 0;
    for (const spellId in this.spellDetails) {
      if (this.spellDetails[spellId].dpet > top) {
        top = this.spellDetails[spellId].dpet;
      }
    }
    return top;
  }

  getSpellDetails(spellId) {
    let spellInfo = {};
    const ability = this.abilityTracker.getAbility(spellId);

    spellInfo.spell = SPELLS[spellId];
    spellInfo.casts = ability.casts || 0;

    spellInfo.healingHits = ability.healingHits || 0;
    spellInfo.healingDone = ability.healingEffective || 0;
    spellInfo.overhealingDone = ability.healingOverheal || 0;
    spellInfo.healingAbsorbed = ability.healingAbsorbed || 0;

    spellInfo.damageHits = ability.damageHits || 0;
    spellInfo.damageDone = ability.damageEffective || 0;
    spellInfo.damageAbsorbed = ability.damageAbsorbed || 0;

    // All of the following information can be derived from the data in SpellInfo.
    // Now we can add custom logic for spells.
    spellInfo = this.getCustomSpellDetails(spellInfo, spellId);

    spellInfo.percentOverhealingDone = spellInfo.overhealingDone / (spellInfo.healingDone + spellInfo.healingAbsorbed) || 0;
    spellInfo.percentHealingDone = spellInfo.healingDone / this.healingDone.total.regular || 0;
    spellInfo.percentDamageDone = spellInfo.damageDone / this.damageDone.total.regular || 0;

    spellInfo.manaSpent = this.manaTracker.spendersObj[spellId] ? this.manaTracker.spendersObj[spellId].spent : 0;
    spellInfo.manaPercentSpent = spellInfo.manaSpent / this.manaTracker.spent;
    spellInfo.manaGained = this.manaTracker;

    spellInfo.hpm = spellInfo.healingDone / spellInfo.manaSpent;
    spellInfo.dpm = spellInfo.damageDone / spellInfo.manaSpent;

    spellInfo.timeSpentCasting = this.castEfficiency.getTimeSpentCasting(spellId).timeSpentCasting + this.castEfficiency.getTimeSpentCasting(spellId).gcdSpent;
    spellInfo.percentTimeSpentCasting = spellInfo.timeSpentCasting / this.owner.fightDuration;

    spellInfo.hpet = spellInfo.healingDone / spellInfo.timeSpentCasting;
    spellInfo.dpet = spellInfo.damageDone / spellInfo.timeSpentCasting;

    return spellInfo;
  }

  getCustomSpellDetails(spellInfo, spellId) {
    // Overwrite this function to add specific logic for spells.
    return spellInfo;
  }

  detailsCache;
  get spellDetails() {
    if (this.detailsCache === undefined) {
      this.detailsCache = {};

      for (let index in this.abilities.abilities) {
        const ability = this.abilities.abilities[index];
        const abilityDetails = this.abilities;
        console.log(abilityDetails);
        if (ability.spell && ability.spell.manaCost && ability.spell.manaCost > 0) {
          this.detailsCache[ability.spell.id] = this.getSpellDetails(ability.spell.id);
        } else {
          console.log(ability);
        }
      }
    }

    return this.detailsCache;
  }

  constructor(...args) {
    super(...args);
    this.resource = RESOURCE_TYPES.MANA;
    this.maxResource = 100000;
  }
}

export default HealingEfficiencyTracker;
