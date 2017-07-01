import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default {
  descriptions: {
    [SPELLS.TRAIL_OF_LIGHT_TALENT.id]: <span>Very good dungeon talent. In raids, this talent is generally unused due to the <SpellLink id={SPELLS.PRAYER_OF_MENDING_CAST.id} /> meta. However, if a fight requires constant spothealing of multiple targets (Spellblade Aluriel is a good example), then this is a fairly good talent. </span>,
    [SPELLS.ENDURING_RENEWAL_TALENT.id]: <span>Complete trash under most circumstances. Sometimes seen matched with <SpellLink id={SPELLS.BINDING_HEAL_TALENT.id} /> due to its smartheal interaction with this talent.</span>,
    [SPELLS.ENLIGHTENMENT_TALENT.id]: <span>The best raid talent in almost every situation.</span>,
    [SPELLS.ANGELIC_FEATHER_TALENT.id]: <span>Almost always the best mobility talent. The exception is when the fight requires constant movement (for example, Mythic Helya or Mythic Harjatan) in which case you can end up draining your feather stacks faster than they regenerate.</span>,
    [SPELLS.BODY_AND_MIND_TALENT.id]: <span>Mostly unused due to its inferiority compared to <SpellLink id={SPELLS.ANGELIC_FEATHER_TALENT.id} />. However, this talent becomes better when movement occurs very frequently (for example, Mythic Helya or Mythic Harjatan) due to the slow recharge timer on feathers.</span>,
    [SPELLS.PERSEVERANCE_TALENT.id]: <span>Very poor raid talent. However, if there is low movement needed in a fight, this talent becomes much more viable.</span>,
    [SPELLS.SHINING_FORCE_TALENT.id]: <span>Very poor talent unless displaceable adds exist that need to be moved exist. The best example being slimes from Ilgynoth.</span>,
    [SPELLS.CENSURE_TALENT.id]: <span>Awful for most raid situations, as most monsters in raid combat are not stunnable. Very good dungeon talent though.</span>,
    [SPELLS.AFTERLIFE_TALENT.id]: <span>The go to talent for 99% of situations. Allows for an additional 7.5 seconds of freecasting. Especially powerful when tied with <SpellLink id={SPELLS.XANSHI_CLOAK_BUFF.id} /></span>,
    [SPELLS.LIGHT_OF_THE_NAARU_TALENT.id]: <span>The best talent in every situation without question.</span>,
    [SPELLS.GUARDIAN_ANGEL_TALENT.id]: <span>Pretty awful talent overall. Not worth using in basically any scenario.</span>,
    [SPELLS.SYMBOL_OF_HOPE_TALENT.id]: <span>Good in concept, but horrible in practice. Only use this if you are massively undergeared and expect other healers to carry you.</span>,
    [SPELLS.SURGE_OF_LIGHT_TALENT.id]: <span>Not bad, but absolutely horrible compared to <SpellLink id={SPELLS.PIETY_TALENT.id} /> for raids. In dungeons, this is the go to for mobility.</span>,
    [SPELLS.BINDING_HEAL_TALENT.id]: <span>Extremely cost effective and decent throughput. Currently this talent is fairly good <a href="https://mechanicalpriest.com/binding-heal-does-what-it-wants/">(and bugged in a good way)</a> but pales in comparison to the potential benefit of <SpellLink id={SPELLS.PIETY_TALENT.id} /> in most situations.</span>,
    [SPELLS.PIETY_TALENT.id]: <span>The best raid talent in most situations especially if using <SpellLink id={SPELLS.BENEDICTION_TALENT.id} /></span>,
    [SPELLS.DIVINITY_TALENT.id]: <span>Undeniably the best talent in every situation currently. Being free and very strong in general puts this talent miles ahead of its competitors.</span>,
    [SPELLS.DIVINE_STAR_TALENT.id]: <span>Might as well just not run a talent on this row.</span>,
    [SPELLS.HALO_TALENT.id]: <span>Awful, but pretty okay if you are doing world quests I guess.</span>,
    [SPELLS.APOTHEOSIS_TALENT.id]: <span>Widely considered an awful raid talent. However, if you can find a long spree of heavy damage in a fight (especially single-target) like Mythic Star Augur Etraeus latter icy ejections, then this talent can be fairly good.</span>,
    [SPELLS.BENEDICTION_TALENT.id]: <span>Considered by most to be the best possible raid talent due to the sheer amount of healing done by the renews it leaves, as well being passive.</span>,
    [SPELLS.CIRCLE_OF_HEALING_TALENT.id]: <span>Change this talent immediately.</span>,
  },
};
