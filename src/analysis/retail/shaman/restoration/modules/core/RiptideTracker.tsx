import { Options } from 'parser/core/Module';
import talents, { TALENTS_SHAMAN } from 'common/TALENTS/shaman';
import HotTracker, { HotInfo, Tracker } from 'parser/shared/modules/HotTracker';
import {
  PRIMAL_TIDE_CORE,
  HARDCAST,
  RIPTIDE_PWAVE,
  RIPTIDE_BASE_DURATION,
  WAVESPEAKERS_BLESSING,
  UNLEASH_LIFE,
} from '../../constants';
import Combatant from 'parser/core/Combatant';

class RiptideTracker extends HotTracker {
  riptideActive: boolean;

  constructor(options: Options) {
    super(options);
    this.riptideActive = this.owner.selectedCombatant.hasTalent(talents.RIPTIDE_TALENT);
  }

  fromUnleashLife(hot: Tracker): boolean {
    return hot.attributions.some(function (attr) {
      return attr.name === UNLEASH_LIFE;
    });
  }

  fromHardcast(hot: Tracker): boolean {
    return hot.attributions.some(function (attr) {
      return attr.name.includes(HARDCAST);
    });
  }

  fromPrimalTideCore(hot: Tracker): boolean {
    return hot.attributions.some(function (attr) {
      return attr.name === PRIMAL_TIDE_CORE;
    });
  }

  fromPrimordialWave(hot: Tracker): boolean {
    return hot.attributions.some(function (attr) {
      return attr.name === RIPTIDE_PWAVE;
    });
  }

  _getRiptideDuration(combatant: Combatant): number {
    return (
      RIPTIDE_BASE_DURATION +
      combatant.getTalentRank(TALENTS_SHAMAN.WAVESPEAKERS_BLESSING_TALENT) * WAVESPEAKERS_BLESSING
    );
  }

  _generateHotInfo(): HotInfo[] {
    return [
      {
        spell: talents.RIPTIDE_TALENT,
        duration: this._getRiptideDuration,
        tickPeriod: 2000,
        maxDuration: this._getRiptideDuration,
      },
    ];
  }
}

export default RiptideTracker;
