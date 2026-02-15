import { Options } from 'parser/core/Module';
import talents, { TALENTS_SHAMAN } from 'common/TALENTS/shaman';
import SPELLS from 'common/SPELLS';
import HotTracker, { HotInfo, Tracker } from 'parser/shared/modules/HotTracker';
import {
  EARTHLIVING_BASE_DURATION,
  IMBUEMENT_MASTERY_DURATION,
  HEALING_WAVE,
  CHAIN_HEAL,
  HEALING_STREAM_TOTEM_HEAL,
  HEALING_TIDE_TOTEM_HEAL,
  STORMSTREAM_TOTEM_HEAL,
  RIPTIDE,
} from '../../constants';

export const IMBUEMENT_MASTERY_ATT_NAME = 'Imbuement Mastery Earthliving Extension';

class EarthlivingTracker extends HotTracker {
  earthlivingActive: boolean;

  healingSources = new Map<string, number>();

  constructor(options: Options) {
    super(options);
    this.earthlivingActive =
      this.owner.selectedCombatant.hasTalent(talents.EARTHLIVING_WEAPON_TALENT) ||
      this.owner.selectedCombatant.hasTalent(talents.PRIMAL_CATALYST_TALENT) ||
      this.owner.selectedCombatant.hasTalent(talents.WHIRLING_ELEMENTS_TALENT);

    this.healingSources.set(CHAIN_HEAL, talents.CHAIN_HEAL_TALENT.id);
    this.healingSources.set(HEALING_WAVE, SPELLS.HEALING_WAVE.id);
    this.healingSources.set(HEALING_STREAM_TOTEM_HEAL, SPELLS.HEALING_STREAM_TOTEM_HEAL.id);
    this.healingSources.set(HEALING_TIDE_TOTEM_HEAL, SPELLS.HEALING_TIDE_TOTEM_HEAL.id);
    this.healingSources.set(STORMSTREAM_TOTEM_HEAL, SPELLS.STORMSTREAM_TOTEM_HEAL.id);
    this.healingSources.set(RIPTIDE, talents.RIPTIDE_TALENT.id);
  }

  getSourceSpellId(hot: Tracker): number {
    return this.healingSources.get(hot.attributions[0].name) || 0;
  }

  _generateHotInfo(): HotInfo[] {
    const isTotemic = this.selectedCombatant.hasTalent(TALENTS_SHAMAN.IMBUEMENT_MASTERY_TALENT);
    const imbuementMasteryAttribution = HotTracker.getNewAttribution(IMBUEMENT_MASTERY_ATT_NAME);
    return [
      {
        spell: SPELLS.EARTHLIVING_WEAPON_HEAL,
        duration: EARTHLIVING_BASE_DURATION,
        tickPeriod: 2000,
        baseExtensions: [
          {
            attribution: imbuementMasteryAttribution,
            amount: isTotemic ? IMBUEMENT_MASTERY_DURATION : 0,
          },
        ],
      },
    ];
  }
}

export default EarthlivingTracker;
