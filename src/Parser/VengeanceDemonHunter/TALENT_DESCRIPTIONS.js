import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default {
  descriptions: {
    // lvl 99
    [SPELLS.ABYSSAL_STRIKE_TALENT.id]: <span>Default talent for mobility build, giving you two extra <SpellLink id={SPELLS.INFERNAL_STRIKE.id} /> per minute. Increasing mobility by reducing the cooldown and increasing the range of Infernal Strike. Works perfectly with <SpellLink id={SPELLS.FLAME_CRASH_TALENT.id} />. </span>,
    [SPELLS.AGONIZING_FLAMES_TALENT.id]: <span>Should only be chosen if you need to spam <SpellLink id={SPELLS.IMMOLATION_AURA.id} /> for <SpellLink id={SPELLS.FALLOUT_TALENT.id} /> talent procs. It is a very weak choice when compared against <SpellLink id={SPELLS.ABYSSAL_STRIKE_TALENT.id} /> and <SpellLink id={SPELLS.FLAME_CRASH_TALENT.id} /> talents combo. </span>,
    [SPELLS.RAZOR_SPIKES_TALENT.id]: <span>Default talent for damage build. However, this talent is not recommended for new players, as you need a very good pain and buff uptime management while you manage your defensive cooldowns. </span>,
    // lvl 100
    [SPELLS.FEAST_OF_SOULS_TALENT.id]: <span>Very weak choice against all others in this talent level. It provides just a small amount of healing, which will not save you from a death (and possibilly a wipe). </span>,
    [SPELLS.FALLOUT_TALENT.id]: <span>Default choice in this tier. It provides a very strong AoE healing burst against multiple targets and works very well with <SpellLink id={SPELLS.SPIRIT_BOMB_TALENT.id} /> talent. </span>,
    [SPELLS.BURNING_ALIVE_TALENT.id]: <span>Only choose this talent for fights that does a heavy AoE burst damage to you. </span>,
    // lvl 102
    [SPELLS.FELBLADE_TALENT.id]: <span>Default talent for survivability due to the Pain generation. Also good as a charge skill, when you need extra mobility. </span>,
    [SPELLS.FLAME_CRASH_TALENT.id]: <span>Very good combo when chosen with <SpellLink id={SPELLS.ABYSSAL_STRIKE_TALENT.id} />. It provides a very good AoE passive damage. </span>,
    [SPELLS.FEL_ERUPTION_TALENT.id]: <span>Very good choice when dealing with single-target damage all fight. It sacrifices survivability for DPS so, as a tank, usually that is not a wise choice. </span>,
    // lvl 104
    [SPELLS.FEED_THE_DEMON_TALENT.id]: <span>Almost not a valid choice, being easily overshadowed by <SpellLink id={SPELLS.FRACTURE_TALENT.id} /> damage or <SpellLink id={SPELLS.SOUL_RENDING_TALENT_VENGEANCE.id} /> survivability. </span>,
    [SPELLS.FRACTURE_TALENT.id]: <span>Default talent is this talent tier. It provides a great single-target damage, as well as AoE damage with <SpellLink id={SPELLS.SPIRIT_BOMB_TALENT.id}/> and great burst healing. </span>,
    [SPELLS.SOUL_RENDING_TALENT_VENGEANCE.id]: <span>Great choice for dungeons and Mythic + contents. Not very used in raid contents.</span>,
    // lvl 106
    [SPELLS.CONCENTRATED_SIGILS_TALENT.id]: <span>Default choice is this tier when chosen with <SpellLink id={SPELLS.FLAME_CRASH_TALENT.id} /> talent. </span>,
    [SPELLS.SIGIL_OF_CHAINS_TALENT.id]: <span>Usually a good talent for easier AoE damage. It is very strong in dungeons contents.</span>,
    [SPELLS.QUICKENED_SIGILS_TALENT.id]: <span>Only choose this talent if you want to spam your sigils all fight, by lowering the cooldowns of all your sigils. </span>,
    // lvl 108
    [SPELLS.FEL_DEVASTATION_TALENT.id]: <span>Provides burst healing and damage, but it is a very weak choice when compared with the others talents in this tier. </span>,
    [SPELLS.BLADE_TURNING_TALENT.id]: <span>Almost not a valid choice. </span>,
    [SPELLS.SPIRIT_BOMB_TALENT.id]: <span>Core talent. It provides a very good 20% damage healing debuff in all enemies in AoE or single-target fights. The go-to talent for raids, dungeons, soloing or leveling. </span>,
    // lvl 110
    [SPELLS.LAST_RESORT_TALENT.id]: <span>Very strong choice for raid content. It may save a battle ressurection spell and maybe a wipe. </span>,
    [SPELLS.DEMONIC_INFUSION_TALENT.id]: <span>This talent provides a very good damage increase when chosen with <SpellLink id={SPELLS.RAZOR_SPIKES_TALENT.id} /> talent and also a great physical damage reduction talent.</span>,
    [SPELLS.SOUL_BARRIER_TALENT.id]: <span>This talent is viable just in heavy magical damage fights. Maximize its value using after a <SpellLink id={SPELLS.SOUL_CARVER.id}/>, <SpellLink id={SPELLS.FALLOUT_TALENT.id}/> or <SpellLink id={SPELLS.FRACTURE_TALENT.id} /> .</span>,
  },
};
