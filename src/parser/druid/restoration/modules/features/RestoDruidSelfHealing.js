import BaseSelfHealing from 'parser/shared/modules/BaseSelfHealing';

class RestoDruidSelfHealing extends BaseSelfHealing {
    static SPELL_ARRAY = [
        SPELLS.REJUVENATION,
        SPELLS.CENARION_WARD_HEAL,
        SPELLS.REGROWTH,
        SPELLS.LIFEBLOOM_HOT_HEAL,
        SPELLS.LIFEBLOOM_BLOOM_HEAL,
        SPELLS.SWIFTMEND,
        SPELLS.RENEWAL_TALENT,
    ];

}

export default RestoDruidSelfHealing;
