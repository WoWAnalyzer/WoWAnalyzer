import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import HealingDone from 'parser/shared/modules/HealingDone';
import DamageDone from 'parser/shared/modules/DamageDone';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import HealingEfficiencyTracker from 'parser/core/healingEfficiency/HealingEfficiencyTracker';
import SPELLS from 'common/SPELLS/index';
import ManaTracker from 'parser/core/healingEfficiency/ManaTracker';

import Abilities from 'parser/core/modules/Abilities';
import EssenceFont from 'parser/monk/mistweaver/modules/spells/EssenceFont';
import EssenceFontMastery from 'parser/monk/mistweaver/modules/features/EssenceFontMastery';
import EnvelopingMists from 'parser/monk/mistweaver/modules/spells/EnvelopingMists';
import SoothingMist from 'parser/monk/mistweaver/modules/spells/SoothingMist';
import RenewingMist from 'parser/monk/mistweaver/modules/spells/RenewingMist';
import Vivify from 'parser/monk/mistweaver/modules/spells/Vivify';

class MistweaverHealingEfficiencyTracker extends HealingEfficiencyTracker {
  static dependencies = {
    manaTracker: ManaTracker,
    abilityTracker: AbilityTracker,
    healingDone: HealingDone,
    damageDone: DamageDone,
    castEfficiency: CastEfficiency,

    // Custom dependencies
    abilities: Abilities,
    essenceFont: EssenceFont,
    essenceFontMastery: EssenceFontMastery,
    envelopingMists: EnvelopingMists,
    soothingMist: SoothingMist,
    renewingMist: RenewingMist,
    vivify: Vivify,
  };

  getCustomSpellStats(spellInfo, spellId) {
    if (spellId === SPELLS.ESSENCE_FONT.id) {
      spellInfo = this.getEssenceFontDetails(spellInfo);
    } else if (spellId === SPELLS.ENVELOPING_MIST.id) { //maybe consider adding tft buffed version's spell id too
      spellInfo = this.getEnvelopingMistsDetails(spellInfo);
    } else if (spellId === SPELLS.SOOTHING_MIST.id) {
      spellInfo = this.getSoothingMistDetails(spellInfo);
    } else if (spellId === SPELLS.RENEWING_MIST.id) {
      spellInfo = this.getRenewingMistDetails(spellInfo);
    } else if (spellId === SPELLS.VIVIFY.id) {
      spellInfo = this.getVivifyDetails(spellInfo);
    }

    return spellInfo;
  }

  getSoothingMistDetails(spellInfo) {
    // the default tracker gets the healing of the soothing mists, but only the mana for the first cast. Every tick costs mana.
    spellInfo.manaSpent = this.soothingMist.soomTicks * SPELLS.SOOTHING_MIST.manaCost;
    spellInfo.healingDone = spellInfo.healingDone + this.soothingMist.gustsHealing;
    return spellInfo;
  }

  getEnvelopingMistsDetails(spellInfo) {
    spellInfo.healingDone = spellInfo.healingDone + this.envelopingMists.gustsHealing + this.envelopingMists.healingIncrease;
    return spellInfo;
  }

  getEssenceFontDetails(spellInfo) {
    spellInfo.healingDone = this.essenceFont.totalHealing + this.essenceFontMastery.healing;
    spellInfo.overhealingDone = this.essenceFont.totalOverhealing;
    spellInfo.healingAbsorbed = this.essenceFont.totalAbsorbs;
    spellInfo.healingHits = this.essenceFont.targetsEF;
    return spellInfo;
  }

  getRenewingMistDetails(spellInfo) {
    // Vivify splashes due to ReM should be attributed to ReM's value, because without casting ReM, you wouldn't get the splash.
    spellInfo.healingDone = this.renewingMist.totalHealing + this.vivify.remVivifyHealing + this.renewingMist.gustsHealing;
    spellInfo.overhealingDone = this.renewingMist.totalOverhealing;
    spellInfo.healingAbsorbed = this.renewingMist.totalAbsorbs;
    spellInfo.healingHits = this.renewingMist.healingHits;
    return spellInfo;
  }

  getVivifyDetails(spellInfo) {
    // As described in the ReM section, the ReM Vivify splashes need to be removed from the healing done.
    spellInfo.healingDone = spellInfo.healingDone + this.vivify.gustsHealing - this.vivify.remVivifyHealing;
    return spellInfo;
  }
}

export default MistweaverHealingEfficiencyTracker;
