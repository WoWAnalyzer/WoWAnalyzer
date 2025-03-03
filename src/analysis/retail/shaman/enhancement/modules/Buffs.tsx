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
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.HOT_HAND_BUFF.id,
        enabled: combatant.hasTalent(TALENTS.HOT_HAND_TALENT),
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.HAILSTORM_BUFF.id,
        triggeredBySpellId: TALENTS.HAILSTORM_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.HAILSTORM_TALENT),
        timelineHighlight: true,
      },
      {
        spellId: TALENTS.DOOM_WINDS_TALENT.id,
        triggeredBySpellId: TALENTS.DOOM_WINDS_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.DOOM_WINDS_TALENT),
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.PRIMORDIAL_WAVE_BUFF.id,
        enabled: combatant.hasTalent(TALENTS.PRIMORDIAL_WAVE_TALENT),
        triggeredBySpellId: TALENTS.PRIMORDIAL_WAVE_TALENT.id,
      },
      {
        spellId: SPELLS.LEGACY_OF_THE_FROST_WITCH_BUFF.id,
        enabled: combatant.hasTalent(TALENTS.LEGACY_OF_THE_FROST_WITCH_TALENT),
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.SPLINTERED_ELEMENTS_BUFF.id,
        enabled: combatant.hasTalent(TALENTS.SPLINTERED_ELEMENTS_TALENT),
        triggeredBySpellId: TALENTS.PRIMORDIAL_WAVE_TALENT.id,
      },
      {
        spellId: SPELLS.FERAL_SPIRIT_MAELSTROM_BUFF.id,
        enabled: combatant.hasTalent(TALENTS.FERAL_SPIRIT_TALENT),
        triggeredBySpellId: TALENTS.FERAL_SPIRIT_TALENT.id,
      },
    ];
  }
}

export default Buffs;
