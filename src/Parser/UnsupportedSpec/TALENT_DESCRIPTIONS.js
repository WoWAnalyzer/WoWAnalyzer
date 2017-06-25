import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default {
  descriptions: {
    // lv15
    [SPELLS.BESTOW_FAITH_TALENT.id]: <span><SpellLink id={SPELLS.BESTOW_FAITH_TALENT.id} /> is the default choice for most encounters in raids. The 5-second delay requires foresight, but this ability gives great healing for a very low mana cost.</span>,
    [SPELLS.LIGHTS_HAMMER_TALENT.id]: <span>Unfortunately <a href="http://www.wowhead.com/spell=114158" target="_blank" rel="noopener noreferrer">Light's Hammer</a> isn't as good of a choice as it may seem. Even if you can use it on cooldown and it doesn't overheal <a href="http://www.wowhead.com/spell=223306" target="_blank" rel="noopener noreferrer">Bestow Faith</a> will outperform it in all situations. Primarily due to its low mana cost and beacon transfer(s). For this reason it is not recommended to take Light's Hammer.</span>,
    [SPELLS.CRUSADERS_MIGHT_TALENT.id]: <span>Unfortunately <a href="http://www.wowhead.com/spell=196926" target="_blank" rel="noopener noreferrer">Crusader's Might</a> is usually only viable with a unique playstyle that does not work well with the T19 4 set bonus. For this reason it is not recommended to take Crusader's Might.</span>,
    // lv30
    [SPELLS.CAVALIER_TALENT.id]: <span>You can take <a href="http://www.wowhead.com/spell=230332" target="_blank" rel="noopener noreferrer">Cavalier</a> if most of the raid is clumped together and you won't need <a href="http://www.wowhead.com/spell=214202" target="_blank" rel="noopener noreferrer">Rule of Law</a>, or if you have a specific need for two charges of Divine Steed. It's important to understand that two charges doesn't actually mean you get twice as many uses of Divine Steed. If you use both charges at once, only one will recharge at a time meaning it will take 90 seconds for you to have both charges up again.</span>,
    [SPELLS.UNBREAKABLE_SPIRIT_TALENT.id]: <span><a href="http://www.wowhead.com/spell=114154" target="_blank" rel="noopener noreferrer">Unbreakable Spirit</a> is almost never a valid choice.</span>,
    [SPELLS.RULE_OF_LAW_TALENT.id]: <span>Rule of Law is the default choice for raiding. Because the cooldown is so short, you should try to use it with <a href="http://www.wowhead.com/spell=85222" target="_blank" rel="noopener noreferrer">Light of Dawn</a> as often as you can. Rule of Law is also extremely helpful for healing targets if they happen to be out of range and need healing e.g.: running out with a debuff.</span>,
    // lv45
    [SPELLS.FIST_OF_JUSTICE_TALENT_SHARED.id]: <span>The talent selected in this tier usually has no impact in raids.</span>,
    [SPELLS.REPENTANCE_TALENT.id]: <span>The talent selected in this tier usually has no impact in raids.</span>,
    [SPELLS.BLINDING_LIGHT_TALENT.id]: <span>The talent selected in this tier usually has no impact in raids.</span>,
    // lv60
    // ...etc
  },
  attribution: <span>Where did these description come from?</span>,
};
