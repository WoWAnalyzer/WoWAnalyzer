import SPELLS from 'common/SPELLS';
import CoreBuffs from 'parser/core/modules/Buffs';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';

class Buffs extends CoreBuffs {
  buffs() {
    const combatant = this.selectedCombatant;

    // This should include ALL buffs that can be applied by your spec.
    // This data can be used by various kinds of modules to improve their results, and modules added in the future may rely on buffs that aren't used today.
    return [
      {
        spellId: SPELLS.HEATING_UP.id,
        timelineHightlight: true,
      },
      {
        spellId: SPELLS.HOT_STREAK.id,
        timelineHightlight: true,
      },
      {
        spellId: SPELLS.COMBUSTION.id,
        triggeredBySpellId: SPELLS.COMBUSTION.id,
        timelineHightlight: true,
      },
      {
        spellId: SPELLS.RUNE_OF_POWER_BUFF.id,
        enabled: combatant.hasTalent(SPELLS.RUNE_OF_POWER_TALENT),
        timelineHightlight: true,
      },
      {
        spellId: SPELLS.BLAZING_BARRIER.id,
        triggeredBySpellId: SPELLS.BLAZING_BARRIER.id,
        timelineHightlight: true,
      },
      {
        spellId: SPELLS.ICE_BLOCK.id,
        triggeredBySpellId: SPELLS.ICE_BLOCK.id,
        timelineHightlight: true,
      },
      {
        spellId: Object.keys(BLOODLUST_BUFFS).map(item => Number(item)),
        timelineHightlight: true,
      },
    ];
  }
}

export default Buffs;
