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
        spellId: SPELLS.BERSERKING.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.BLOOD_FURY_SPELL_AND_PHYSICAL.id,
        timelineHighlight: true,
      },
      {
        spellId: typedKeys(BLOODLUST_BUFFS).map((item) => Number(item)),
        timelineHighlight: true,
      },
      {
        spellId: [SPELLS.STONE_BULWARK_CAST_BUFF.id, SPELLS.STONE_BULWARK_PULSE_BUFF.id],
        triggeredBySpellId: TALENTS.STONE_BULWARK_TOTEM_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.STONE_BULWARK_TOTEM_TALENT),
      },
      {
        spellId: TALENTS.ASTRAL_SHIFT_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.ASTRAL_SHIFT_TALENT),
      },
    ];
  }
}

export default Buffs;
