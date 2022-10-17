import Abilities from 'analysis/retail/priest/holy/modules/Abilities';
import EchoOfLightMastery from 'analysis/retail/priest/holy/modules/core/EchoOfLightMastery';
import PrayerOfMending from 'analysis/retail/priest/holy/modules/spells/PrayerOfMending';
import Renew from 'analysis/retail/priest/holy/modules/spells/Renew';
import HolyWordSalvation from 'analysis/retail/priest/holy/modules/talents/BottomRow/HolyWordSalvation';
import TALENTS from 'common/TALENTS/priest';
import HealingEfficiencyTracker from 'parser/core/healingEfficiency/HealingEfficiencyTracker';
import ManaTracker from 'parser/core/healingEfficiency/ManaTracker';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import DamageDone from 'parser/shared/modules/throughput/DamageDone';
import HealingDone from 'parser/shared/modules/throughput/HealingDone';

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
    salvation: HolyWordSalvation,
    renew: Renew,
    prayerOfMending: PrayerOfMending,
    echoOfLight: EchoOfLightMastery,
  };
  includeEchoOfLight = false;
  protected salvation!: HolyWordSalvation;
  protected renew!: Renew;
  protected prayerOfMending!: PrayerOfMending;
  protected echoOfLight!: EchoOfLightMastery;

  getCustomSpellStats(spellInfo: any, spellId: number, healingSpellIds: number[]) {
    // If we have a spell that has custom logic for the healing/damage numbers, do that before the rest of our calculations.
    if (spellId === TALENTS.RENEW_TALENT.id) {
      spellInfo = this.getRenewDetails(spellInfo);
    } else if (spellId === TALENTS.PRAYER_OF_MENDING_TALENT.id) {
      spellInfo = this.getPomDetails(spellInfo);
    } else if (spellId === TALENTS.HOLY_WORD_SALVATION_TALENT.id) {
      spellInfo = this.getSalvationDetails(spellInfo);
    }

    if (this.includeEchoOfLight) {
      spellInfo = this.addEcho(spellInfo, healingSpellIds);
    }

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

  getPomDetails(spellInfo: any) {
    // This represents that amount of healing done by HARD CASTING PoM.
    // We don't want PoM to get Hpm credit for healing that we didn't spend mana on.
    // We *do* want PoM to get credit for any renews it leave behind from Benediction.
    spellInfo.healingDone =
      this.prayerOfMending.pomTicksFromCast * this.prayerOfMending.averagePomTickHeal;
    spellInfo.overhealingDone =
      this.prayerOfMending.pomTicksFromCast * this.prayerOfMending.averagePomTickOverheal;
    spellInfo.healingAbsorbed =
      this.prayerOfMending.pomTicksFromCast * this.prayerOfMending.averagePomTickAbsorption;
    spellInfo.healingHits = this.prayerOfMending.pomTicksFromCast;

    return spellInfo;
  }

  getSalvationDetails(spellInfo: any) {
    spellInfo.healingDone = this.salvation.totalHealing;
    spellInfo.overhealingDone = this.salvation.totalOverHealing;
    spellInfo.healingAbsorbed = this.salvation.totalAbsorbed;

    return spellInfo;
  }

  addEcho(spellInfo: any, healingSpellIds: number[]) {
    if (this.echoOfLight.masteryHealingBySpell[spellInfo.spell.id]) {
      spellInfo.healingDone += this.echoOfLight.masteryHealingBySpell[
        spellInfo.spell.id
      ].effectiveHealing;
      spellInfo.overhealingDone += this.echoOfLight.masteryHealingBySpell[
        spellInfo.spell.id
      ].overHealing;
    }

    if (healingSpellIds) {
      healingSpellIds.forEach((healingSpellId) => {
        if (this.echoOfLight.masteryHealingBySpell[healingSpellId]) {
          spellInfo.healingDone += this.echoOfLight.masteryHealingBySpell[
            healingSpellId
          ].effectiveHealing;
          spellInfo.overhealingDone += this.echoOfLight.masteryHealingBySpell[
            healingSpellId
          ].overHealing;
        }
      });
    }

    return spellInfo;
  }
}

export default HolyPriestHealingEfficiencyTracker;
