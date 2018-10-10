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

  getSpellStats(spellId, healingSpellIds = null) {
    let spellInfo = {};
    const ability = this.abilityTracker.getAbility(spellId);

    spellInfo.spell = SPELLS[spellId];
    spellInfo.casts = ability.casts || 0;

    spellInfo.healingHits = ability.healingHits || 0;
    spellInfo.healingDone = ability.healingEffective || 0;
    spellInfo.overhealingDone = ability.healingOverheal || 0;
    spellInfo.healingAbsorbed = ability.healingAbsorbed || 0;

    if (healingSpellIds) {
      for (const healingSpellId in healingSpellIds) {
        const healingAbility = this.abilityTracker.getAbility(healingSpellId);

        spellInfo.healingHits += healingAbility.healingHits || 0;
        spellInfo.healingDone += healingAbility.healingEffective || 0;
        spellInfo.overhealingDone += healingAbility.healingOverheal || 0;
        spellInfo.healingAbsorbed += healingAbility.healingAbsorbed || 0;
      }
    }

    spellInfo.damageHits = ability.damageHits || 0;
    spellInfo.damageDone = ability.damageEffective || 0;
    spellInfo.damageAbsorbed = ability.damageAbsorbed || 0;

    // All of the following information can be derived from the data in SpellInfo.
    // Now we can add custom logic for spells.
    spellInfo = this.getCustomSpellStats(spellInfo, spellId);

    spellInfo.percentOverhealingDone = spellInfo.overhealingDone / (spellInfo.healingDone + spellInfo.healingAbsorbed) || 0;
    spellInfo.percentHealingDone = spellInfo.healingDone / this.healingDone.total.regular || 0;
    spellInfo.percentDamageDone = spellInfo.damageDone / this.damageDone.total.regular || 0;

    spellInfo.manaSpent = this.manaTracker.spendersObj[spellId] ? this.manaTracker.spendersObj[spellId].spent : 0;
    spellInfo.manaPercentSpent = spellInfo.manaSpent / this.manaTracker.spent;
    spellInfo.manaGained = this.manaTracker;

    spellInfo.hpm = (spellInfo.healingDone / spellInfo.manaSpent) | 0;
    spellInfo.dpm = (spellInfo.damageDone / spellInfo.manaSpent) | 0;

    spellInfo.timeSpentCasting = this.castEfficiency.getTimeSpentCasting(spellId).timeSpentCasting + this.castEfficiency.getTimeSpentCasting(spellId).gcdSpent;
    spellInfo.percentTimeSpentCasting = spellInfo.timeSpentCasting / this.owner.fightDuration;

    spellInfo.hpet = (spellInfo.healingDone / spellInfo.timeSpentCasting) | 0;
    spellInfo.dpet = (spellInfo.damageDone / spellInfo.timeSpentCasting) | 0;

    return spellInfo;
  }

  getCustomSpellStats(spellInfo, spellId) {
    // Overwrite this function to add specific logic for spells.
    return spellInfo;
  }

  getAllSpellStats(includeCooldowns = false) {
    const spells = {};
    let topHpm = 0;
    let topDpm = 0;
    let topHpet = 0;
    let topDpet = 0;

    for (const index in this.abilities.abilities) {
      const ability = this.abilities.abilities[index];

      if (ability.spell && ability.spell.manaCost && ability.spell.manaCost > 0) {
        if (includeCooldowns || ability.category !== 'Cooldown') {
          spells[ability.spell.id] = this.getSpellStats(ability.spell.id, ability.healSpellId);

          topHpm = Math.max(topHpm, spells[ability.spell.id].hpm);
          topDpm = Math.max(topDpm, spells[ability.spell.id].dpm);
          topHpet = Math.max(topHpet, spells[ability.spell.id].hpet);
          topDpet = Math.max(topDpet, spells[ability.spell.id].dpet);
        }
      }
    }

    return {
      spells,
      topHpm,
      topDpm,
      topHpet,
      topDpet,
    };
  }

  constructor(...args) {
    super(...args);
    this.resource = RESOURCE_TYPES.MANA;
    this.maxResource = 100000;
  }
}

export default HealingEfficiencyTracker;
