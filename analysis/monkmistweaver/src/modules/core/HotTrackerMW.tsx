import SPELLS from 'common/SPELLS';
import { Options } from 'parser/core/Analyzer';
import Combatant from 'parser/core/Combatant';
import HotTracker, { HotInfoMap } from 'parser/shared/modules/HotTracker';

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
    this.mistwrapActive = this.owner.selectedCombatant.hasTalent(SPELLS.MIST_WRAP_TALENT.id);
    this.upwellingActive = this.owner.selectedCombatant.hasTalent(SPELLS.UPWELLING_TALENT.id);
  }

  // Renewing Mist applies with a longer duration if Thunder Focus Tea is active
  _calculateRemDuration(combatant: Combatant): number {
    return combatant.hasBuff(SPELLS.THUNDER_FOCUS_TEA.id)
      ? REM_BASE_DURATION + TFT_REM_EXTRA_DURATION
      : REM_BASE_DURATION;
  }

  _calculateMaxRemDuration(combatant: Combatant): number {
    return combatant.hasBuff(SPELLS.THUNDER_FOCUS_TEA.id)
      ? (REM_BASE_DURATION + TFT_REM_EXTRA_DURATION) * 2
      : REM_BASE_DURATION * 2;
  }

  _generateHotInfo(): HotInfoMap {
    // must be generated dynamically because it reads from traits
    const envMistDuration = ENV_BASE_DURATION + (this.mistwrapActive ? MISTWRAP : 0);
    const essenceFontDuration = EF_BASE_DURATION + (this.upwellingActive ? UPWELLING : 0);
    return {
      [SPELLS.RENEWING_MIST_HEAL.id]: {
        duration: this._calculateRemDuration,
        tickPeriod: 2000,
        maxDuration: this._calculateMaxRemDuration,
        bouncy: true,
        id: SPELLS.RENEWING_MIST_HEAL.id,
      },
      [SPELLS.ENVELOPING_MIST.id]: {
        duration: envMistDuration,
        tickPeriod: 1000,
        maxDuration: envMistDuration * 2,
        id: SPELLS.ENVELOPING_MIST.id,
      },
      [SPELLS.ESSENCE_FONT_BUFF.id]: {
        duration: essenceFontDuration,
        tickPeriod: 2000,
        maxDuration: essenceFontDuration * 2,
        id: SPELLS.ESSENCE_FONT_BUFF.id,
      },
    };
  }

  _generateHotList() {
    return [SPELLS.RENEWING_MIST_HEAL, SPELLS.ENVELOPING_MIST, SPELLS.ESSENCE_FONT_BUFF];
  }
}

export default HotTrackerMW;
