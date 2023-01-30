import SPELLS from 'common/SPELLS';
import { TALENTS_EVOKER } from 'common/TALENTS';
import { Options } from 'parser/core/Analyzer';
import HotTracker, { Tracker, HotInfo } from 'parser/shared/modules/HotTracker';
import {
  REVERSION_BASE_DURATION,
  DREAM_BREATH_MAX_DURATION,
  DREAM_BREATH_MIN_DURATION,
  TIMELESS_MAGIC,
} from '../../constants';

class HotTrackerPrevoker extends HotTracker {
  timelessMagicActive: boolean;
  fontOfMagicActive: boolean;

  constructor(options: Options) {
    super(options);
    this.timelessMagicActive = this.owner.selectedCombatant.hasTalent(
      TALENTS_EVOKER.TIMELESS_MAGIC_TALENT,
    );
    this.fontOfMagicActive = this.owner.selectedCombatant.hasTalent(
      TALENTS_EVOKER.FONT_OF_MAGIC_TALENT,
    );
  }

  //from echo
  fromEchoHardcast(hot: Tracker): boolean {
    return hot.attributions.some(function (attr) {
      return attr.name.startsWith('Echo Hardcast');
    });
  }

  //from hardcast
  fromEchoTA(hot: Tracker): boolean {
    return hot.attributions.some(function (attr) {
      return attr.name.startsWith('Echo Temporal Anomaly');
    });
  }

  fromCallOfYsera(hot: Tracker): boolean {
    return hot.attributions.some(function (attr) {
      return attr.name.includes('Call Of Ysera');
    });
  }

  _generateHotInfo(): HotInfo[] {
    // must be generated dynamically because it reads from traits
    const reversionDuration =
      REVERSION_BASE_DURATION *
      (1 +
        TIMELESS_MAGIC *
          this.selectedCombatant.getTalentRank(TALENTS_EVOKER.TIMELESS_MAGIC_TALENT));
    const dreamBreathDuration = this.fontOfMagicActive
      ? DREAM_BREATH_MIN_DURATION
      : DREAM_BREATH_MIN_DURATION + DREAM_BREATH_MIN_DURATION;
    return [
      {
        spell: TALENTS_EVOKER.REVERSION_TALENT,
        duration: reversionDuration,
        tickPeriod: 2000,
      },
      {
        spell: SPELLS.REVERSION_ECHO,
        duration: reversionDuration,
        tickPeriod: 2000,
      },
      //dream breath duration & max duration is related to empower level and will have to be set dynamically on castevent, but should always fall within the range set here
      {
        spell: SPELLS.DREAM_BREATH,
        duration: dreamBreathDuration,
        tickPeriod: 2000,
        maxDuration: DREAM_BREATH_MAX_DURATION,
      },
      {
        spell: SPELLS.DREAM_BREATH_ECHO,
        duration: dreamBreathDuration,
        tickPeriod: 2000,
        maxDuration: DREAM_BREATH_MAX_DURATION,
      },
    ];
  }
}

export default HotTrackerPrevoker;
