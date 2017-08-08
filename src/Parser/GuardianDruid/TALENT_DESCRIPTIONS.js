import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SpellLink from 'common/SpellLink';
import ItemLink from 'common/ItemLink';

export default {
  descriptions: {
    [SPELLS.BRAMBLES_TALENT.id]: <span><SpellLink id={SPELLS.BRAMBLES_TALENT.id} /> is the default offensive choice on this row, but is quite weak defensively.</span>,
    [SPELLS.BRISTLING_FUR_TALENT.id]: <span><SpellLink id={SPELLS.BRAMBLES_TALENT.id} /> is the strongest rage generation talent in most circumstances.</span>,
    [SPELLS.BLOOD_FRENZY_TALENT.id]: <span><SpellLink id={SPELLS.BLOOD_FRENZY_TALENT.id} /> is generally weaker than <SpellLink id={SPELLS.BRAMBLES_TALENT.id} /> for rage generation, except in situations with sustained cleave on 2 or more targets.</span>,

    [SPELLS.GUTTURAL_ROARS_TALENT.id]: <span><SpellLink id={SPELLS.GUTTURAL_ROARS_TALENT.id} /> is the default choice for raiding, mostly for the reduced cooldown on Stampeding Roar.</span>,
    [SPELLS.INTIMIDATING_ROAR_TALENT.id]: <span><SpellLink id={SPELLS.INTIMIDATING_ROAR_TALENT.id} /> is generally not a good choice, it doesn't provide especially strong utility and is weaker than the other two choices.</span>,
    [SPELLS.WILD_CHARGE_TALENT.id]: <span><SpellLink id={SPELLS.WILD_CHARGE_TALENT.id} /> is okay if you can use it to proc <ItemLink id={ITEMS.SEPHUZS_SECRET.id} />, but otherwise is not recommended over <SpellLink id={SPELLS.GUTTURAL_ROARS_TALENT.id} />.</span>,

    [SPELLS.BALANCE_AFFINITY_TALENT_SHARED.id]: <span><SpellLink id={SPELLS.BALANCE_AFFINITY_TALENT_SHARED.id} /> is the recommended default choice.  The additional range gives a lot of flexibility in positioning, and lets you hit additional targets that you wouldn't otherwise be able to reach.</span>,
    [SPELLS.FERAL_AFFINITY_TALENT_GUARDIAN.id]: <span><SpellLink id={SPELLS.FERAL_AFFINITY_TALENT_GUARDIAN.id} /> allows you to catweave, which used to be a decent boost to DPS but is no longer the case and is therefore no longer recommended.</span>,
    [SPELLS.RESTORATION_AFFINITY_TALENT.id]: <span><SpellLink id={SPELLS.RESTORATION_AFFINITY_TALENT.id} /> is a decent defensive choice when paired with <ItemLink id={ITEMS.EKOWRAITH_CREATOR_OF_WORLDS.id} />, but is otherwise quite weak and not recommended.</span>,

    [SPELLS.MIGHTY_BASH_TALENT.id]: <span>This talent row usually has no impact on performance. <SpellLink id={SPELLS.MIGHTY_BASH.id} /> can be useful on encounters with bigger adds that you can stun or use to proc <ItemLink id={ITEMS.SEPHUZS_SECRET.id} />.</span>,
    [SPELLS.MASS_ENTANGLEMENT_TALENT.id]: <span>This talent row usually has no impact on performance. <SpellLink id={SPELLS.MASS_ENTANGLEMENT_TALENT.id} /> can be useful as a spell to proc <ItemLink id={ITEMS.SEPHUZS_SECRET.id} />.</span>,
    [SPELLS.TYPHOON_TALENT.id]: <span>This talent row usually has no impact on performance. <SpellLink id={SPELLS.TYPHOON_TALENT.id} /> can be useful to push adds around (Harjatan, Il'gynoth).</span>,

    [SPELLS.SOUL_OF_THE_FOREST_TALENT_GUARDIAN.id]: <span><SpellLink id={SPELLS.SOUL_OF_THE_FOREST_TALENT_GUARDIAN.id} /> is theoretically slightly stronger for rage generation than <SpellLink id={SPELLS.GALACTIC_GUARDIAN_TALENT.id} />, but is far worse for damage output, especially on multiple targets, and is generally not recommended.</span>,
    [SPELLS.INCARNATION_GUARDIAN_OF_URSOC_TALENT.id]: <span><SpellLink id={SPELLS.INCARNATION_GUARDIAN_OF_URSOC_TALENT.id} /> is the strongest DPS talent choice for most situations, and has extremely strong burst AoE potential.</span>,
    [SPELLS.GALACTIC_GUARDIAN_TALENT.id]: <span><SpellLink id={SPELLS.GALACTIC_GUARDIAN_TALENT.id} /> is a good mix of defensive power and offensive power, and should be the default choice on this row.</span>,

    [SPELLS.EARTHWARDEN_TALENT.id]: <span><SpellLink id={SPELLS.EARTHWARDEN_TALENT.id} /> is only good in extremely niche situations.  If you can hit multiple targets with Thrash to generate EW stacks, and you can guarantee that only one enemy will attack you to consume those stacks (think Fallen Avatar), AND melee damage is relevant enough to warrant it, then this is a good choice.</span>,
    [SPELLS.GUARDIAN_OF_ELUNE_TALENT.id]: <span><SpellLink id={SPELLS.GUARDIAN_OF_ELUNE_TALENT.id} /> is the strongest overall talent on this row by far, and should be the default choice in all situations.</span>,
    [SPELLS.SURVIVAL_OF_THE_FITTEST_TALENT.id]: <span><SpellLink id={SPELLS.SURVIVAL_OF_THE_FITTEST_TALENT.id} /> should be used IF AND ONLY IF you need the reduced CD on <SpellLink id={SPELLS.SURVIVAL_INSTINCTS.id} /> to survive boss mechanics. It is otherwise much worse than the alternatives.</span>,

    [SPELLS.REND_AND_TEAR_TALENT.id]: <span><SpellLink id={SPELLS.REND_AND_TEAR_TALENT.id} /> is a decent offensive choice, but is worse than <SpellLink id={SPELLS.PULVERIZE_TALENT.id} /> defensively, but is an acceptable alternative if you want to keep the rotation simple.</span>,
    [SPELLS.LUNAR_BEAM_TALENT.id]: <span><SpellLink id={SPELLS.LUNAR_BEAM_TALENT.id} /> is good for burst AoE, especially when paired with <ItemLink id={ITEMS.FURY_OF_NATURE.id} />.</span>,
    [SPELLS.PULVERIZE_TALENT.id]: <span><SpellLink id={SPELLS.PULVERIZE_TALENT.id} /> is a small DPS increase on 1-2 targets over <SpellLink id={SPELLS.REND_AND_TEAR_TALENT.id} />, at the expense of complicating the rotation. It is a relative survivability gain over the <SpellLink id={SPELLS.REND_AND_TEAR_TALENT.id} /> + <ItemLink id={ITEMS.ELIZES_EVERLASTING_ENCASEMENT.id} /> combo, as it frees up a legendary slot for a stronger defensive legendary.</span>,
  },
};
