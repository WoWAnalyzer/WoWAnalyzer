import { Options } from 'parser/core/Module';
import TALENTS from 'common/TALENTS/shaman';
import SPELLS from 'common/SPELLS/shaman';
import HotTracker, { HotInfo, Tracker } from 'parser/shared/modules/HotTracker';
import { EVENT_LINKS, SPELL_DURATIONS } from '../../constants';
import Combatant from 'parser/core/Combatant';

export const IMBUEMENT_MASTERY_ATT_NAME = 'Imbuement Mastery Earthliving Extension';
export const WAVESPEAKERS_BLESSING_ATT_NAME = 'Wavespeakers Blessing Riptide Extension';

class RiptideTracker extends HotTracker {
  riptideActive: boolean;

  constructor(options: Options) {
    super(options);
    this.riptideActive = this.owner.selectedCombatant.hasTalent(TALENTS.RIPTIDE_TALENT);
  }

  fromUnleashLife(hot: Tracker): boolean {
    return hot.attributions.some(function (attr) {
      return attr.name.includes(EVENT_LINKS.unleashLifeBuffedRiptideHeal);
    });
  }

  fromHardcast(hot: Tracker): boolean {
    return hot.attributions.some(function (attr) {
      return attr.name.includes(EVENT_LINKS.riptideBuffApply);
    });
  }

  fromPrimalTideCore(hot: Tracker): boolean {
    return hot.attributions.some(function (attr) {
      return attr.name.includes(EVENT_LINKS.primalTideCoreRiptideProc);
    });
  }

  _getRiptideDuration(combatant: Combatant): number {
    return (
      SPELL_DURATIONS.RIPTIDE_BASE_DURATION +
      combatant.getTalentRank(TALENTS.WAVESPEAKERS_BLESSING_TALENT) *
        SPELL_DURATIONS.WAVESPEAKERS_BLESSING
    );
  }

  _generateHotInfo(): HotInfo[] {
    const isTotemic = this.selectedCombatant.hasTalent(TALENTS.IMBUEMENT_MASTERY_TALENT);
    const wavespeakersBlessingRank = this.selectedCombatant.getTalentRank(
      TALENTS.WAVESPEAKERS_BLESSING_TALENT,
    );

    const imbuementMasteryAttribution = HotTracker.getNewAttribution(IMBUEMENT_MASTERY_ATT_NAME);
    const wavespeakersBlessingAttribution = HotTracker.getNewAttribution(
      WAVESPEAKERS_BLESSING_ATT_NAME,
    );
    return [
      {
        spell: TALENTS.RIPTIDE_TALENT,
        duration: this._getRiptideDuration,
        tickPeriod: 2000,
        baseExtensions: [
          {
            attribution: wavespeakersBlessingAttribution,
            amount: wavespeakersBlessingRank * SPELL_DURATIONS.WAVESPEAKERS_BLESSING,
          },
        ],
        maxDuration: this._getRiptideDuration,
      },
      {
        spell: SPELLS.EARTHLIVING_WEAPON_HEAL,
        duration: SPELL_DURATIONS.EARTHLIVING_BASE_DURATION,
        tickPeriod: 2000,
        baseExtensions: [
          {
            attribution: imbuementMasteryAttribution,
            amount: isTotemic ? SPELL_DURATIONS.IMBUEMENT_MASTERY_DURATION : 0,
          },
        ],
      },
    ];
  }
}

export default RiptideTracker;
