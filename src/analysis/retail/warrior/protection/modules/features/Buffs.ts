import SPELLS from 'common/SPELLS';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import CoreAuras from 'parser/core/modules/Auras';
import TALENTS from 'common/TALENTS/warrior';

class Buffs extends CoreAuras {
  //TODO: Get shrike to fill this out since I'm lazy
  auras() {
    //const combatant = this.selectedCombatant;

    // This should include ALL buffs that can be applied by your spec.
    // This data can be used by various kinds of modules to improve their results, and modules added in the future may rely on buffs that aren't used today.
    return [
      {
        spellId: Object.keys(BLOODLUST_BUFFS).map((item) => Number(item)),
        timelineHighlight: true,
      },
      {
        spellId: TALENTS.AVATAR_TALENT.id,
        timelineHighlight: true,
      },
      {
        spellId: TALENTS.LAST_STAND_TALENT.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.SHIELD_BLOCK_BUFF.id,
        timelineHighlight: true,
      },
      {
        spellId: TALENTS.SHIELD_WALL_TALENT.id,
        timelineHighlight: true,
      },
      {
        spellId: TALENTS.SPELL_REFLECTION_TALENT.id,
        timelineHighlight: true,
      },
    ];
  }
}

export default Buffs;
