import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import HealingDone from 'parser/shared/modules/throughput/HealingDone';
import DamageDone from 'parser/shared/modules/throughput/DamageDone';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import HealingEfficiencyTracker, { SpellInfoDetails } from 'parser/core/healingEfficiency/HealingEfficiencyTracker';
import SPELLS from 'common/SPELLS';
import ManaTracker from 'parser/core/healingEfficiency/ManaTracker';
import Abilities from 'parser/core/modules/Abilities';

import EssenceFont from '../spells/EssenceFont';
import EnvelopingMists from '../spells/EnvelopingMists';
import SoothingMist from '../spells/SoothingMist';
import RenewingMist from '../spells/RenewingMist';
import Vivify from '../spells/Vivify';
import RefreshingJadeWind from '../talents/RefreshingJadeWind';
import ExpelHarm from '../spells/ExpelHarm';
import EssenceFontMastery from './EssenceFontMastery';

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
    refreshingJadeWind: RefreshingJadeWind,
    expelHarm: ExpelHarm,
  };

  protected manaTracker!: ManaTracker;
  protected abilityTracker!: AbilityTracker;
  protected healingDone!: HealingDone;
  protected damageDone!: DamageDone;
  protected castEfficiency!: CastEfficiency;
  protected abilities!: Abilities;
  protected essenceFont!: EssenceFont;
  protected essenceFontMastery!: EssenceFontMastery;
  protected envelopingMists!: EnvelopingMists;
  protected soothingMist!: SoothingMist;
  protected renewingMist!: RenewingMist;
  protected vivify!: Vivify;
  protected refreshingJadeWind!: RefreshingJadeWind;
  protected expelHarm!: ExpelHarm;

  getCustomSpellStats(spellInfo: SpellInfoDetails, spellId: number) {
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
    } else if (spellId === SPELLS.REFRESHING_JADE_WIND_TALENT.id) {
      spellInfo = this.getRefreshingJadeWindDetails(spellInfo);
    } else if (spellId === SPELLS.RISING_SUN_KICK.id) {
      spellInfo = this.getRisingSunKickDetails(spellInfo);
    } else if (spellId === SPELLS.INVOKE_YULON_THE_JADE_SERPENT.id) {
      spellInfo = this.getYulonDetails(spellInfo);
    } else if (spellId === SPELLS.INVOKE_CHI_JI_THE_RED_CRANE_TALENT.id) {
      spellInfo = this.getChijiDetails(spellInfo);
    } else if (spellId === SPELLS.EXPEL_HARM.id) {
      spellInfo = this.getExpelHarmDetails(spellInfo);
    }

    return spellInfo;
  }

  getSoothingMistDetails(spellInfo: SpellInfoDetails) {
    // the default tracker gets the healing of the soothing mists, but only the mana for the first cast. Every tick costs mana.
    spellInfo.manaSpent = this.soothingMist.soomTicks * SPELLS.SOOTHING_MIST.manaCost;
    spellInfo.healingDone = spellInfo.healingDone + this.soothingMist.gustsHealing;
    return spellInfo;
  }

  getEnvelopingMistsDetails(spellInfo: SpellInfoDetails) {
    spellInfo.healingDone = spellInfo.healingDone + this.envelopingMists.gustsHealing + this.envelopingMists.healingIncrease;
    // Enveloping breath part
    spellInfo.healingDone += this.healingDone.byAbility(SPELLS.ENVELOPING_BREATH.id).effective;
    spellInfo.overhealingDone += this.healingDone.byAbility(SPELLS.ENVELOPING_BREATH.id).overheal;
    return spellInfo;
  }

  getEssenceFontDetails(spellInfo: SpellInfoDetails) {
    spellInfo.healingDone = this.essenceFont.totalHealing + this.essenceFontMastery.healing + this.essenceFont.totalAbsorbs;
    spellInfo.overhealingDone = this.essenceFont.totalOverhealing;
    spellInfo.healingHits = this.essenceFont.targetsEF;
    return spellInfo;
  }

  getRenewingMistDetails(spellInfo: SpellInfoDetails) {
    // Vivify splashes due to ReM should be attributed to ReM's value, because without casting ReM, you wouldn't get the splash.
    spellInfo.healingDone = this.renewingMist.totalHealing + this.vivify.remVivifyHealing + this.renewingMist.gustsHealing + this.renewingMist.totalAbsorbs;
    spellInfo.overhealingDone = this.renewingMist.totalOverhealing;
    spellInfo.healingHits = this.renewingMist.healingHits;
    return spellInfo;
  }

  getVivifyDetails(spellInfo: SpellInfoDetails) {
    // As described in the ReM section, the ReM Vivify splashes need to be removed from the healing done.
    spellInfo.healingDone = spellInfo.healingDone + this.vivify.gustsHealing - this.vivify.remVivifyHealing;
    return spellInfo;
  }

  getRefreshingJadeWindDetails(spellInfo: SpellInfoDetails) {
    spellInfo.healingDone = this.refreshingJadeWind.healingRJW;
    spellInfo.overhealingDone = this.refreshingJadeWind.overhealingRJW;
    return spellInfo;
  }

  getRisingSunKickDetails(spellInfo: SpellInfoDetails) {
    // Since I don't want messy code right now it will only give the rising mist healing not any of the other fun stuff it gives indirectly
    spellInfo.healingDone = this.healingDone.byAbility(SPELLS.RISING_MIST_HEAL.id).effective;
    spellInfo.overhealingDone = this.healingDone.byAbility(SPELLS.RISING_MIST_HEAL.id).overheal;
    return spellInfo;
  }

  getYulonDetails(spellInfo: SpellInfoDetails) {
    // Get all soothing breath and enveloping breath healing since its all bc of yu'lon
    spellInfo.healingDone = this.healingDone.byAbility(SPELLS.SOOTHING_BREATH.id).effective;
    spellInfo.overhealingDone = this.healingDone.byAbility(SPELLS.SOOTHING_BREATH.id).overheal;
    return spellInfo;
  }

  getChijiDetails(spellInfo: SpellInfoDetails) {
    spellInfo.healingDone = this.healingDone.byAbility(SPELLS.GUST_OF_MISTS_CHIJI.id).effective;
    spellInfo.overhealingDone = this.healingDone.byAbility(SPELLS.GUST_OF_MISTS_CHIJI.id).overheal;
    return spellInfo;
  }

  getExpelHarmDetails(spellInfo: SpellInfoDetails) {
    spellInfo.healingDone = spellInfo.healingDone + this.expelHarm.gustsHealing + this.expelHarm.selfHealing + this.expelHarm.targetHealing;
    spellInfo.overhealingDone = spellInfo.overhealingDone + this.expelHarm.selfOverheal + this.expelHarm.targetOverheal;
    return spellInfo;
  }

}

export default MistweaverHealingEfficiencyTracker;
