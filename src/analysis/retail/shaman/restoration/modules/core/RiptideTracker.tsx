import { Options } from 'parser/core/Module';
import talents from 'common/TALENTS/shaman';
import HotTracker, { HotInfo, Tracker } from 'parser/shared/modules/HotTracker';
import { PRIMAL_TIDE_CORE, HARDCAST, RIPTIDE_PWAVE } from '../../constants';

const RIPTIDE_BASE_DURATION = 18000;
const WAVESPEAKERS_BLESSING = 3000;

class RiptideTracker extends HotTracker {
  riptideActive: boolean;
  primalTideCoreActive: boolean;
  primordialWaveActive: boolean;
  wavespeakersBlessingActive: boolean;

  constructor(options: Options) {
    super(options);
    this.riptideActive = this.owner.selectedCombatant.hasTalent(talents.RIPTIDE_TALENT);
    this.primalTideCoreActive = this.owner.selectedCombatant.hasTalent(
      talents.PRIMAL_TIDE_CORE_TALENT,
    );
    this.primordialWaveActive = this.owner.selectedCombatant.hasTalent(
      talents.PRIMORDIAL_WAVE_TALENT,
    );
    this.wavespeakersBlessingActive = this.owner.selectedCombatant.hasTalent(
      talents.WAVESPEAKERS_BLESSING_TALENT,
    );
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
  _generateHotInfo(): HotInfo[] {
    const riptideDuration =
      RIPTIDE_BASE_DURATION + (this.wavespeakersBlessingActive ? WAVESPEAKERS_BLESSING : 0);
    return [
      {
        spell: talents.RIPTIDE_TALENT,
        duration: riptideDuration,
        tickPeriod: 2000,
        maxDuration: riptideDuration,
      },
    ];
  }
}

export default RiptideTracker;
