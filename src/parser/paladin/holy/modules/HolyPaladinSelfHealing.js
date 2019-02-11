import BaseSelfHealing from 'parser/shared/modules/BaseSelfHealing';

class HolyPaladinSelfHealing extends BaseSelfHealing {
    static SPELL_ARRAY = [
        SPELLS.HOLY_SHOCK_HEAL,
        SPELLS.HOLY_LIGHT,
        SPELLS.FLASH_OF_LIGHT,
        SPELLS.BESTOW_FAITH_TALENT,
    ];
}

export default HolyPaladinSelfHealing;
