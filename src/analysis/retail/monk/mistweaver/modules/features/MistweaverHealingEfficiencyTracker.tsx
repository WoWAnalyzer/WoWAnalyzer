import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import HealingEfficiencyTracker, {
  SpellInfoDetails,
} from 'parser/core/healingEfficiency/HealingEfficiencyTracker';

import JadefireStompHealing from '../spells/JadefireStompHealing';
import EnvelopingMists from '../spells/EnvelopingMists';
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
import CraneStyle from '../spells/CraneStyle';
import ZenPulse from '../spells/ZenPulse';
import TearOfMorning from '../spells/TearOfMorning';

class MistweaverHealingEfficiencyTracker extends HealingEfficiencyTracker {
  static dependencies = {
    ...HealingEfficiencyTracker.dependencies,

    // Custom dependencies
    envelopingMists: EnvelopingMists,
    soothingMist: SoothingMist,
    renewingMist: RenewingMist,
    vivify: Vivify,
    refreshingJadeWind: RefreshingJadeWind,
    expelHarm: ExpelHarm,
    jadefireStompHealing: JadefireStompHealing,
    ancientTeachings: AncientTeachings,
    rapidDiffusion: RapidDiffusion,
    dancingMists: DancingMists,
    mistyPeaks: MistyPeaks,
    risingMist: RisingMist,
    shaohaosLessons: ShaohaosLessons,
    craneStyle: CraneStyle,
    zenPulse: ZenPulse,
    tearOfMorning: TearOfMorning,
  };

  protected envelopingMists!: EnvelopingMists;
  protected soothingMist!: SoothingMist;
  protected renewingMist!: RenewingMist;
  protected vivify!: Vivify;
  protected refreshingJadeWind!: RefreshingJadeWind;
  protected expelHarm!: ExpelHarm;
  protected jadefireStompHealing!: JadefireStompHealing;
  protected ancientTeachings!: AncientTeachings;
  protected rapidDiffusion!: RapidDiffusion;
  protected dancingMists!: DancingMists;
  protected mistyPeaks!: MistyPeaks;
  protected risingMist!: RisingMist;
  protected shaohaosLessons!: ShaohaosLessons;
  protected craneStyle!: CraneStyle;
  protected zenPulse!: ZenPulse;
  protected tearOfMorning!: TearOfMorning;

  getCustomSpellStats(spellInfo: SpellInfoDetails, spellId: number) {
    if (spellId === TALENTS_MONK.ENVELOPING_MIST_TALENT.id) {
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
    } else if (spellId === TALENTS_MONK.JADEFIRE_STOMP_TALENT.id) {
      spellInfo = this.getJFSDetails(spellInfo);
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
      this.envelopingMists.healingIncrease +
      this.tearOfMorning.tftCleaveHealing +
      this.healingDone.byAbility(SPELLS.ENVELOPING_MIST_TFT.id).effective;

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
    spellInfo.healingDone =
      this.vivify.mainTargetHealing +
      this.vivify.cleaveHealing +
      this.vivify.gomHealing +
      this.zenPulse.healing;

    spellInfo.overhealingDone =
      this.vivify.mainTargetOverhealing +
      this.vivify.cleaveOverhealing +
      this.zenPulse.overhealing +
      this.vivify.gomOverhealing;

    spellInfo.healingHits += this.vivify.cleaveHits;
    spellInfo.healingHits += this.zenPulse.zenPulseHits;
    return spellInfo;
  }

  getRefreshingJadeWindDetails(spellInfo: SpellInfoDetails) {
    spellInfo.healingDone = this.refreshingJadeWind.healingRJW;
    spellInfo.overhealingDone = this.refreshingJadeWind.overhealingRJW;
    return spellInfo;
  }

  getRisingSunKickDetails(spellInfo: SpellInfoDetails) {
    spellInfo.healingDone =
      this.risingMist.totalHealing +
      this.rapidDiffusion.remHealingFromRSK +
      this.rapidDiffusion.mistyPeakHealingFromRskRem +
      this.craneStyle.rskHealing;
    spellInfo.overhealingDone = this.healingDone.byAbility(SPELLS.RISING_MIST_HEAL.id).overheal;
    return spellInfo;
  }

  getYulonDetails(spellInfo: SpellInfoDetails) {
    const soob = this.healingDone.byAbility(SPELLS.SOOTHING_BREATH.id);
    const chiCocoon = this.healingDone.byAbility(SPELLS.CHI_COCOON_HEAL_YULON.id);
    const envBreath = this.healingDone.byAbility(SPELLS.ENVELOPING_BREATH_HEAL.id);

    spellInfo.healingDone = soob.effective + chiCocoon.effective + envBreath.effective;
    spellInfo.overhealingDone = envBreath.overheal + soob.overheal + chiCocoon.overheal;

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
    spellInfo.healingDone = this.expelHarm.gustsHealing + this.expelHarm.selfHealing;
    spellInfo.overhealingDone = spellInfo.overhealingDone + this.expelHarm.selfOverheal;
    return spellInfo;
  }

  getJFSDetails(spellInfo: SpellInfoDetails) {
    spellInfo.healingDone = this.jadefireStompHealing.jfsHealing;
    spellInfo.healingDone += this.ancientTeachings.totalHealing;
    spellInfo.overhealingDone = this.jadefireStompHealing.jfsOverhealing;
    spellInfo.overhealingDone += this.ancientTeachings.overhealing;
    return spellInfo;
  }

  getZenPulseDetails(spellInfo: SpellInfoDetails) {
    spellInfo.healingDone = this.healingDone.byAbility(SPELLS.ZEN_PULSE_HEAL.id).effective;
    spellInfo.overhealingDone = this.healingDone.byAbility(SPELLS.ZEN_PULSE_HEAL.id).overheal;
    return spellInfo;
  }
}

export default MistweaverHealingEfficiencyTracker;
