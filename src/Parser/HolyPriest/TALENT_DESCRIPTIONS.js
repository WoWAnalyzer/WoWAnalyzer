import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default {
  descriptions: {
    [SPELLS.TRAIL_OF_LIGHT_TALENT.id]: <span>When you cast <SpellLink id={SPELLS.FLASH_HEAL.id} />, 40% of the healing is replicated to the previous target you healed with Flash Heal.</span>,
    [SPELLS.ENDURING_RENEWAL_TALENT.id]: <span>Your single-target healing spells refresh the duration of your Renew on the target.</span>,
    [SPELLS.ENLIGHTENMENT_TALENT.id]: <span>You regenerate mana 10% faster.</span>,
    [SPELLS.ANGELIC_FEATHER_TALENT.id]: <span>Places a feather at the target location, granting the first ally to walk through it 40% increased movement speed for 5 sec. Only 3 feathers can be placed at one time.  Maximum 3 charges.</span>,
    [SPELLS.BODY_AND_MIND_TALENT.id]: <span>Heals the target for (60% of Spell power) every 1 sec and increases their movement speed by 40% for 4 sec.</span>,
    [SPELLS.PERSEVERANCE_TALENT.id]: <span>When you cast Renew on yourself, it reduces all damage you take by 10%.</span>,
    [SPELLS.SHINING_FORCE_TALENT.id]: <span>Creates a burst of light around a friendly target, knocking away nearby enemies and slowing their movement speed by 70% for 3 sec.</span>,
    [SPELLS.CENSURE_TALENT.id]: <span>Holy Word: Chastise stuns the target for 5 sec and is not broken by damage.</span>,
    [SPELLS.AFTERLIFE_TALENT.id]: <span>Increases the duration of Spirit of Redemption by 50%.</span>,
    [SPELLS.LIGHT_OF_THE_NAARU_TALENT.id]: <span>Serendipity reduces the remaining cooldown on the appropriate Holy Word by an additional 2 sec.</span>,
    [SPELLS.GUARDIAN_ANGEL_TALENT.id]: <span>When <SpellLink id={SPELLS.GUARDIAN_SPIRIT.id} /> expires without saving the target from death, reduce its remaining cooldown to 90 seconds.</span>,
    [SPELLS.SYMBOL_OF_HOPE_TALENT.id]: <span>Bolster the morale of all healers in your party or raid within 40 yards, allowing them to cast spells for no mana for 12 sec.</span>,
    [SPELLS.SURGE_OF_LIGHT_TALENT.id]: <span>Your healing spells and Smite have a 8% chance to make your next Flash Heal instant and cost no mana. Maximum 2 charges.</span>,
    [SPELLS.BINDING_HEAL_TALENT.id]: <span>Heals you, another friendly target, and a third friendly target within 20 yards for (300% of Spell power). Triggers Serendipity, reducing the remaining cooldown on both Holy Word: Serenity and Holy Word: Sanctify by 3 sec.</span>,
    [SPELLS.PIETY_TALENT.id]: <span>The cooldown of <SpellLink id={SPELLS.PRAYER_OF_MENDING_CAST.id} /> is reduced by 2 sec, and it now triggers Serendipity, reducing the remaining cooldown on Holy Word: Sanctify.</span>,
    [SPELLS.DIVINITY_TALENT.id]: <span>When you heal with a Holy Word spell, your healing is increased by 15% for 6 sec.</span>,
    [SPELLS.DIVINE_STAR_TALENT.id]: <span>Throw a Divine Star forward 24 yds, healing allies in its path for (90% of Spell power) and dealing (145% of Spell power) Holy damage to enemies. After reaching its destination, the Divine Star returns to you, healing allies and damaging enemies in its path again.</span>,
    [SPELLS.HALO_TALENT.id]: <span>Creates a ring of Holy energy around you that quickly expands to a 30 yd radius, healing allies for (287.4% of Spell power) and dealing (431.1% of Spell power) Holy damage to enemies.</span>,
    [SPELLS.APOTHEOSIS_TALENT.id]: <span>Enter a pure Holy form for 30 sec, increasing the effects of Serendipity by 200% and reducing the cost of your Holy Words by 100%.</span>,
    [SPELLS.BENEDICTION_TALENT.id]: <span>Your <SpellLink id={SPELLS.PRAYER_OF_MENDING_CAST.id} /> has a 40% chance to leave a Renew on each target it heals.</span>,
    [SPELLS.CIRCLE_OF_HEALING_TALENT.id]: <span>Heals up to 5 injured allies within 30 yards of the target for (300% of Spell power).</span>,
  },
};
