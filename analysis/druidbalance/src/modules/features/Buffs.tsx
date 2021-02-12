import SPELLS from 'common/SPELLS';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import CoreBuffs from 'parser/core/modules/Buffs';

class Buffs extends CoreBuffs {
  buffs() {
    const combatant = this.selectedCombatant;

    // This should include ALL buffs that can be applied by your spec.
    // This data can be used by various kinds of modules to improve their results, and modules added in the future may rely on buffs that aren't used today.
    return [
        {
            spellId: SPELLS.CELESTIAL_ALIGNMENT.id,
            timelineHighlight: true,
        },
        {
            spellId: SPELLS.WILD_CHARGE_TALENT.id,
            timelineHighlight: false,
        },
        {
            spellId: SPELLS.BALANCE_OF_ALL_THINGS.id,
            timelineHighlight: true,
        },
        {
            spellId: SPELLS.OWLKIN_FRENZY.id,
            timelineHighlight: true,
        },
        {
            spellId: SPELLS.BARKSKIN.id,
            timelineHighlight: false,
        },
        {
            spellId: SPELLS.STARLORD.id,
            timelineHighlight: false,
        },
        {
            spellId: Object.keys(BLOODLUST_BUFFS).map(item => Number(item)),
            timelineHighlight: true,
        },
    ];
  }
}

export default Buffs;
