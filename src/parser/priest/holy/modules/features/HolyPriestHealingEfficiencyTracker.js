import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import HealingDone from 'parser/shared/modules/HealingDone';
import DamageDone from 'parser/shared/modules/DamageDone';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import HealingEfficiencyTracker from 'parser/core/healingEfficiency/HealingEfficiencyTracker';
import SPELLS from 'common/SPELLS/index';
import ManaTracker from 'parser/core/healingEfficiency/ManaTracker';

import Abilities from 'parser/priest/holy/modules/Abilities';
import Renew from 'parser/priest/holy/modules/spells/Renew';
import PrayerOfMending from 'parser/priest/holy/modules/spells/PrayerOfMending';
import HolyWordSalvation from 'parser/priest/holy/modules/talents/100/HolyWordSalvation';

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
  };

  getCustomSpellStats(spellInfo, spellId) {
    // If we have a spell that has custom logic for the healing/damage numbers, do that before the rest of our calculations.
    if (spellId === SPELLS.RENEW.id) {
      spellInfo = this.getRenewDetails(spellInfo);
    } else if (spellId === SPELLS.PRAYER_OF_MENDING_CAST.id) {
      spellInfo = this.getPomDetails(spellInfo);
    } else if (spellId === SPELLS.HOLY_WORD_SALVATION_TALENT.id) {
      spellInfo = this.getSalvationDetails(spellInfo);
    }

    return spellInfo;
  }

  getRenewDetails(spellInfo) {
    // This represents that amount of healing done by HARD CASTING renew.
    // We don't want renew to get Hpm credit for healing that we didn't spend mana on.
    spellInfo.healingDone = this.renew.healingFromRenew(this.renew.renewsCast);
    spellInfo.overhealingDone = this.renew.overhealingFromRenew(this.renew.renewsCast);
    spellInfo.healingAbsorbed = this.renew.absorptionFromRenew(this.renew.renewsCast);
    spellInfo.healingHits = (this.renew.renewsCast / this.renew.totalRenewApplications) * this.renew.totalRenewTicks;
    return spellInfo;
  }

  getPomDetails(spellInfo) {
    // This represents that amount of healing done by HARD CASTING PoM.
    // We don't want PoM to get Hpm credit for healing that we didn't spend mana on.
    // We *do* want PoM to get credit for any renews it leave behind from Benediction.
    spellInfo.healingDone = this.prayerOfMending.pomTicksFromCast * this.prayerOfMending.averagePomTickHeal;
    spellInfo.overhealingDone = this.prayerOfMending.pomTicksFromCast * this.prayerOfMending.averagePomTickOverheal;
    spellInfo.healingAbsorbed = this.prayerOfMending.pomTicksFromCast * this.prayerOfMending.averagePomTickAbsorption;
    spellInfo.healingHits = this.prayerOfMending.pomTicksFromCast;

    return spellInfo;
  }

  getSalvationDetails(spellInfo) {
    spellInfo.healingDone = this.salvation.totalHealing;
    spellInfo.overhealingDone = this.salvation.totalOverHealing;
    spellInfo.healingAbsorbed = this.salvation.totalAbsorbed;

    return spellInfo;
  }
}

export default HolyPriestHealingEfficiencyTracker;
