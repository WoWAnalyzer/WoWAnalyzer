import Abilities from 'analysis/retail/priest/holy/modules/Abilities';
import EchoOfLightMastery from 'analysis/retail/priest/holy/modules/core/EchoOfLightMastery';
import PrayerOfMending from 'analysis/retail/priest/holy/modules/spells/PrayerOfMending';
import Renew from 'analysis/retail/priest/holy/modules/spells/Renew';
import TALENTS from 'common/TALENTS/priest';
import HealingEfficiencyTracker from 'parser/core/healingEfficiency/HealingEfficiencyTracker';
import ManaTracker from 'parser/core/healingEfficiency/ManaTracker';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import DamageDone from 'parser/shared/modules/throughput/DamageDone';
import HealingDone from 'parser/shared/modules/throughput/HealingDone';
import Halo from 'analysis/retail/priest/holy/modules/talents/Classwide/Halo';
import DivineStar from 'analysis/retail/priest/holy/modules/talents/Classwide/DivineStar';
import Benediction from 'analysis/retail/priest/holy/modules/talents/MiddleRow/Benediction';

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
    renew: Renew,
    prayerOfMending: PrayerOfMending,
    echoOfLight: EchoOfLightMastery,
    halo: Halo,
    divineStar: DivineStar,
    benediction: Benediction,
  };
  includeEchoOfLight = false;
  protected renew!: Renew;
  protected prayerOfMending!: PrayerOfMending;
  protected echoOfLight!: EchoOfLightMastery;
  protected halo!: Halo;
  protected divineStar!: DivineStar;
  protected benediction!: Benediction;

  getCustomSpellStats(spellInfo: any, spellId: number, healingSpellIds: number[]) {
    // If we have a spell that has custom logic for the healing/damage numbers, do that before the rest of our calculations.
    if (spellId === TALENTS.RENEW_TALENT.id) {
      spellInfo = this.getRenewDetails(spellInfo);
    } else if (spellId === TALENTS.PRAYER_OF_MENDING_TALENT.id) {
      spellInfo = this.getPomDetails(spellInfo);
    } else if (spellId === TALENTS.HALO_SHARED_TALENT.id) {
      spellInfo = this.getHaloDetails(spellInfo);
    } else if (spellId === TALENTS.DIVINE_STAR_SHARED_TALENT.id) {
      spellInfo = this.getDivineStarDetails(spellInfo);
    }
    if (this.includeEchoOfLight) {
      spellInfo = this.addEcho(spellInfo, healingSpellIds);
    } //This is slightly wrong/bugged since it counts mastery for each spell and not according to the healing disttribution
    //For example prayer of mending gets the mastery bonus for every prayer of mending including those from Salv
    //This is relatively minor and I am not sure how to fix it

    return spellInfo;
  }

  getRenewDetails(spellInfo: any) {
    // This represents that amount of healing done by HARD CASTING renew.
    // We don't want renew to get Hpm credit for healing that we didn't spend mana on.
    spellInfo.healingDone = this.renew.healingFromRenew(this.renew.renewsCast);
    spellInfo.overhealingDone = this.renew.overhealingFromRenew(this.renew.renewsCast);
    spellInfo.healingAbsorbed = this.renew.absorptionFromRenew(this.renew.renewsCast);
    spellInfo.healingHits =
      (this.renew.renewsCast / this.renew.totalRenewApplications) * this.renew.totalRenewTicks;

    return spellInfo;
  }

  getHaloDetails(spellInfo: any) {
    spellInfo.healingDone = this.halo.haloHealing || 0;
    spellInfo.overhealingDone = this.halo.haloOverhealing || 0;
    return spellInfo;
  }

  getDivineStarDetails(spellInfo: any) {
    spellInfo.healingDone = this.divineStar.divineStarHealing || 0;
    spellInfo.overhealingDone = this.divineStar.divineStarOverhealing || 0;
    return spellInfo;
  }

  getPrayerOfHealingDetails(spellInfo: any, spellId: number) {
    //We get the healing done from Prayer of healing and healing from renews applied by casting it
    const ability = this.abilityTracker.getAbility(spellId);
    spellInfo.healingDone = ability.healingVal.regular || 0;
    spellInfo.overhealingDone = ability.healingVal.overheal || 0;
    spellInfo.healingAbsorbed = ability.healingVal.absorbed || 0;
    return spellInfo;
  }

  getPomDetails(spellInfo: any) {
    // This represents that amount of healing done by HARD CASTING PoM.
    // We don't want PoM to get Hpm credit for healing that we didn't spend mana on.
    // We *do* want PoM to get credit for any renews it leave behind from Benediction.
    const pomTicksWithoutSalv =
      this.prayerOfMending.pomHealTicks - this.prayerOfMending.pomTicksFromSalv;
    spellInfo.healingDone =
      pomTicksWithoutSalv * this.prayerOfMending.averagePomTickHeal +
      this.benediction.healingFromRenew;
    spellInfo.overhealingDone =
      pomTicksWithoutSalv * this.prayerOfMending.averagePomTickOverheal +
      this.benediction.overhealingFromRenew;
    spellInfo.healingAbsorbed =
      pomTicksWithoutSalv * this.prayerOfMending.averagePomTickHeal +
      this.benediction.absorptionFromRenew;
    return spellInfo;
  }

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
      return spellInfo; //Avoids crashes
    }
    return spellInfo;
  }
}

export default HolyPriestHealingEfficiencyTracker;
