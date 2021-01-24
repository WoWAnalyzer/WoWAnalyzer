import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import HealingDone from 'parser/shared/modules/throughput/HealingDone';
import DamageDone from 'parser/shared/modules/throughput/DamageDone';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import CoreAbilities from 'parser/core/modules/Abilities';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';

import ManaTracker from './ManaTracker';
import { SpellbookAbility } from '../modules/Ability';

export interface SpellInfoDetails {
  spell: Spell;
  casts: number;
  healingHits: number;
  healingDone: number;
  overhealingDone: number;
  damageHits: number;
  damageDone: number;
  damageAbsorbed: number;
  manaSpent: number;
  manaGained: ManaTracker;
  percentOverhealingDone: number;
  percentHealingDone: number;
  percentDamageDone: number;
  manaPercentSpent: number;
  hpm: number;
  dpm: number;
  timeSpentCasting: number;
  percentTimeSpentCasting: number;
  hpet: number;
  dpet: number;
}

class HealingEfficiencyTracker extends Analyzer {
  static dependencies = {
    manaTracker: ManaTracker,
    abilityTracker: AbilityTracker,
    healingDone: HealingDone,
    damageDone: DamageDone,
    castEfficiency: CastEfficiency,
    abilities: CoreAbilities,
  };

  protected manaTracker!: ManaTracker;
  protected abilityTracker!: AbilityTracker;
  protected healingDone!: HealingDone;
  protected damageDone!: DamageDone;
  protected castEfficiency!: CastEfficiency;
  protected abilities!: CoreAbilities;

  getSpellStats(spellId: number, healingSpellIds: number[] | null = null) {
    let spellInfo: SpellInfoDetails = {
      spell: SPELLS[spellId],
      casts: 0,
      healingHits: 0,
      healingDone: 0,
      overhealingDone: 0,
      damageHits: 0,
      damageDone: 0,
      damageAbsorbed: 0,
      manaSpent: 0,
      manaGained: this.manaTracker,
      percentOverhealingDone: 0,
      percentHealingDone: 0,
      percentDamageDone: 0,
      manaPercentSpent: 0,
      hpm: 0,
      dpm: 0,
      timeSpentCasting: 0,
      percentTimeSpentCasting: 0,
      hpet: 0,
      dpet: 0,
    };

    const ability = this.abilityTracker.getAbility(spellId);

    spellInfo.casts = ability.casts || 0;
    spellInfo.healingHits = ability.healingHits || 0;
    spellInfo.healingDone = (ability.healingEffective || 0) + (ability.healingAbsorbed || 0);
    spellInfo.overhealingDone = ability.healingOverheal || 0;

    if (healingSpellIds) {
      for (const healingSpellId in healingSpellIds) {
        const healingAbility = this.abilityTracker.getAbility(healingSpellIds[healingSpellId]);

        spellInfo.healingHits += healingAbility.healingHits || 0;
        spellInfo.healingDone += (healingAbility.healingEffective || 0) + (healingAbility.healingAbsorbed || 0);
        spellInfo.overhealingDone += healingAbility.healingOverheal || 0;
      }
    }

    spellInfo.damageHits = ability.damageHits || 0;
    spellInfo.damageDone = ability.damageEffective || 0;
    spellInfo.damageAbsorbed = ability.damageAbsorbed || 0;

    const spenders = this.manaTracker.spendersObj as {
      [spellId: number]: {
        spent: number;
        spentByCast: number[];
        casts: number
      }
    };
    spellInfo.manaSpent = spenders[spellId] ? spenders[spellId].spent : 0;

    // All of the following information can be derived from the data in SpellInfo.
    // Now we can add custom logic for spells.
    spellInfo = this.getCustomSpellStats(spellInfo, spellId, healingSpellIds);

    spellInfo.percentOverhealingDone = spellInfo.overhealingDone / ((spellInfo.healingDone || 0) + spellInfo.overhealingDone) || 0;
    spellInfo.percentHealingDone = spellInfo.healingDone / this.healingDone.total.regular || 0;
    spellInfo.percentDamageDone = spellInfo.damageDone / this.damageDone.total.regular || 0;
    spellInfo.manaPercentSpent = spellInfo.manaSpent / this.manaTracker.spent;

    spellInfo.hpm = (spellInfo.healingDone / spellInfo.manaSpent) || 0;
    spellInfo.dpm = (spellInfo.damageDone / spellInfo.manaSpent) || 0;

    spellInfo.timeSpentCasting = this.castEfficiency.getTimeSpentCasting(spellId).timeSpentCasting + this.castEfficiency.getTimeSpentCasting(spellId).gcdSpent;
    spellInfo.percentTimeSpentCasting = spellInfo.timeSpentCasting / this.owner.fightDuration;

    spellInfo.hpet = (spellInfo.healingDone / spellInfo.timeSpentCasting) | 0;
    spellInfo.dpet = (spellInfo.damageDone / spellInfo.timeSpentCasting) | 0;

    return spellInfo;
  }

  getCustomSpellStats(spellInfo: SpellInfoDetails, spellId: number, healingSpellIds: number[] | null) {
    // Overwrite this function to add specific logic for spells.
    return spellInfo;
  }

  getAllSpellStats(includeCooldowns = false) {
    const spells: { [spellId: number]: SpellInfoDetails } = {};
    let topHpm = 0;
    let topDpm = 0;
    let topHpet = 0;
    let topDpet = 0;

    for (const index in this.abilities.abilities) {
      const ability = this.abilities.abilities[index] as unknown as SpellbookAbility;

      if (ability.spell instanceof Array) {
        continue;
      }
      if (ability.spell && ability.spell.manaCost && ability.spell.manaCost > 0) {
        if (includeCooldowns || ability.category !== 'Cooldown') {
          spells[ability.spell.id] = this.getSpellStats(ability.spell.id, ability.healSpellIds);

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
}

export default HealingEfficiencyTracker;
