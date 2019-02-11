import BaseSelfHealing from 'parser/shared/modules/BaseSelfHealing';

class MistweaverSelfHealing extends BaseSelfHealing {
    static SPELL_ARRAY = [
        SPELLS.VIVIFY,
        SPELLS.SOOTHING_MIST,
        SPELLS.ENVELOPING_MIST,
        SPELLS.LIFE_COCOON,
        SPELLS.SOOTHING_MIST_STATUE,
    ];

    _onHeal(event) {
        if (event.ability.guid === 116670) {
            console.log(event);
            console.log(event.targetID);
            console.log(event.souceID);
        }
        else {
            console.log("not vivify");
        }

    }
}

export default MistweaverSelfHealing;
