import SPELLS from 'common/SPELLS';
import { TALENTS_SHAMAN } from 'common/TALENTS';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import CoreAuras from 'parser/core/modules/Auras';

class Buffs extends CoreAuras {
  auras() {
    const combatant = this.selectedCombatant;

    return [
      {
        spellId: TALENTS_SHAMAN.ASCENDANCE_ENHANCEMENT_TALENT.id,
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
        spellId: Object.keys(BLOODLUST_BUFFS).map((item) => Number(item)),
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.HOT_HAND_BUFF.id,
        enabled: combatant.hasTalent(TALENTS_SHAMAN.HOT_HAND_TALENT),
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.HAILSTORM_BUFF.id,
        enabled: combatant.hasTalent(TALENTS_SHAMAN.HAILSTORM_TALENT),
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.WINDFURY_TOTEM_BUFF.id,
        triggeredBySpellId: TALENTS_SHAMAN.WINDFURY_TOTEM_TALENT.id,
        timelineHighlight: true,
      },
    ];
  }
}

export default Buffs;
