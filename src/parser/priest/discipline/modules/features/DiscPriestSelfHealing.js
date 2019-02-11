import BaseSelfHealing from 'parser/shared/modules/BaseSelfHealing';
import SPELLS from 'common/SPELLS';

class DiscPriestSelfHealing extends BaseSelfHealing {
    static SPELL_ARRAY = [
        SPELLS.PENANCE,
        SPELLS.POWER_WORD_SHIELD,
        SPELLS.SHADOW_MEND,
    ];

}

export default DiscPriestSelfHealing;
