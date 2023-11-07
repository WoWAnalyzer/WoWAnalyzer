import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import HealingEfficiencyTracker, {
  SpellInfoDetails,
} from 'parser/core/healingEfficiency/HealingEfficiencyTracker';
import ManaTracker from 'parser/core/healingEfficiency/ManaTracker';
import Abilities from 'parser/core/modules/Abilities';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import DamageDone from 'parser/shared/modules/throughput/DamageDone';
import HealingDone from 'parser/shared/modules/throughput/HealingDone';

import FaelineStompHealing from '../spells/FaelineStompHealing';
import EnvelopingMists from '../spells/EnvelopingMists';
import EssenceFont from '../spells/EssenceFont';
import ExpelHarm from '../spells/ExpelHarm';
import RenewingMist from '../spells/RenewingMist';
import SoothingMist from '../spells/SoothingMist';
import Vivify from '../spells/Vivify';
import RefreshingJadeWind from '../spells/RefreshingJadeWind';
import AncientTeachings from '../spells/AncientTeachings';
import RapidDiffusion from '../spells/RapidDiffusion';
import DancingMists from '../spells/DancingMists';
import MistyPeaks from '../spells/MistyPeaks';
import RisingMist from '../spells/RisingMist';
import ShaohaosLessons from '../spells/ShaohaosLessons';

class MistweaverHealingEfficiencyTracker extends HealingEfficiencyTracker {
  static dependencies = {
    ...HealingEfficiencyTracker.dependencies,
    manaTracker: ManaTracker,
    abilityTracker: AbilityTracker,
    healingDone: HealingDone,
    damageDone: DamageDone,
    castEfficiency: CastEfficiency,

    // Custom dependencies
    abilities: Abilities,
    essenceFont: EssenceFont,
    envelopingMists: EnvelopingMists,
    soothingMist: SoothingMist,
    renewingMist: RenewingMist,
    vivify: Vivify,
    refreshingJadeWind: RefreshingJadeWind,
    expelHarm: ExpelHarm,
    faelineStompHealing: FaelineStompHealing,
    ancientTeachings: AncientTeachings,
    rapidDiffusion: RapidDiffusion,
    dancingMists: DancingMists,
    mistyPeaks: MistyPeaks,
    risingMist: RisingMist,
    shaohaosLessons: ShaohaosLessons,
  };

  protected manaTracker!: ManaTracker;
  protected abilityTracker!: AbilityTracker;
  protected healingDone!: HealingDone;
  protected damageDone!: DamageDone;
  protected castEfficiency!: CastEfficiency;
  protected abilities!: Abilities;
  protected essenceFont!: EssenceFont;
  protected envelopingMists!: EnvelopingMists;
  protected soothingMist!: SoothingMist;
  protected renewingMist!: RenewingMist;
  protected vivify!: Vivify;
  protected refreshingJadeWind!: RefreshingJadeWind;
  protected expelHarm!: ExpelHarm;
  protected faelineStompHealing!: FaelineStompHealing;
  protected ancientTeachings!: AncientTeachings;
  protected rapidDiffusion!: RapidDiffusion;
  protected dancingMists!: DancingMists;
  protected mistyPeaks!: MistyPeaks;
  protected risingMist!: RisingMist;
  protected shaohaosLessons!: ShaohaosLessons;

  getCustomSpellStats(spellInfo: SpellInfoDetails, spellId: number) {
    if (spellId === TALENTS_MONK.ESSENCE_FONT_TALENT.id) {
      spellInfo = this.getEssenceFontDetails(spellInfo);
    } else if (spellId === TALENTS_MONK.ENVELOPING_MIST_TALENT.id) {
      //maybe consider adding tft buffed version's spell id too
      spellInfo = this.getEnvelopingMistsDetails(spellInfo);
    } else if (spellId === TALENTS_MONK.SOOTHING_MIST_TALENT.id) {
      spellInfo = this.getSoothingMistDetails(spellInfo);
    } else if (spellId === TALENTS_MONK.RENEWING_MIST_TALENT.id) {
      spellInfo = this.getRenewingMistDetails(spellInfo);
    } else if (spellId === SPELLS.VIVIFY.id) {
      spellInfo = this.getVivifyDetails(spellInfo);
    } else if (spellId === TALENTS_MONK.REFRESHING_JADE_WIND_TALENT.id) {
      spellInfo = this.getRefreshingJadeWindDetails(spellInfo);
    } else if (spellId === TALENTS_MONK.RISING_SUN_KICK_TALENT.id) {
      spellInfo = this.getRisingSunKickDetails(spellInfo);
    } else if (spellId === TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT.id) {
      spellInfo = this.getYulonDetails(spellInfo);
    } else if (spellId === TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT.id) {
      spellInfo = this.getChijiDetails(spellInfo);
    } else if (spellId === SPELLS.EXPEL_HARM.id) {
      spellInfo = this.getExpelHarmDetails(spellInfo);
    } else if (spellId === TALENTS_MONK.FAELINE_STOMP_TALENT.id) {
      spellInfo = this.getFLSDetails(spellInfo);
    } else if (spellId === TALENTS_MONK.ZEN_PULSE_TALENT.id) {
      spellInfo = this.getZenPulseDetails(spellInfo);
    } else if (spellId === TALENTS_MONK.SHEILUNS_GIFT_TALENT.id) {
      spellInfo = this.getSheilunsGiftDetails(spellInfo);
    }

    return spellInfo;
  }

  getSoothingMistDetails(spellInfo: SpellInfoDetails) {
    // the default tracker gets the healing of the soothing mists, but only the mana for the first cast. Every tick costs mana.
    spellInfo.manaSpent =
      this.soothingMist.soomTicks * (TALENTS_MONK.SOOTHING_MIST_TALENT.manaCostPerSecond ?? 0);
    spellInfo.healingDone = spellInfo.healingDone + this.soothingMist.gustsHealing;
    return spellInfo;
  }

  getEnvelopingMistsDetails(spellInfo: SpellInfoDetails) {
    spellInfo.healingDone =
      spellInfo.healingDone -
      this.mistyPeaks.totalHealing +
      this.rapidDiffusion.mistyPeakHealingFromEnvRem +
      this.envelopingMists.gustsHealing +
      this.rapidDiffusion.remHealingFromEnv +
      this.envelopingMists.healingIncrease;
    // Enveloping breath part
    spellInfo.healingDone += this.healingDone.byAbility(SPELLS.ENVELOPING_BREATH_HEAL.id).effective;
    spellInfo.overhealingDone += this.healingDone.byAbility(
      SPELLS.ENVELOPING_BREATH_HEAL.id,
    ).overheal;
    return spellInfo;
  }

  getEssenceFontDetails(spellInfo: SpellInfoDetails) {
    spellInfo.healingDone = this.essenceFont.totalHealing;
    spellInfo.overhealingDone = this.essenceFont.totalOverhealing;
    spellInfo.healingDone += this.ancientTeachings.healingFromEF;
    spellInfo.overhealingDone += this.ancientTeachings.overhealingFromEF;
    spellInfo.timeSpentCasting = this.essenceFont.timeSpentCasting;
    return spellInfo;
  }

  getRenewingMistDetails(spellInfo: SpellInfoDetails) {
    spellInfo.healingDone =
      this.renewingMist.totalHealing +
      this.mistyPeaks.totalHealing -
      this.rapidDiffusion.mistyPeakHealingFromEnvRem -
      this.rapidDiffusion.mistyPeakHealingFromRskRem -
      this.rapidDiffusion.remHealing -
      this.dancingMists.remHealingFromRD +
      this.renewingMist.gustsHealing +
      this.renewingMist.totalAbsorbs;
    spellInfo.overhealingDone = this.renewingMist.totalOverhealing;
    spellInfo.healingHits = this.renewingMist.healingHits;
    return spellInfo;
  }

  getVivifyDetails(spellInfo: SpellInfoDetails) {
    // As described in the ReM section, the ReM Vivify splashes need to be removed from the healing done.
    spellInfo.healingDone =
      this.vivify.mainTargetHealing + this.vivify.cleaveHealing + this.vivify.gomHealing;
    spellInfo.overhealingDone =
      this.vivify.mainTargetOverhealing +
      this.vivify.cleaveOverhealing +
      this.vivify.gomOverhealing;
    return spellInfo;
  }

  getRefreshingJadeWindDetails(spellInfo: SpellInfoDetails) {
    spellInfo.healingDone = this.refreshingJadeWind.healingRJW;
    spellInfo.overhealingDone = this.refreshingJadeWind.overhealingRJW;
    return spellInfo;
  }

  getRisingSunKickDetails(spellInfo: SpellInfoDetails) {
    // Since I don't want messy code right now it will only give the rising mist healing not any of the other fun stuff it gives indirectly
    spellInfo.healingDone =
      this.risingMist.totalHealing +
      this.rapidDiffusion.remHealingFromRSK +
      this.rapidDiffusion.mistyPeakHealingFromRskRem;
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

  getSheilunsGiftDetails(spellInfo: SpellInfoDetails) {
    spellInfo.healingDone = spellInfo.healingDone + this.shaohaosLessons.totalHealing;
    return spellInfo;
  }

  getExpelHarmDetails(spellInfo: SpellInfoDetails) {
    spellInfo.healingDone =
      spellInfo.healingDone +
      this.expelHarm.gustsHealing +
      this.expelHarm.selfHealing +
      this.expelHarm.targetHealing;
    spellInfo.overhealingDone =
      spellInfo.overhealingDone + this.expelHarm.selfOverheal + this.expelHarm.targetOverheal;
    return spellInfo;
  }

  getFLSDetails(spellInfo: SpellInfoDetails) {
    spellInfo.healingDone =
      this.faelineStompHealing.flsHealing + this.faelineStompHealing.efHealing;
    spellInfo.healingDone += this.ancientTeachings.healingFromFLS;
    spellInfo.overhealingDone =
      this.faelineStompHealing.flsOverhealing + this.faelineStompHealing.efOverhealing;
    spellInfo.overhealingDone += this.ancientTeachings.overhealingFromFLS;
    return spellInfo;
  }

  getZenPulseDetails(spellInfo: SpellInfoDetails) {
    spellInfo.healingDone = this.healingDone.byAbility(SPELLS.ZEN_PULSE_HEAL.id).effective;
    spellInfo.overhealingDone = this.healingDone.byAbility(SPELLS.ZEN_PULSE_HEAL.id).overheal;
    return spellInfo;
  }
}

export default MistweaverHealingEfficiencyTracker;
