import { DIRECT_SELF_HEALING_ABILITIES } from '../../constants';
import BaseSelfHealing from 'parser/shared/modules/BaseSelfHealing';

class HolyPriestSelfHealing extends BaseSelfHealing {
    static SPELL_ARRAY = DIRECT_SELF_HEALING_ABILITIES;

}

export default HolyPriestSelfHealing;
