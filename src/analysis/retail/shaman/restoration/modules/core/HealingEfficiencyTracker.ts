import { EarthShield } from 'analysis/retail/shaman/shared';
import SPELLS from 'common/SPELLS/shaman';
import TALENTS from 'common/TALENTS/shaman';
import CoreHealingEfficiencyTracker, {
  SpellInfoDetails,
} from 'parser/core/healingEfficiency/HealingEfficiencyTracker';
import CooldownThroughputTracker from '../features/CooldownThroughputTracker';
import Resurgence from '../spells/Resurgence';
import UnleashLife from '../talents/UnleashLife';
import HealingDone from './HealingDone';
import RestorationAbilityTracker from './RestorationAbilityTracker';
import Downpour from '../talents/Downpour';
import SurgingTotem from '../talents/totemic/SurgingTotem';
import ManaSpring from 'src/analysis/retail/shaman/shared/talents/ManaSpring';

class HealingEfficiencyTracker extends CoreHealingEfficiencyTracker {
  static dependencies = {
    ...CoreHealingEfficiencyTracker.dependencies,
    abilityTracker: RestorationAbilityTracker,
    healingDone: HealingDone,
    resurgence: Resurgence,
    cooldownThroughputTracker: CooldownThroughputTracker,
    unleashLife: UnleashLife,
    earthShield: EarthShield,
    downpour: Downpour,
    surgingTotem: SurgingTotem,
    manaSpring: ManaSpring,
  };

  declare protected abilityTracker: RestorationAbilityTracker;
  declare protected healingDone: HealingDone;
  protected resurgence!: Resurgence;
  protected cooldownThroughputTracker!: CooldownThroughputTracker;
  protected unleashLife!: UnleashLife;
  protected earthShield!: EarthShield;
  protected downpour!: Downpour;
  protected surgingTotem!: SurgingTotem;
  protected manaSpring!: ManaSpring;

  getCustomSpellStats(spellInfo: SpellInfoDetails, spellId: number) {
    if (this.resurgence.resurgence[spellId]) {
      this.getResurgenceDetails(spellInfo, spellId);
    }
    if (spellId === TALENTS.RIPTIDE_TALENT.id) {
      this.getManaSpringDetails(spellInfo);
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

    if (spellId === SPELLS.DOWNPOUR_ABILITY.id) {
      this.getDownpourDetails(spellInfo);
    }
    if (spellId === SPELLS.SURGING_TOTEM.id) {
      this.getSurgingTotemDetails(spellInfo);
    }

    return spellInfo;
  }

  // Resurgence "refunds" mana, so the spell is essentially cheaper
  getResurgenceDetails(spellInfo: SpellInfoDetails, spellId: number) {
    spellInfo.manaSpent -= this.resurgence.resurgence[spellId].resurgenceTotal;
  }
  // manaSpring "refunds" mana, so the riptide is essentially cheaper
  getManaSpringDetails(spellInfo: SpellInfoDetails) {
    if (this.manaSpring) {
      spellInfo.manaSpent -= this.manaSpring.selfManaRestored;
    }
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

  getLavaBurstDamageDetails(spellInfo: SpellInfoDetails) {
    const ability = this.abilityTracker.getAbility(SPELLS.LAVA_BURST_DAMAGE.id);
    spellInfo.damageHits = ability.damageHits || 0;
    spellInfo.damageDone = ability.damageVal.effective;
  }

  getDownpourDetails(spellInfo: SpellInfoDetails) {
    if (this.downpour) {
      spellInfo.healingDone += this.downpour.downpourHealing;
    }
  }
  getSurgingTotemDetails(spellInfo: SpellInfoDetails) {
    if (this.surgingTotem) {
      spellInfo.healingDone += this.surgingTotem.totalHealingDone;
    }
  }
}

export default HealingEfficiencyTracker;
