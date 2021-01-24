import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import HealingDone from 'parser/shared/modules/throughput/HealingDone';
import DamageDone from 'parser/shared/modules/throughput/DamageDone';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import HealingEfficiencyTracker from 'parser/core/healingEfficiency/HealingEfficiencyTracker';
import SPELLS from 'common/SPELLS';
import ManaTracker from 'parser/core/healingEfficiency/ManaTracker';

import Abilities from '@wowanalyzer/priest-holy/src/modules/Abilities';
import Renew from '@wowanalyzer/priest-holy/src/modules/spells/Renew';
import PrayerOfMending from '@wowanalyzer/priest-holy/src/modules/spells/PrayerOfMending';
import HolyWordSalvation from '@wowanalyzer/priest-holy/src/modules/talents/100/HolyWordSalvation';
import EchoOfLightMastery from '@wowanalyzer/priest-holy/src/modules/core/EchoOfLightMastery';

class HolyPriestHealingEfficiencyTracker extends HealingEfficiencyTracker {
  static dependencies = {
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
    if (spellId === SPELLS.RENEW.id) {
      spellInfo = this.getRenewDetails(spellInfo);
    } else if (spellId === SPELLS.PRAYER_OF_MENDING_CAST.id) {
      spellInfo = this.getPomDetails(spellInfo);
    } else if (spellId === SPELLS.HOLY_WORD_SALVATION_TALENT.id) {
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
    spellInfo.healingHits = (this.renew.renewsCast / this.renew.totalRenewApplications) * this.renew.totalRenewTicks;

    return spellInfo;
  }

  getPomDetails(spellInfo: any) {
    // This represents that amount of healing done by HARD CASTING PoM.
    // We don't want PoM to get Hpm credit for healing that we didn't spend mana on.
    // We *do* want PoM to get credit for any renews it leave behind from Benediction.
    spellInfo.healingDone = this.prayerOfMending.pomTicksFromCast * this.prayerOfMending.averagePomTickHeal;
    spellInfo.overhealingDone = this.prayerOfMending.pomTicksFromCast * this.prayerOfMending.averagePomTickOverheal;
    spellInfo.healingAbsorbed = this.prayerOfMending.pomTicksFromCast * this.prayerOfMending.averagePomTickAbsorption;
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
      spellInfo.healingDone += this.echoOfLight.masteryHealingBySpell[spellInfo.spell.id].effectiveHealing;
      spellInfo.overhealingDone += this.echoOfLight.masteryHealingBySpell[spellInfo.spell.id].overHealing;
    }

    if (healingSpellIds) {
      healingSpellIds.forEach(healingSpellId => {
        if (this.echoOfLight.masteryHealingBySpell[healingSpellId]) {
          spellInfo.healingDone += this.echoOfLight.masteryHealingBySpell[healingSpellId].effectiveHealing;
          spellInfo.overhealingDone += this.echoOfLight.masteryHealingBySpell[healingSpellId].overHealing;
        }
      });
    }

    return spellInfo;
  }
}

export default HolyPriestHealingEfficiencyTracker;
