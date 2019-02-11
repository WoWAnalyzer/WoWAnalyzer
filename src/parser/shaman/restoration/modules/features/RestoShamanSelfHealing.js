import BaseSelfHealing from 'parser/shared/modules/BaseSelfHealing';
import SPELLS from 'common/SPELLS';

class RestoShamanSelfHealing extends BaseSelfHealing {
    static SPELL_ARRAY = [
        SPELLS.HEALING_WAVE,
        SPELLS.HEALING_SURGE_RESTORATION,
        SPELLS.RIPTIDE,
    ];

}

export default RestoShamanSelfHealing;
