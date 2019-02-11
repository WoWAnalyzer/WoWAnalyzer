import BaseSelfHealing from 'parser/shared/modules/BaseSelfHealing';

class HolyPriestSelfHealing extends BaseSelfHealing {
    static SPELL_ARRAY = [
        SPELLS.GREATER_HEAL,
        SPELLS.FLASH_HEAL,
        SPELLS.RENEW,
        SPELLS.HOLY_WORD_SERENITY,
    ];

}

export default HolyPriestSelfHealing;
