import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default {
  descriptions: {
    // lv 15
    [SPELLS.CHI_BURST_TALENT.id]: <span><SpellLink id={SPELLS.CHI_BURST_TALENT.id} /> does the most single target damage, but <SpellLink id={SPELLS.CHI_WAVE_TALENT.id} /> is recommended due to its short CD and ease of use. </span>,
    [SPELLS.EYE_OF_THE_TIGER_TALENT.id]: <span><SpellLink id={SPELLS.EYE_OF_THE_TIGER_TALENT.id} /> can be used with <SpellLink id={SPELLS.SERENITY_TALENT.id} /> as free GCDs won't be as easy to come by, so using <SpellLink id={SPELLS.CHI_WAVE_TALENT.id} /> on cooldown can be difficult.</span>,
    [SPELLS.CHI_WAVE_TALENT.id]: <span><SpellLink id={SPELLS.CHI_WAVE_TALENT.id} /> is the default choice due to its quick cooldown that can keep up <SpellLink id={SPELLS.HIT_COMBO_TALENT.id} /> for additional mastery.</span>,
    // lv 30
    [SPELLS.CHI_TORPEDO_TALENT.id]: <span><SpellLink id={SPELLS.CHI_TORPEDO_TALENT.id} /> is good for prolonged movement, such as kiting, and covering long distances quickly.</span>,
    [SPELLS.TIGERS_LUST_TALENT.id]: <span><SpellLink id={SPELLS.TIGERS_LUST_TALENT.id} /> is useful in most situations due to it not sharing a cooldown with <SpellLink id={SPELLS.ROLL.id} />.</span>,
    [SPELLS.CELERITY_TALENT.id]: <span><SpellLink id={SPELLS.CELERITY_TALENT.id} /> gives an extra stack of <SpellLink id={SPELLS.ROLL.id} /> which may be useful depending on the situation.</span>,
    // lv 45
    [SPELLS.ENERGIZING_ELIXIR_TALENT.id]: <span><SpellLink id={SPELLS.ENERGIZING_ELIXIR_TALENT.id} /> is the default choice. It provides more Energy and Chi than the other options.</span>,
    [SPELLS.ASCENSION_TALENT.id]: <span><SpellLink id={SPELLS.ASCENSION_TALENT.id} /> is not recommended because it is outperformed by both of the other options.</span>,
    [SPELLS.POWER_STRIKES_TALENT.id]: <span><SpellLink id={SPELLS.POWER_STRIKES_TALENT.id} /> is close behind <SpellLink id={SPELLS.ENERGIZING_ELIXIR_TALENT.id} /> for single target and can be used if you are not comfortable using <SpellLink id={SPELLS.ENERGIZING_ELIXIR_TALENT.id} />. </span>,
    // lv 60
    [SPELLS.RING_OF_PEACE_TALENT.id]: <span><SpellLink id={SPELLS.RING_OF_PEACE_TALENT.id} /> can be used to knockback enemies that need to be kept from a certain location.</span>,
    [SPELLS.SUMMON_BLACK_OX_STATUE_TALENT.id]: <span><SpellLink id={SPELLS.SUMMON_BLACK_OX_STATUE_TALENT.id} /> can be used to group enemies up, should a grip not be available</span>,
    [SPELLS.LEG_SWEEP_TALENT.id]: <span><SpellLink id={SPELLS.LEG_SWEEP_TALENT.id} /> will be the default for almost all situations</span>,
    // lv 75
    [SPELLS.HEALING_ELIXIR_TALENT.id]: <span><SpellLink id={SPELLS.HEALING_ELIXIR_TALENT.id} /> is good for on-demand healing where the other two talents wouldn’t be as useful.</span>,
    [SPELLS.DIFFUSE_MAGIC_TALENT.id]: <span><SpellLink id={SPELLS.DIFFUSE_MAGIC_TALENT.id} /> for large magical damage.</span>,
    [SPELLS.DAMPEN_HARM_TALENT.id]: <span><SpellLink id={SPELLS.DAMPEN_HARM_TALENT.id} /> for physical damage.</span>,
    // lv 90
    [SPELLS.RUSHING_JADE_WIND_TALENT.id]: <span><SpellLink id={SPELLS.RUSHING_JADE_WIND_TALENT.id} /> should only be used when there are consistently more than 5 targets to reduce AoE ramp-up time.</span>,
    [SPELLS.INVOKE_XUEN_THE_WHITE_TIGER_TALENT.id]: <span><SpellLink id={SPELLS.INVOKE_XUEN_THE_WHITE_TIGER_TALENT.id} /> is useful for very high priority burst that lines up with its uptime and cooldown.</span>,
    [SPELLS.HIT_COMBO_TALENT.id]: <span><SpellLink id={SPELLS.HIT_COMBO_TALENT.id} /> is the default choice. Correct usage leads to a direct damage increase.</span>,
    // lv 100
    [SPELLS.CHI_ORBIT_TALENT.id]: <span><SpellLink id={SPELLS.CHI_ORBIT_TALENT.id} />if you want to be lazy, although it technically has a use at very very high target AOE.</span>,
    [SPELLS.WHIRLING_DRAGON_PUNCH_TALENT.id]: <span><SpellLink id={SPELLS.WHIRLING_DRAGON_PUNCH_TALENT.id} /> may be viable in large scale AoE situations.</span>,
    [SPELLS.SERENITY_TALENT.id]: <span><SpellLink id={SPELLS.SERENITY_TALENT.id} /> currently wins out in most situations and is the default choice.</span>,
  },
   attribution: <span>Parts of the descriptions for talents came from the <a href="http://www.peakofserenity.com/windwalker/guide/pve/talents/" target="_blank" rel="noopener noreferrer">Peak of Serenity Windwalker Talent guide</a> by Babylonius.</span>,
};