import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default {
  descriptions: {
    // lvl 15
    [SPELLS.CHI_BURST_TALENT.id]: <span>Perform a hadouken and deal damage to all enemies in the burst of chi's path as well as healing yourself and any allies in <SpellLink id={SPELLS.CHI_BURST_TALENT.id} />'s path. More bursty, reliable group healing than the other options for group content. Adequate, impactful self healing.</span>,
    [SPELLS.EYE_OF_THE_TIGER_TALENT.id]: <span>When you hit an enemy with <SpellLink id={SPELLS.TIGER_PALM.id} /> it will also deal damage over time and heal you over time. Doesn't stack or affect multiple enemies. If you prefer overall healing numbers in group content, this is the optimal choice.</span>,
    [SPELLS.CHI_WAVE_TALENT.id]: <span>This is best used when in solo content such as leveling and world questing, as the healing per hit isn't that significant when spread out across multiple allies. It also requires higher efficiency of the player to maintain its power, as it has a fairly short cooldown..</span>,
    // lvl 30
    [SPELLS.CHI_TORPEDO_TALENT.id]: <span>Increases the distance traveled by <SpellLink id={SPELLS.ROLL.id} /> as well as giving you a stacking movement speed buff. Great for when you need to travel fast for a long distance / time, very useful in world content and while leveling.</span>,
    [SPELLS.TIGERS_LUST_TALENT.id]: <span>Tiger's Lust tends to be the raider's go-to choice since it has an extra bonus of being able to remove roots and snares, which can counter some boss mechanics, saving mana on dispells. Otherwise, an on-demand sprint is generally a strong thing to have.</span>,
    [SPELLS.CELERITY_TALENT.id]: <span>Celerity lets you Roll more often which can be useful if you have a more frequent need for extra mobility.</span>,
    // lvl 45
    [SPELLS.LIGHT_BREWING_TALENT.id]: <span>Reduces the cooldown of your Brews by 3 seconds and grants a fourth charge. The only time you would ever want to use this is when you have high haste (about 30+%) and you aren't comfortable with <SpellLink id={SPELLS.BLACK_OX_BREW_TALENT.id} />.</span>,
    [SPELLS.BLACK_OX_BREW_TALENT.id]: <span>A 1.5 minute cooldown which instantly restores all brew charges and energy. This is generally seen as the best talent of the tier.</span>,
    [SPELLS.GIFT_OF_THE_MISTS_TALENT.id]: <span>This is a good talent for easier content (like leveling and world content) where you need to rely less on the damage smoothing of your Brews and more on self healing, but I would not recommend it for any group content.</span>,
    // lvl 60
    [SPELLS.RING_OF_PEACE_TALENT.id]: <span>Ring of Peace, and knockbacks used in PvE, have generally niche uses in fights. Whether you use it to speed up adds that need to get somewhere quickly, or if you need to protect your tank while you heal them up from a particularly nasty trash pack.</span>,
    [SPELLS.SUMMON_BLACK_OX_STATUE_TALENT.id]: <span>Summons Dave (the <SpellLink id={SPELLS.SUMMON_BLACK_OX_STATUE_TALENT.id} />), which taunts all enemies nearby it. You can use <SpellLink id={SPELLS.PROVOKE.id} /> on it to taunt all enemies surrounding the statue onto you. Great for encounters with regular points where adds spawn and with practiced use, is excellent for initially aggroing a group of mobs.</span>,
    [SPELLS.LEG_SWEEP_TALENT.id]: <span>Stuns all nearby enemies around you for 5 seconds. This will likely be your comfort pick in most content.</span>,
    // lvl 75
    [SPELLS.HEALING_ELIXIR_TALENT.id]: <span>Generally speaking, this should be your default talent for this tier and you should change it out if thecontent you are doing favors one of the other options.</span>,
    [SPELLS.MYSTIC_VITALITY_TALENT.id]: <span>Increases our ability to stagger magic damage by 40%. Do note this is not an additive 40% and its additive value is relative to the amount of stagger you have. If there is a fight with high, relatively frequent magic burst, or a dungeon with larger amounts of magic damage, this talent will shine.</span>,
    [SPELLS.DAMPEN_HARM_TALENT.id]: <span>If you find yourself in content where you need an additional cooldown in order to survive, Dampen Harm is the talent for you. If playing at a higher difficulty level in M+ or raids, you can safely use this as a default talent rather than <SpellLink id={SPELLS.HEALING_ELIXIR_TALENT.id} />.</span>,
    // lvl 90
    [SPELLS.RUSHING_JADE_WIND_TALENT.id]: <span>Deals AoE damage over time. Its cooldown and duration is affected by haste. This is a solid consistent AoE damage spell that functions very nicely as a filler if you feel the spec is too slow. It is also the strongest DPS talent of the tier, assuming you can maintain its uptime well.</span>,
    [SPELLS.INVOKE_NIUZAO_THE_BLACK_OX_TALENT.id]: <span>Summons the great celestial Niuzao. Niuzao can taunt enemies (which can be turned off if you prefer), charge at them, and stomp to deal AoE damage. This is the intended choice if you desire a better capacity to burst down targets when needed.</span>,
    [SPELLS.SPECIAL_DELIVERY_TALENT.id]: <span>The debuff will also enable <SpellLink id={SPELLS.BREATH_OF_FIRE.id} />'s damage over time effect. This does decent enough damage, but unless you are having a lot of difficulty using <SpellLink id={SPELLS.RUSHING_JADE_WIND_TALENT.id} /> on cooldown, it won't pump out nearly as high of numbers.</span>,
    // lvl 100
    [SPELLS.ELUSIVE_DANCE_TALENT.id]: <span>This is the best talent on the row for reducing overall damage taken (but not spike damage). It's a solid talent for content you overgear for the damage buff, or content where you do not need to really worry about spike damage as much, such as while leveling or easier dungeons where you wouldn't miss the higher burst reduction of other talents.</span>,
    [SPELLS.BLACKOUT_COMBO_TALENT.id]: <span>This is more or less the most flexible talent on the tier, but it requires a lot of thought as far as your priority is concerned. You will now want to save <SpellLink id={SPELLS.BLACKOUT_STRIKE.id} /> for every <SpellLink id={SPELLS.KEG_SMASH.id} /> and <SpellLink id={SPELLS.BREATH_OF_FIRE.id} />, in that priority. This will generate a significant amount of brew cooldown reduction and will be excellent at maintaining the <SpellLink id={SPELLS.HOT_BLOODED.id} /> damage reduction debuff more efficiently.</span>,
    [SPELLS.HIGH_TOLERANCE_TALENT.id]: <span>This is actually a fairly competitive choice for progression content if you are uncomfortable using <SpellLink id={SPELLS.BLACKOUT_COMBO_TALENT.id} />, as it will reduce spike damage more efficiently and will actually begin to out-perform it in brew generation once you hit an average of medium stagger across a fight, assuming you aren't using <SpellLink id={SPELLS.BLACK_OX_BREW_TALENT.id} />.</span>,
  },
  attribution: <span>The descriptions for talents came from the <a href="http://www.wowhead.com/brewmaster-monk-talent-guide" target="_blank" rel="noopener noreferrer">Brewmaster Monk Wowhead guide</a> by BrewingScribe.</span>,
};
