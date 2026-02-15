import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import { SpellbookAura } from 'parser/core/modules/Aura';
import ClassBuffs from '../../shared/Buffs';

class Buffs extends ClassBuffs {
  auras(): SpellbookAura[] {
    const combatant = this.selectedCombatant;

    return [
      ...super.auras(),
      {
        spellId: TALENTS.ASCENDANCE_ENHANCEMENT_TALENT.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.STORMSURGE_BUFF.id,
      },
      {
        spellId: SPELLS.HOT_HAND_BUFF.id,
        enabled: combatant.hasTalent(TALENTS.HOT_HAND_TALENT),
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.DOOM_WINDS_BUFF.id,
        triggeredBySpellId: TALENTS.DOOM_WINDS_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.DOOM_WINDS_TALENT),
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.PRIMORDIAL_STORM_USABLE.id,
        enabled: combatant.hasTalent(TALENTS.PRIMORDIAL_STORM_TALENT),
        triggeredBySpellId: TALENTS.SUNDERING_TALENT.id,
      },
      {
        spellId: SPELLS.LIGHTNING_STRIKES_BUFF.id,
        enabled: combatant.hasTalent(TALENTS.LIGHTNING_STRIKES_TALENT),
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.SURGING_ELEMENTS_BUFF.id,
        enabled: combatant.hasTalent(TALENTS.SURGING_ELEMENTS_TALENT),
        triggeredBySpellId: TALENTS.SUNDERING_TALENT.id,
      },
      {
        spellId: [SPELLS.WHIRLING_AIR.id, SPELLS.WHIRLING_EARTH.id, SPELLS.WHIRLING_FIRE.id],
        enabled: combatant.hasTalent(TALENTS.WHIRLING_ELEMENTS_TALENT),
        triggeredBySpellId: SPELLS.SURGING_TOTEM.id,
        timelineHighlight: true,
      },
      {
        spellId: TALENTS.VOLTAIC_BLAZE_TALENT.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.STORM_UNLEASHED_BUFF.id,
        enabled: combatant.hasTalent(TALENTS.STORM_UNLEASHED_1_ENHANCEMENT_TALENT),
        timelineHighlight: true,
      },
    ];
  }
}

export default Buffs;
