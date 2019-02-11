import { DIRECT_SELF_HEALING_ABILITIES } from '../../constants';
import BaseSelfHealing from 'parser/shared/modules/BaseSelfHealing';

class RestoShamanSelfHealing extends BaseSelfHealing {
    static SPELL_ARRAY = [
        SPELLS.HEALING_WAVE,
        SPELLS.HEALING_SURGE_RESTORATION,
        SPELLS.RIPTIDE,
    ];

}

export default RestoShamanSelfHealing;
