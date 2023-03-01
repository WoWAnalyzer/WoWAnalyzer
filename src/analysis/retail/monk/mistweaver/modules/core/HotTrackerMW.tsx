import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { Options } from 'parser/core/Analyzer';
import Combatant from 'parser/core/Combatant';
import HotTracker, { Tracker, HotInfo, Extension } from 'parser/shared/modules/HotTracker';
import { ATTRIBUTION_STRINGS } from '../../constants';

const RAPID_DIFFUSION = 3000;
const MISTY_PEAKS_DURATION = 1000;
const REM_BASE_DURATION = 20000;
const ENV_BASE_DURATION = 6000;
const EF_BASE_DURATION = 8000;
const RISING_MIST = 2;

const UPWELLING = 4000;
const MISTWRAP = 1000;
const TFT_REM_EXTRA_DURATION = 10000;

const HARDCAST = 'Hardcast';

class HotTrackerMW extends HotTracker {
  mistwrapActive: boolean;
  upwellingActive: boolean;
  rapidDiffusionActive: boolean;
  risingMistActive: boolean;
  rapidDiffusionRank: number;

  constructor(options: Options) {
    super(options);
    this.mistwrapActive = this.owner.selectedCombatant.hasTalent(TALENTS_MONK.MIST_WRAP_TALENT);
    this.upwellingActive = this.owner.selectedCombatant.hasTalent(TALENTS_MONK.UPWELLING_TALENT);
    this.rapidDiffusionActive = this.owner.selectedCombatant.hasTalent(
      TALENTS_MONK.RAPID_DIFFUSION_TALENT,
    );
    this.rapidDiffusionRank = this.owner.selectedCombatant.getTalentRank(
      TALENTS_MONK.RAPID_DIFFUSION_TALENT,
    );
    this.risingMistActive = this.owner.selectedCombatant.hasTalent(TALENTS_MONK.RISING_MIST_TALENT);
  }

  fromRapidDiffusionRisingSunKick(hot: Tracker): boolean {
    return hot.attributions.some(function (attr) {
      return attr.name === ATTRIBUTION_STRINGS.RAPID_DIFFUSION_SOURCES.RD_SOURCE_RSK;
    });
  }

  fromRapidDiffusionEnvelopingMist(hot: Tracker): boolean {
    return hot.attributions.some(function (attr) {
      return attr.name === ATTRIBUTION_STRINGS.RAPID_DIFFUSION_SOURCES.RD_SOURCE_ENV;
    });
  }

  fromDancingMistRapidDiffusion(hot: Tracker): boolean {
    return hot.attributions.some(function (attr) {
      return attr.name === ATTRIBUTION_STRINGS.DANCING_MIST_SOURCES.DM_SOURCE_RD;
    });
  }

  fromDancingMistHardCast(hot: Tracker): boolean {
    return hot.attributions.some(function (attr) {
      return attr.name === ATTRIBUTION_STRINGS.DANCING_MIST_SOURCES.DM_SOURCE_HC;
    });
  }

  fromDancingMistMistsOfLife(hot: Tracker): boolean {
    return hot.attributions.some(function (attr) {
      return attr.name === ATTRIBUTION_STRINGS.DANCING_MIST_SOURCES.DM_SOURCE_MOL;
    });
  }

  fromMistyPeaks(hot: Tracker): boolean {
    return hot.attributions.some(function (attr) {
      return attr.name === ATTRIBUTION_STRINGS.MISTY_PEAKS_ENVELOPING_MIST;
    });
  }

  fromMistsOfLife(hot: Tracker): boolean {
    return hot.attributions.some(function (attr) {
      return attr.name === ATTRIBUTION_STRINGS.MISTS_OF_LIFE_RENEWING_MIST;
    });
  }

  fromHardcast(hot: Tracker): boolean {
    return hot.attributions.some(function (attr) {
      return attr.name.includes(HARDCAST);
    });
  }

  fromBounce(hot: Tracker): boolean {
    return hot.attributions.some(function (attr) {
      return attr.name === ATTRIBUTION_STRINGS.BOUNCED;
    });
  }

  fromRapidDiffusion(hot: Tracker): boolean {
    return hot.attributions.some(function (attr) {
      return attr.name === ATTRIBUTION_STRINGS.RAPID_DIFFUSION_RENEWING_MIST;
    });
  }

  fromDancingMists(hot: Tracker): boolean {
    return hot.attributions.some(function (attr) {
      return attr.name === ATTRIBUTION_STRINGS.DANCING_MIST_RENEWING_MIST;
    });
  }

  // Decide which extension is responsible for allowing this extra vivify cleave
  getRemExtensionForTimestamp(hot: Tracker, timestamp: number): Extension | null {
    if (timestamp <= hot.originalEnd) {
      return null;
    }
    let currentStart = hot.originalEnd;
    for (const extension of hot.extensions) {
      if (timestamp <= currentStart + extension.amount) {
        return extension;
      }
      currentStart += extension.amount;
    }
    return null; // should never happen
  }

  // Renewing Mist applies with a longer duration if Thunder Focus Tea is active
  _calculateRemDuration(combatant: Combatant): number {
    return combatant.hasBuff(TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT.id)
      ? REM_BASE_DURATION + TFT_REM_EXTRA_DURATION
      : REM_BASE_DURATION;
  }

  _calculateMaxRemDuration(combatant: Combatant): number {
    return combatant.hasBuff(TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT.id)
      ? (REM_BASE_DURATION + TFT_REM_EXTRA_DURATION) *
          (combatant.getTalentRank(TALENTS_MONK.RISING_MIST_TALENT) * RISING_MIST)
      : REM_BASE_DURATION *
          (combatant.getTalentRank(TALENTS_MONK.RISING_MIST_TALENT) * RISING_MIST);
  }

  _calculateEnvDuration(combatant: Combatant): number {
    return combatant.hasTalent(TALENTS_MONK.MIST_WRAP_TALENT)
      ? ENV_BASE_DURATION + MISTWRAP
      : ENV_BASE_DURATION;
  }

  _calculateMaxEnvDuration(combatant: Combatant): number {
    return (
      (combatant.hasTalent(TALENTS_MONK.MIST_WRAP_TALENT)
        ? ENV_BASE_DURATION + MISTWRAP
        : ENV_BASE_DURATION) *
      combatant.getTalentRank(TALENTS_MONK.RISING_MIST_TALENT) *
      RISING_MIST
    );
  }

  _calculateEssenceFontDuration(combatant: Combatant): number {
    return combatant.hasTalent(TALENTS_MONK.UPWELLING_TALENT)
      ? EF_BASE_DURATION + UPWELLING
      : EF_BASE_DURATION;
  }

  _calculateMaxEssenceFontDuration(combatant: Combatant): number {
    return (
      (combatant.hasTalent(TALENTS_MONK.UPWELLING_TALENT)
        ? EF_BASE_DURATION + UPWELLING
        : EF_BASE_DURATION) *
      combatant.getTalentRank(TALENTS_MONK.RISING_MIST_TALENT) *
      RISING_MIST
    );
  }

  _getRapidDiffusionMaxDuration(combatant: Combatant): number {
    return (
      (combatant.hasTalent(TALENTS_MONK.RISING_MIST_TALENT)
        ? RAPID_DIFFUSION * RISING_MIST
        : RAPID_DIFFUSION) * combatant.getTalentRank(TALENTS_MONK.RAPID_DIFFUSION_TALENT)
    );
  }

  _getRapidDiffusionDuration(combatant: Combatant): number {
    return RAPID_DIFFUSION * combatant.getTalentRank(TALENTS_MONK.RAPID_DIFFUSION_TALENT);
  }

  _getMistyPeaksMaxDuration(combatant: Combatant): number {
    return (
      MISTY_PEAKS_DURATION * combatant.getTalentRank(TALENTS_MONK.MISTY_PEAKS_TALENT) +
      combatant.getTalentRank(TALENTS_MONK.RISING_MIST_TALENT) * ENV_BASE_DURATION // TODO: REMOVE ENV BASE DURATION WHEN 10.0.7 HIT
    );
  }

  _getMistyPeaksDuration(combatant: Combatant): number {
    return MISTY_PEAKS_DURATION * combatant.getTalentRank(TALENTS_MONK.MISTY_PEAKS_TALENT);
  }

  _generateHotInfo(): HotInfo[] {
    // must be generated dynamically because it reads from traits
    return [
      {
        spell: SPELLS.RENEWING_MIST_HEAL,
        duration: this._calculateRemDuration,
        tickPeriod: 2000,
        maxDuration: this._calculateMaxRemDuration,
        bouncy: true,
        procDuration: this._getRapidDiffusionDuration,
      },
      {
        spell: TALENTS_MONK.ENVELOPING_MIST_TALENT,
        duration: this._calculateEnvDuration,
        tickPeriod: 1000,
        maxDuration: this._calculateMaxEnvDuration,
        procDuration: this._getMistyPeaksDuration,
      },
      {
        spell: SPELLS.ENVELOPING_BREATH_HEAL,
        duration: this._calculateEnvDuration,
        tickPeriod: 1000,
        maxDuration: this._calculateEnvDuration,
      },
      {
        spell: SPELLS.ESSENCE_FONT_BUFF,
        duration: this._calculateEssenceFontDuration,
        tickPeriod: 2000,
        maxDuration: this._calculateMaxEssenceFontDuration,
      },
      {
        spell: SPELLS.FAELINE_STOMP_ESSENCE_FONT,
        duration: this._calculateEssenceFontDuration,
        tickPeriod: 2000,
        maxDuration: this._calculateMaxEssenceFontDuration,
      },
    ];
  }
}

export default HotTrackerMW;
