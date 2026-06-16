import { Options } from 'parser/core/Module';
import TALENTS from 'common/TALENTS/shaman';
import SPELLS from 'common/SPELLS';
import HotTracker, { HotInfo, Tracker } from 'parser/shared/modules/HotTracker';
import { SPELL_DURATIONS, EVENT_LINKS } from '../../constants';

export const IMBUEMENT_MASTERY_ATT_NAME = 'Imbuement Mastery Earthliving Extension';

export default class EarthlivingTracker extends HotTracker {
  earthlivingActive: boolean;

  healingSources = new Map<string, number>();

  constructor(options: Options) {
    super(options);
    this.earthlivingActive =
      this.owner.selectedCombatant.hasTalent(TALENTS.EARTHLIVING_WEAPON_TALENT) ||
      this.owner.selectedCombatant.hasTalent(TALENTS.PRIMAL_CATALYST_TALENT) ||
      this.owner.selectedCombatant.hasTalent(TALENTS.WHIRLING_ELEMENTS_TALENT);

    this.healingSources.set(EVENT_LINKS.chainHealHeal, TALENTS.CHAIN_HEAL_TALENT.id);
    this.healingSources.set(EVENT_LINKS.HEALING_WAVE, SPELLS.HEALING_WAVE.id);
    this.healingSources.set(
      EVENT_LINKS.HEALING_STREAM_TOTEM_HEAL,
      SPELLS.HEALING_STREAM_TOTEM_HEAL.id,
    );
    this.healingSources.set(EVENT_LINKS.HEALING_TIDE_TOTEM_HEAL, SPELLS.HEALING_TIDE_TOTEM_HEAL.id);
    this.healingSources.set(EVENT_LINKS.STORMSTREAM_TOTEM_HEAL, SPELLS.STORMSTREAM_TOTEM_HEAL.id);
    this.healingSources.set(EVENT_LINKS.riptideBuffApply, TALENTS.RIPTIDE_TALENT.id);
  }

  getSourceSpellId(hot: Tracker): number {
    return this.healingSources.get(hot.attributions[0].name) || 0;
  }

  _generateHotInfo(): HotInfo[] {
    const isTotemic = this.selectedCombatant.hasTalent(TALENTS.IMBUEMENT_MASTERY_TALENT);
    const imbuementMasteryAttribution = HotTracker.getNewAttribution(IMBUEMENT_MASTERY_ATT_NAME);
    return [
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
