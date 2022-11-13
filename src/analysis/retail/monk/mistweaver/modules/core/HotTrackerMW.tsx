import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { Options } from 'parser/core/Analyzer';
import Combatant from 'parser/core/Combatant';
import HotTracker, { Tracker, HotInfo } from 'parser/shared/modules/HotTracker';

const RAPID_DIFFUSION = 3000;
const REM_BASE_DURATION = 20000;
const ENV_BASE_DURATION = 6000;
const EF_BASE_DURATION = 8000;
const RISING_MIST = 2;

const UPWELLING = 4000;
const MISTWRAP = 1000;
const TFT_REM_EXTRA_DURATION = 10000;

class HotTrackerMW extends HotTracker {
  mistwrapActive: boolean;
  upwellingActive: boolean;
  rapidDiffusionActive: boolean;
  risingMistActive: boolean;
  rapidDiffusionRank: number;

  constructor(options: Options) {
    super(options);
    this.mistwrapActive = this.owner.selectedCombatant.hasTalent(TALENTS_MONK.MIST_WRAP_TALENT.id);
    this.upwellingActive = this.owner.selectedCombatant.hasTalent(TALENTS_MONK.UPWELLING_TALENT.id);
    this.rapidDiffusionActive = this.owner.selectedCombatant.hasTalent(TALENTS_MONK.RAPID_DIFFUSION_TALENT.id);
    this.rapidDiffusionRank = this.owner.selectedCombatant.getTalentRank(TALENTS_MONK.RAPID_DIFFUSION_TALENT);
    this.risingMistActive = this.owner.selectedCombatant.hasTalent(TALENTS_MONK.RISING_MIST_TALENT.id);
  }
  
  fromMistyPeaks(hot: Tracker): boolean {
    return hot.attributions.some(function (attr) {
      return attr.name.includes('Misty Peaks');
    });
  }

  fromHardcast(hot: Tracker): boolean {
    return hot.attributions.some(function (attr) {
      return attr.name.includes('Hardcast');
    });
  }

  fromRapidDiffusion(hot: Tracker): boolean {
    return hot.attributions.some(function (attr) {
      return attr.name.includes('Rapid Diffusion');
    });
  }

  // Renewing Mist applies with a longer duration if Thunder Focus Tea is active
  _calculateRemDuration(combatant: Combatant): number {
    return combatant.hasBuff(TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT.id)
      ? REM_BASE_DURATION + TFT_REM_EXTRA_DURATION
      : REM_BASE_DURATION;
  }

  _calculateMaxRemDuration(combatant: Combatant): number {
    return combatant.hasBuff(TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT.id)
      ? (REM_BASE_DURATION + TFT_REM_EXTRA_DURATION) * (combatant.hasTalent(TALENTS_MONK.RISING_MIST_TALENT.id) ? RISING_MIST : 1)
      : REM_BASE_DURATION * (combatant.hasTalent(TALENTS_MONK.RISING_MIST_TALENT.id) ? RISING_MIST : 1);
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
        procDuration: (this.owner.selectedCombatant.hasTalent(TALENTS_MONK.RAPID_DIFFUSION_TALENT.id) ? RAPID_DIFFUSION * this.selectedCombatant.getTalentRank(TALENTS_MONK.RAPID_DIFFUSION_TALENT) : undefined),
      },
      {
        spell: TALENTS_MONK.ENVELOPING_MIST_TALENT,
        duration: envMistDuration,
        tickPeriod: 1000,
        maxDuration: envMistDuration * (this.owner.selectedCombatant.hasTalent(TALENTS_MONK.RISING_MIST_TALENT.id) ? RISING_MIST : 1),
      },
      {
        spell: SPELLS.ESSENCE_FONT_BUFF,
        duration: essenceFontDuration,
        tickPeriod: 2000,
        maxDuration: essenceFontDuration * (this.owner.selectedCombatant.hasTalent(TALENTS_MONK.RISING_MIST_TALENT.id) ? RISING_MIST : 1),
      },
      {
        spell: SPELLS.FAELINE_STOMP_ESSENCE_FONT,
        duration: essenceFontDuration,
        tickPeriod: 2000,
        maxDuration: essenceFontDuration * (this.owner.selectedCombatant.hasTalent(TALENTS_MONK.RISING_MIST_TALENT.id) ? RISING_MIST : 1),
      },
    ];
  }
}

export default HotTrackerMW;
