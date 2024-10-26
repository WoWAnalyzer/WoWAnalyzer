import { EarthShield } from 'analysis/retail/shaman/shared';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import CoreHealingEfficiencyTracker, {
  SpellInfoDetails,
} from 'parser/core/healingEfficiency/HealingEfficiencyTracker';

import CooldownThroughputTracker from '../features/CooldownThroughputTracker';
import PrimordialWave from '../talents/PrimordialWave';
import Resurgence from '../spells/Resurgence';
import UnleashLife from '../talents/UnleashLife';
import HealingDone from './HealingDone';
import RestorationAbilityTracker from './RestorationAbilityTracker';

class HealingEfficiencyTracker extends CoreHealingEfficiencyTracker {
  static dependencies = {
    ...CoreHealingEfficiencyTracker.dependencies,
    abilityTracker: RestorationAbilityTracker,
    healingDone: HealingDone,
    resurgence: Resurgence,
    cooldownThroughputTracker: CooldownThroughputTracker,
    unleashLife: UnleashLife,
    earthShield: EarthShield,
    primordialWave: PrimordialWave,
  };

  protected declare abilityTracker: RestorationAbilityTracker;
  protected declare healingDone: HealingDone;
  protected resurgence!: Resurgence;
  protected cooldownThroughputTracker!: CooldownThroughputTracker;
  protected unleashLife!: UnleashLife;
  protected earthShield!: EarthShield;
  protected primordialWave!: PrimordialWave;

  getCustomSpellStats(spellInfo: SpellInfoDetails, spellId: number) {
    if (this.resurgence.resurgence[spellId]) {
      this.getResurgenceDetails(spellInfo, spellId);
    }
    if (spellId === TALENTS.UNLEASH_LIFE_TALENT.id) {
      this.getUnleashLifeDetails(spellInfo);
    } else if (this.unleashLife.healingMap[spellId]) {
      this.getUnleashLifeBuffDetails(spellInfo, spellId);
    } else if (spellId === TALENTS.EARTH_SHIELD_TALENT.id) {
      this.getEarthShieldBuffDetails(spellInfo);
    } else if (spellId === TALENTS.LAVA_BURST_TALENT.id) {
      this.getLavaBurstDamageDetails(spellInfo);
    }
    // Primordial
    if (spellId === TALENTS.HEALING_WAVE_TALENT.id) {
      this.getHealingWaveDetails(spellInfo);
    } else if (spellId === TALENTS.RIPTIDE_TALENT.id) {
      this.getRiptideDetails(spellInfo);
    } else if (spellId === TALENTS.PRIMORDIAL_WAVE_RESTORATION_TALENT.id) {
      this.getPrimordialWaveDetails(spellInfo);
    }

    return spellInfo;
  }

  // Resurgence "refunds" mana, so the spell is essentially cheaper
  getResurgenceDetails(spellInfo: SpellInfoDetails, spellId: number) {
    spellInfo.manaSpent -= this.resurgence.resurgence[spellId].resurgenceTotal;
  }

  // Healing from other spells that Unleash Life is responsible for
  getUnleashLifeDetails(spellInfo: SpellInfoDetails) {
    const unleashLifeContribution = this.unleashLife.totalBuffedHealing;
    spellInfo.healingDone += unleashLifeContribution;
  }

  // Remove Unleash Life's contribution to the affected spells
  getUnleashLifeBuffDetails(spellInfo: SpellInfoDetails, spellId: number) {
    const unleashLifeContribution = this.unleashLife.healingMap[spellId].amount || 0;
    spellInfo.healingDone -= unleashLifeContribution;
  }

  // Todo: Same treatment for Earth Shield as for Unleash Life and remove the healing from affected spells
  getEarthShieldBuffDetails(spellInfo: SpellInfoDetails) {
    spellInfo.healingDone += this.earthShield.buffHealing || 0;
  }

  // Different spellId for damage and no existing "damageSpellIds" implementation
  getLavaBurstDamageDetails(spellInfo: SpellInfoDetails) {
    const ability = this.abilityTracker.getAbility(SPELLS.LAVA_BURST_DAMAGE.id);
    spellInfo.damageHits = ability.damageHits || 0;
    spellInfo.damageDone = ability.damageVal.effective;
  }
  getHealingWaveDetails(spellInfo: SpellInfoDetails) {
    if (this.primordialWave) {
      spellInfo.healingDone -= this.primordialWave.waveHealing;
      spellInfo.overhealingDone -= this.primordialWave.waveOverHealing;
    }
  }
  getRiptideDetails(spellInfo: SpellInfoDetails) {
    if (this.primordialWave) {
      spellInfo.healingDone -= this.primordialWave.riptideHealing;
      spellInfo.overhealingDone -= this.primordialWave.riptideOverHealing;
    }
  }
  getPrimordialWaveDetails(spellInfo: SpellInfoDetails) {
    if (this.primordialWave) {
      spellInfo.healingDone += this.primordialWave.riptideHealing + this.primordialWave.waveHealing;
      spellInfo.overhealingDone +=
        this.primordialWave.riptideOverHealing + this.primordialWave.waveOverHealing;
    }
  }
}

export default HealingEfficiencyTracker;
