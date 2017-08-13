import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import ITEMS from "../../common/ITEMS";

export default {
  descriptions: {
    // level 15
    [SPELLS.HAUNT_TALENT.id]: <span><SpellLink id={SPELLS.HAUNT_TALENT.id}/> is a powerful nuke on a 25-second cooldown that increases damage done to the target by 15% for 10 seconds. The cooldown resets if the target dies in that time. Strong in situations with constant swapping of burn targets, although is usually outperformed by other talents.</span>,
    [SPELLS.WRITHE_IN_AGONY_TALENT.id]: <span><SpellLink id={SPELLS.WRITHE_IN_AGONY_TALENT.id}/> makes <SpellLink id={SPELLS.AGONY.id}/> stack up to 15 instead of 10. Even more important to keep as high uptime on the dot as possible. Exceptionally strong in multi-target situations.</span>,
    [SPELLS.MALEFIC_GRASP_TALENT.id]: <span>All your dots deal 25% increased damage while you channel <SpellLink id={SPELLS.DRAIN_SOUL.id}/>. Winner on most single target encounters without a lot of movement where you can stand still and drain.</span>,
    // level 30
    [SPELLS.CONTAGION_TALENT.id]: <span><SpellLink id={SPELLS.UNSTABLE_AFFLICTION_CAST.id}/> increases all damage you deal to the target by 15%. Always the best target for single and two target encounters.</span>,
    [SPELLS.ABSOLUTE_CORRUPTION_TALENT.id]: <span><SpellLink id={SPELLS.CORRUPTION_CAST.id}/> is now permanent and deals 25% more damage. Starts to pull ahead on 3 or more targets due to saved GCDs and also the bonus damage it provides. Synergizes really well with <SpellLink id={ITEMS.SACROLASHS_DARK_STRIKE.id}/></span>,
    [SPELLS.EMPOWERED_LIFE_TAP_TALENT.id]: <span>Your <SpellLink id={SPELLS.LIFE_TAP.id}/> increases all damage you deal by 10% for 20 seconds. Not really used in any situation for Affliction Warlocks.</span>,
    // level 45
    [SPELLS.DEMONIC_CIRCLE_TALENT.id]: <span>Lets you create a portal at your feet that lasts 15 minutes to which you can teleport from up to 40 yards. Default choice in raiding scenarios as it helps you to quickly escape dangerous situations.</span>,
    [SPELLS.MORTAL_COIL_TALENT.id]: <span>Horrifies an enemy for 3 seconds and heals you for 20% of your maximum health. Can be used in Mythic+ as it doesn't share DR with stuns (be mindful of its projectile travel time though). Will proc <SpellLink id={ITEMS.SEPHUZS_SECRET.id}/> if target's not immune to fear / horror effect.</span>,
    [SPELLS.HOWL_OF_TERROR_TALENT.id]: <span>Instantly fears 5 targets within 10 yards for up to 20 seconds. Damage might break the effect. Will proc <SpellLink id={ITEMS.SEPHUZS_SECRET.id}/> if target's not immune to fear / horror effect.</span>,
    // level 60
    [SPELLS.PHANTOM_SINGULARITY_TALENT.id]: <span>Places a dot on your target dealing AoE damage to targets within 15 yards, also healing you for 20% of the damage done. Close to equal to <SpellLink id={SPELLS.SOUL_HARVEST_TALENT.id}/> on pure single target, excellent on bursting down adds in raid encounters.</span>,
    [SPELLS.SOW_THE_SEEDS_TALENT.id]: <span>Your <SpellLink id={SPELLS.SEED_OF_CORRUPTION_DEBUFF.id}/> will plant 2 additional seeds to nearby targets (3 in total). Extremely strong for sustained AoE, particularly in Mythic+.</span>,
    [SPELLS.SOUL_HARVEST_TALENT.id]: <span>Increases your and your pet's damage by 20% for a base of 12 seconds plus 4 seconds for each <SpellLink id={SPELLS.AGONY.id}/> on enemy targets, up to 36 seconds. Requires some more planning than <SpellLink id={SPELLS.PHANTOM_SINGULARITY_TALENT.id}/> but might outperform it on some fights.</span>,
    // level 75
    [SPELLS.DEMON_SKIN_TALENT.id]: <span>Your <SpellLink id={SPELLS.SOUL_LEECH_SPELL.id}/> now passively recharges at rate of 1% of maximum health per second up to 20% of maximum health. Useful in situations with regular raidwide damage but we usually outheal ourselves with <SpellLink id={SPELLS.DRAIN_SOUL.id}/>, making <SpellLink id={SPELLS.BURNING_RUSH_TALENT.id}/> a more favorable choice.</span>,
    [SPELLS.BURNING_RUSH_TALENT.id]: <span>Increases your movement speed by 50% until cancelled while burning 4% of your maximum health per second. You also cannot be slowed below your regular running speed. Very useful as Warlocks don't have any baseline movement speed abilities, allowing you to avoid lethal mechanics.</span>,
    [SPELLS.DARK_PACT_TALENT.id]: <span>Sacrifices 20% of your demon's current health (or yours if you don't have a pet active) and gives you a shield equal to 400% of the health sacrificed for 20 seconds. Great defensive cooldown on short CD, useful for soaking mechanics, but is usually inferior to <SpellLink id={SPELLS.BURNING_RUSH_TALENT.id}/>.</span>,
    // level 90
    [SPELLS.GRIMOIRE_OF_SUPREMACY_TALENT.id]: <span>Allows you to summon your Doomguard and Infernal as permanent pets, in return you lose them as the 3 minute cooldown spells. Default choice for any content, as the Soul Shards are much more valuable when spent on <SpellLink id={SPELLS.UNSTABLE_AFFLICTION_CAST.id}/>.</span>,
    [SPELLS.GRIMOIRE_OF_SERVICE_TALENT.id]: <span>Summons a second demon for 25 seconds which deals 100% increased damage and uses its special ability when summoned (Spell Lock, Cauterize Master etc.). Not really worth the Soul Shard cost for Affliction, <SpellLink id={SPELLS.GRIMOIRE_OF_SUPREMACY_TALENT.id}/> is a much better option.</span>,
    [SPELLS.GRIMOIRE_OF_SACRIFICE_TALENT.id]: <span>Sacrifices your demon to grant you <SpellLink id={SPELLS.GRIMOIRE_OF_SACRIFICE_BUFF.id}/>, making your spells sometimes do around 22,000 damage to the target and all enemies within 8 yards. Not enough damage to make the talent justified, <SpellLink id={SPELLS.GRIMOIRE_OF_SUPREMACY_TALENT.id}/> is a much better option. </span>,
    // level 100
    [SPELLS.DEATHS_EMBRACE_TALENT.id]: <span>Ramping damage buff that starts at 0% at 35% HP on the target and scales up to 50% when the target dies. Extremely strong on progression and bosses that have some kind of soft enrage or burn phases (such as Star Augur Etraeus). If <SpellLink id={ITEMS.SOUL_OF_THE_NETHERLORD.id}/> is equipped, it will <b>not affect <SpellLink id={SPELLS.SIPHON_LIFE.id}/></b>.</span>,
    [SPELLS.SIPHON_LIFE.id]: <span>Additional dot that deals moderate damage and heals you for 60% of the damage done. Roughly equal to <SpellLink id={SPELLS.SOUL_CONDUIT_TALENT.id}/> on simulations, although it is more reliable as Soul Conduit is based on RNG.</span>,
    [SPELLS.SOUL_CONDUIT_TALENT.id]: <span>Each Soul Shard spent has a 20% chance to be refunded. A moderately good choice if you don't want to maintain another dot, its randomness allows for great bursting windows when lucky but also more downtime when the RNG gods aren't inclined. Roughly equal to <SpellLink id={SPELLS.SIPHON_LIFE_TALENT.id}/>.</span>,
  },
  attribution: <span>Parts of the descriptions for talents came from the <a href="http://www.wowhead.com/affliction-warlock-talent-guide" target="_blank" rel="noopener noreferrer">Affliction Warlock Wowhead guide</a> by Terryn.</span>,
};
