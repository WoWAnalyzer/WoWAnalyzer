import React from 'react';

import ITEMS from 'common/ITEMS';
import ItemLink from 'common/ItemLink';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default {
  descriptions: {
    // lv15
    [SPELLS.MASTER_OF_SUBTLETY_TALENT.id]: <span>Default talent for burst-damage build. Increasing burst damage after leaving stealth or using vanish for raids and questing/soloing. Works perfectly with <ItemLink id={ITEMS.MANTLE_OF_THE_MASTER_ASSASSIN.id} />. </span>,
    [SPELLS.WEAPONMASTER_TALENT.id]: <span>Default talent for smooth-damage build. Good unless you have chosen <SpellLink id={SPELLS.DEATH_FROM_ABOVE_TALENT.id} />. A bug will cause <SpellLink id={SPELLS.WEAPONMASTER_TALENT.id} /> invalidating the damage of enhanced <SpellLink id={SPELLS.EVISCERATE.id} /> from <SpellLink id={SPELLS.DEATH_FROM_ABOVE_TALENT.id} />. </span>,
    [SPELLS.GLOOMBLADE_TALENT.id]: <span>Should only be chosen if you need to fight in front of your enemy for a long time, e.g. in Subtlety Rogue Artifact Challenge. </span>,
    // lv30
    [SPELLS.NIGHTSTALKER_TALENT.id]: <span>Default talent for burst-damage build. Increasing burst damage in stealth or <SpellLink id={SPELLS.SHADOW_DANCE.id} />. </span>,
    [SPELLS.SUBTERFUGE_TALENT.id]: <span>Should not be chosen in most scenarios. </span>,
    [SPELLS.SHADOW_FOCUS_TALENT.id]: <span>Only choose this talent for smooth-damage build. </span>,
    // lv45
    [SPELLS.DEEPER_STRATAGEM_TALENT.id]: <span>Default talent. Increasing damage of <SpellLink id={SPELLS.EVISCERATE.id} /> and <SpellLink id={SPELLS.NIGHTBLADE.id} />. Damage from finishing moves would be a large portion in a subtlety rogue&#39;s total damage. </span>,
    [SPELLS.ANTICIPATION_TALENT.id]: <span>Less powerful than <SpellLink id={SPELLS.DEEPER_STRATAGEM_TALENT.id} />. </span>,
    [SPELLS.VIGOR_TALENT.id]: <span>Less powerful than <SpellLink id={SPELLS.DEEPER_STRATAGEM_TALENT.id} />. </span>,
    // lv60
    [SPELLS.SOOTHING_DARKNESS_TALENT.id]: <span>Good talent for questing or soloing. </span>,
    [SPELLS.ELUSIVENESS_TALENT.id]: <span><SpellLink id={SPELLS.ELUSIVENESS_TALENT.id} /> is not very useful since it only reduce non-AoE damage. Only works well in limited scenarios like soloing a elite enemy with <ItemLink id={ITEMS.WILL_OF_VALEERA.id} />. </span>,
    [SPELLS.CHEAT_DEATH_TALENT.id]: <span>Default talent for raids. Avoid death from a one-hit fatal damage, which is common in raids. </span>,
    // lv75
    [SPELLS.STRIKE_FROM_THE_SHADOWS_TALENT.id]: <span>Slightly reduce the damage from a PvE target and slow down a PvP target. Only works well in limited scenarios like soloing elites. </span>,
    [SPELLS.PREY_ON_THE_WEAK_TALENT.id]: <span>Usually a good talent for soloing and PvP. Increase initiate damage by casting <SpellLink id={SPELLS.SAP.id} /> first. Increasing fire-focusing effectiveness for you and your teammates from your stuns: <SpellLink id={SPELLS.CHEAP_SHOT.id} /> and <SpellLink id={SPELLS.KIDNEY_SHOT.id} /> in PvP. </span>,
    [SPELLS.TANGLED_SHADOW_TALENT.id]: <span>Only choose this talent when you need to slow down your enemy, e.g. in Subtlety Rogue Artifact Challenge. </span>,
    // lv90
    [SPELLS.DARK_SHADOW_TALENT.id]: <span>Core talent for burst-damage build. Increasing burst damage in <SpellLink id={SPELLS.SHADOW_DANCE.id} />. </span>,
    [SPELLS.ALACRITY_TALENT.id]: <span>Almost not a valid choice. </span>,
    [SPELLS.ENVELOPING_SHADOWS_TALENT.id]: <span>Slightly increase the coverage time of <SpellLink id={SPELLS.SHADOW_DANCE.id} />. Almost not a valid choice. </span>,
    // lv100
    [SPELLS.MASTER_OF_SHADOWS_TALENT.id]: <span>Almost not a valid choice. </span>,
    [SPELLS.MARKED_FOR_DEATH_TALENT.id]: <span>Default talent for smooth-damage build. Powerful for questing/soloing.</span>,
    [SPELLS.DEATH_FROM_ABOVE_TALENT.id]: <span>Default talent in most scenarios including raids and mythic keystone dungeons. Provides high burst damage skill of casting a 50% damage-increased <SpellLink id={SPELLS.EVISCERATE.id} /> after a high-damage AoE. Works perfectly with subtlety rogue&#39;s damage increasing during <SpellLink id={SPELLS.SHADOW_DANCE.id} />. </span>,
  },
  // attribution: <span>Parts of the descriptions for talents came from the <a href="http://www.wowhead.com/subtlety-rogue-talent-guide" target="_blank" rel="noopener noreferrer">Subtlety Rogue Wowhead guide</a> by Gray_Hound.</span>,
};
