import { Options } from 'parser/core/Module';
import talents, { TALENTS_SHAMAN } from 'common/TALENTS/shaman';
import SPELLS from 'common/SPELLS';
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

export const IMBUEMENT_MASTERY_ATT_NAME = 'Imbuement Mastery Earthliving Extension';
export const WAVESPEAKERS_BLESSING_ATT_NAME = 'Wavespeakers Blessing Riptide Extension';

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
    const isTotemic = this.selectedCombatant.hasTalent(TALENTS_SHAMAN.IMBUEMENT_MASTERY_TALENT);
    const wavespeakersBlessingRank = this.selectedCombatant.getTalentRank(
      TALENTS_SHAMAN.WAVESPEAKERS_BLESSING_TALENT,
    );

    const imbuementMasteryAttribution = HotTracker.getNewAttribution(IMBUEMENT_MASTERY_ATT_NAME);
    const wavespeakersBlessingAttribution = HotTracker.getNewAttribution(
      WAVESPEAKERS_BLESSING_ATT_NAME,
    );
    return [
      {
        spell: talents.RIPTIDE_TALENT,
        duration: this._getRiptideDuration,
        tickPeriod: 2000,
        baseExtensions: [
          {
            attribution: wavespeakersBlessingAttribution,
            amount: wavespeakersBlessingRank * WAVESPEAKERS_BLESSING,
          },
        ],
        maxDuration: this._getRiptideDuration,
      },
      {
        spell: SPELLS.EARTHLIVING_WEAPON_HEAL,
        duration: 6000,
        tickPeriod: 2000,
        baseExtensions: [
          { attribution: imbuementMasteryAttribution, amount: isTotemic ? 3000 : 0 },
        ],
      },
    ];
  }
}

export default RiptideTracker;
