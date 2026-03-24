import Abilities from 'analysis/retail/priest/holy/modules/Abilities';
import EchoOfLightMastery from 'analysis/retail/priest/holy/modules/core/EchoOfLightMastery';
import PrayerOfMending from 'analysis/retail/priest/holy/modules/spells/PrayerOfMending';
import LightsResurgence from 'analysis/retail/priest/holy/modules/talents/MiddleRow/LightsResurgence';
import TALENTS from 'common/TALENTS/priest';
import HealingEfficiencyTracker from 'parser/core/healingEfficiency/HealingEfficiencyTracker';
import ManaTracker from 'parser/core/healingEfficiency/ManaTracker';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import DamageDone from 'parser/shared/modules/throughput/DamageDone';
import HealingDone from 'parser/shared/modules/throughput/HealingDone';
import Halo from 'analysis/retail/priest/holy/modules/talents/Classwide/Halo';
import SPELLS from 'common/SPELLS';

class HolyPriestHealingEfficiencyTracker extends HealingEfficiencyTracker {
  static dependencies = {
    ...HealingEfficiencyTracker.dependencies,
    manaTracker: ManaTracker,
    abilityTracker: AbilityTracker,
    healingDone: HealingDone,
    damageDone: DamageDone,
    castEfficiency: CastEfficiency,

    // Custom dependencies
    abilities: Abilities,
    prayerOfMending: PrayerOfMending,
    echoOfLight: EchoOfLightMastery,
    halo: Halo,
    lightsResurgence: LightsResurgence,
  };

  includeEchoOfLight = false;

  protected prayerOfMending!: PrayerOfMending;
  protected echoOfLight!: EchoOfLightMastery;
  protected halo!: Halo;
  protected lightsResurgence!: LightsResurgence;

  // oxlint-disable-next-line @typescript-eslint/no-explicit-any
  getCustomSpellStats(spellInfo: any, spellId: number, healingSpellIds: number[]) {
    // If we have a spell that has custom logic for the healing/damage numbers, do that before the rest of our calculations.
    if (spellId === SPELLS.PRAYER_OF_MENDING_HEAL.id) {
      spellInfo = this.getPomDetails(spellInfo);
    } else if (spellId === TALENTS.HALO_HOLY_TALENT.id) {
      spellInfo = this.getHaloDetails(spellInfo);
    }
    if (this.includeEchoOfLight) {
      spellInfo = this.addEcho(spellInfo, healingSpellIds);
    }
    return spellInfo;
  }

  // oxlint-disable-next-line @typescript-eslint/no-explicit-any
  getHaloDetails(spellInfo: any) {
    spellInfo.healingDone = this.halo.haloHealing || 0;
    spellInfo.overhealingDone = this.halo.haloOverhealing || 0;
    return spellInfo;
  }

  // oxlint-disable-next-line @typescript-eslint/no-explicit-any
  getPrayerOfHealingDetails(spellInfo: any, spellId: number) {
    const ability = this.abilityTracker.getAbility(spellId);
    spellInfo.healingDone = ability.healingVal.regular || 0;
    spellInfo.overhealingDone = ability.healingVal.overheal || 0;
    spellInfo.healingAbsorbed = ability.healingVal.absorbed || 0;
    return spellInfo;
  }

  // oxlint-disable-next-line @typescript-eslint/no-explicit-any
  getPomDetails(spellInfo: any) {
    // This represents the amount of healing done by HARD CASTING PoM.
    // We don't want PoM to get HPM credit for healing that we didn't spend mana on.
    const pomTicksWithoutSalv =
      this.prayerOfMending.pomHealTicks - this.prayerOfMending.pomTicksFromSalv;
    spellInfo.healingDone =
      pomTicksWithoutSalv * this.prayerOfMending.averagePomTickHeal;
    spellInfo.overhealingDone =
      pomTicksWithoutSalv * this.prayerOfMending.averagePomTickOverheal;
    spellInfo.healingAbsorbed =
      pomTicksWithoutSalv * this.prayerOfMending.averagePomTickHeal;
    return spellInfo;
  }

  // oxlint-disable-next-line @typescript-eslint/no-explicit-any
  addEcho(spellInfo: any, healingSpellIds: number[]) {
    try {
      if (this.echoOfLight.masteryHealingBySpell[spellInfo.spell.id]) {
        spellInfo.healingDone +=
          this.echoOfLight.masteryHealingBySpell[spellInfo.spell.id].effectiveHealing;
        spellInfo.overhealingDone +=
          this.echoOfLight.masteryHealingBySpell[spellInfo.spell.id].overHealing;
      }

      if (healingSpellIds) {
        healingSpellIds.forEach((healingSpellId) => {
          if (this.echoOfLight.masteryHealingBySpell[healingSpellId]) {
            spellInfo.healingDone +=
              this.echoOfLight.masteryHealingBySpell[healingSpellId].effectiveHealing;
            spellInfo.overhealingDone +=
              this.echoOfLight.masteryHealingBySpell[healingSpellId].overHealing;
          }
        });
      }
    } catch {
      return spellInfo; // Avoids crashes
    }
    return spellInfo;
  }
}

export default HolyPriestHealingEfficiencyTracker;