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
          (combatant.hasTalent(TALENTS_MONK.RISING_MIST_TALENT) ? RISING_MIST : 1)
      : REM_BASE_DURATION *
          (combatant.hasTalent(TALENTS_MONK.RISING_MIST_TALENT) ? RISING_MIST : 1);
  }

  _generateHotInfo(): HotInfo[] {
    // must be generated dynamically because it reads from traits
    const envMistDuration = ENV_BASE_DURATION + (this.mistwrapActive ? MISTWRAP : 0);
    const essenceFontDuration = EF_BASE_DURATION + (this.upwellingActive ? UPWELLING : 0);
    return [
      {
        spell: SPELLS.RENEWING_MIST_HEAL,
        duration: this._calculateRemDuration,
        tickPeriod: 2000,
        maxDuration: this._calculateMaxRemDuration,
        bouncy: true,
        procDuration: this.owner.selectedCombatant.hasTalent(TALENTS_MONK.RAPID_DIFFUSION_TALENT)
          ? RAPID_DIFFUSION *
            this.selectedCombatant.getTalentRank(TALENTS_MONK.RAPID_DIFFUSION_TALENT) *
            (this.selectedCombatant.hasTalent(TALENTS_MONK.RISING_MIST_TALENT) ? RISING_MIST : 1)
          : undefined,
      },
      {
        spell: TALENTS_MONK.ENVELOPING_MIST_TALENT,
        duration: envMistDuration,
        tickPeriod: 1000,
        maxDuration:
          envMistDuration *
          (this.owner.selectedCombatant.hasTalent(TALENTS_MONK.RISING_MIST_TALENT)
            ? RISING_MIST
            : 1),
        procDuration: this.owner.selectedCombatant.hasTalent(TALENTS_MONK.MISTY_PEAKS_TALENT)
          ? MISTY_PEAKS_DURATION *
              this.selectedCombatant.getTalentRank(TALENTS_MONK.MISTY_PEAKS_TALENT) +
            ENV_BASE_DURATION // misty peaks can be extended for 100% of base env duration
          : undefined,
      },
      {
        spell: SPELLS.ENVELOPING_BREATH_HEAL,
        duration: envMistDuration,
        tickPeriod: 1000,
        maxDuration: envMistDuration,
      },
      {
        spell: SPELLS.ESSENCE_FONT_BUFF,
        duration: essenceFontDuration,
        tickPeriod: 2000,
        maxDuration:
          essenceFontDuration *
          (this.owner.selectedCombatant.hasTalent(TALENTS_MONK.RISING_MIST_TALENT)
            ? RISING_MIST
            : 1),
      },
      {
        spell: SPELLS.FAELINE_STOMP_ESSENCE_FONT,
        duration: essenceFontDuration,
        tickPeriod: 2000,
        maxDuration:
          essenceFontDuration *
          (this.owner.selectedCombatant.hasTalent(TALENTS_MONK.RISING_MIST_TALENT)
            ? RISING_MIST
            : 1),
      },
    ];
  }
}

export default HotTrackerMW;
