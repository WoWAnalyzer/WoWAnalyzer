import DamageDone from 'parser/shared/modules/throughput/DamageDone';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Abilities from 'parser/core/modules/Abilities';
import CoreHealingEfficiencyTracker from 'parser/core/healingEfficiency/HealingEfficiencyTracker';
import ManaTracker from 'parser/core/healingEfficiency/ManaTracker';
import EarthShield from 'parser/shaman/shared/talents/EarthShield';
import SPELLS from 'common/SPELLS';

import HealingDone from './HealingDone';
import RestorationAbilityTracker from './RestorationAbilityTracker';
import Resurgence from '../spells/Resurgence';
import CooldownThroughputTracker from '../features/CooldownThroughputTracker';
import UnleashLife from '../talents/UnleashLife';

class HealingEfficiencyTracker extends CoreHealingEfficiencyTracker {
  static dependencies = {
    manaTracker: ManaTracker,
    abilityTracker: RestorationAbilityTracker,
    healingDone: HealingDone,
    damageDone: DamageDone,
    castEfficiency: CastEfficiency,
    abilities: Abilities,
    resurgence: Resurgence,
    cooldownThroughputTracker: CooldownThroughputTracker,
    unleashLife: UnleashLife,
    earthShield: EarthShield,
  };

  getCustomSpellStats(spellInfo, spellId) {
    if (this.resurgence.resurgence[spellId]) {
      this.getResurgenceDetails(spellInfo, spellId);
    }
    if (spellId === SPELLS.UNLEASH_LIFE_TALENT.id) {
      this.getUnleashLifeDetails(spellInfo);
    } else if (this.unleashLife.healingBuff[spellId]) {
      this.getUnleashLifeBuffDetails(spellInfo, spellId);
    } else if (spellId === SPELLS.EARTH_SHIELD.id) {
      this.getEarthShieldBuffDetails(spellInfo);
    } else if (spellId === SPELLS.LAVA_BURST.id) {
      this.getLavaBurstDamageDetails(spellInfo);
    }

    return spellInfo;
  }

  // Resurgence "refunds" mana, so the spell is essentially cheaper
  getResurgenceDetails(spellInfo, spellId) {
    spellInfo.manaSpent -= this.resurgence.resurgence[spellId].resurgenceTotal;
  }

  // Healing from other spells that Unleash Life is responsible for
  getUnleashLifeDetails(spellInfo) {
    const unleashLifeContribution = this.unleashLife.totalBuffedHealing;
    spellInfo.healingDone += unleashLifeContribution;
  }

  // Remove Unleash Life's contribution to the affected spells
  getUnleashLifeBuffDetails(spellInfo, spellId) {
    const unleashLifeContribution = (this.unleashLife.healingBuff[spellId].healing || 0);
    spellInfo.healingDone -= unleashLifeContribution;
  }

  // Todo: Same treatment for Earth Shield as for Unleash Life and remove the healing from affected spells
  getEarthShieldBuffDetails(spellInfo) {
    spellInfo.healingDone += this.earthShield.buffHealing || 0;
  }

  // Different spellId for damage and no existing "damageSpellIds" implementation
  getLavaBurstDamageDetails(spellInfo) {
    const ability = this.abilityTracker.getAbility(SPELLS.LAVA_BURST_DAMAGE.id);
    spellInfo.damageHits = ability.damageHits || 0;
    spellInfo.damageDone = ability.damageEffective || 0;
    spellInfo.damageAbsorbed = ability.damageAbsorbed || 0;
  }
}

export default HealingEfficiencyTracker;
