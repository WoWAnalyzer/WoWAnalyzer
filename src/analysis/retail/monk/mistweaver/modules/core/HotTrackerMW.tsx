import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { Options } from 'parser/core/Analyzer';
import Combatant from 'parser/core/Combatant';
import HotTracker, { Tracker, HotInfo } from 'parser/shared/modules/HotTracker';

const REM_BASE_DURATION = 20000;
const ENV_BASE_DURATION = 6000;
const EF_BASE_DURATION = 8000;

const UPWELLING = 4000;
const MISTWRAP = 1000;
const TFT_REM_EXTRA_DURATION = 10000;

class HotTrackerMW extends HotTracker {
  mistwrapActive: boolean;
  upwellingActive: boolean;

  constructor(options: Options) {
    super(options);
    this.mistwrapActive = this.owner.selectedCombatant.hasTalent(TALENTS_MONK.MIST_WRAP_TALENT.id);
    this.upwellingActive = this.owner.selectedCombatant.hasTalent(TALENTS_MONK.UPWELLING_TALENT.id);
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

  // Renewing Mist applies with a longer duration if Thunder Focus Tea is active
  _calculateRemDuration(combatant: Combatant): number {
    return combatant.hasBuff(TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT.id)
      ? REM_BASE_DURATION + TFT_REM_EXTRA_DURATION
      : REM_BASE_DURATION;
  }

  _calculateMaxRemDuration(combatant: Combatant): number {
    return combatant.hasBuff(TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT.id)
      ? (REM_BASE_DURATION + TFT_REM_EXTRA_DURATION) * 2
      : REM_BASE_DURATION * 2;
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
      },
      {
        spell: TALENTS_MONK.ENVELOPING_MIST_TALENT,
        duration: envMistDuration,
        tickPeriod: 1000,
        maxDuration: envMistDuration * 2,
      },
      {
        spell: SPELLS.ESSENCE_FONT_BUFF,
        duration: essenceFontDuration,
        tickPeriod: 2000,
        maxDuration: essenceFontDuration * 2,
      },
      {
        spell: SPELLS.FAELINE_STOMP_ESSENCE_FONT,
        duration: essenceFontDuration,
        tickPeriod: 2000,
        maxDuration: essenceFontDuration * 2,
      },
    ];
  }
}

export default HotTrackerMW;
