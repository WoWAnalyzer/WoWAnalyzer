import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import typedKeys from 'common/typedKeys';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import { SpellbookAura } from 'parser/core/modules/Aura';
import CoreAuras from 'parser/core/modules/Auras';

class Buffs extends CoreAuras {
  auras(): SpellbookAura[] {
    const combatant = this.selectedCombatant;

    return [
      {
        spellId: TALENTS.ASCENDANCE_ENHANCEMENT_TALENT.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.STORMBRINGER_BUFF.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.BERSERKING.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.BLOOD_FURY_SPELL_AND_PHYSICAL.id,
        timelineHighlight: true,
      },
      {
        spellId: typedKeys(BLOODLUST_BUFFS).map((item) => item),
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
        spellId: SPELLS.WINDFURY_TOTEM_BUFF.id,
        triggeredBySpellId: TALENTS.WINDFURY_TOTEM_TALENT.id,
      },
      {
        spellId: TALENTS.DOOM_WINDS_TALENT.id,
        triggeredBySpellId: TALENTS.DOOM_WINDS_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.DOOM_WINDS_TALENT),
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.PRIMORDIAL_WAVE_BUFF.id,
        enabled: combatant.hasTalent(TALENTS.PRIMORDIAL_WAVE_SPEC_TALENT),
        triggeredBySpellId: TALENTS.PRIMORDIAL_WAVE_SPEC_TALENT.id,
      },
      {
        spellId: SPELLS.LEGACY_OF_THE_FROST_WITCH_BUFF.id,
        enabled: combatant.hasTalent(TALENTS.LEGACY_OF_THE_FROST_WITCH_TALENT),
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.SPLINTERED_ELEMENTS_BUFF.id,
        enabled: combatant.hasTalent(TALENTS.SPLINTERED_ELEMENTS_TALENT),
        triggeredBySpellId: TALENTS.PRIMORDIAL_WAVE_SPEC_TALENT.id,
      },
    ];
  }
}

export default Buffs;
