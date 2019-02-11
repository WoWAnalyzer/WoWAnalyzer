import { DIRECT_SELF_HEALING_ABILITIES } from '../../constants';
import BaseSelfHealing from 'parser/shared/modules/BaseSelfHealing';

class MistweaverSelfHealing extends BaseSelfHealing {
    static SPELL_ARRAY = DIRECT_SELF_HEALING_ABILITIES;

    _onHeal(event){
        if(event.ability.guid === 116670)
        {
            console.log(event);
            console.log(event.targetID);
            console.log(event.souceID);
        }
        else{
            console.log("not vivify");
        }
        
    }
}

export default MistweaverSelfHealing;
