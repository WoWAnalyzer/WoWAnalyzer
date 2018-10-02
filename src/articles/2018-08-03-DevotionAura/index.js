import React from 'react';

import { Zerotorescue } from 'CONTRIBUTORS';
import RegularArticle from 'interface/news/RegularArticle';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import Warning from 'interface/common/Alert/Warning';

import EqualShare from './EqualShare.png';
import FairShare from './FairShare.png';
import OptionalDRs from './OptionalDRs.png';
import DevotionAuraTooltip from './DevotionAuraTooltip.png';
import DevotionAuraPassiveDR from './DevotionAuraPassiveDR.png';
import DevotionAuraPassiveDRTotal from './DevotionAuraPassiveDRTotal.png';

export default (
  <RegularArticle title="Analyzing Devotion Aura's DRPS" publishedAt="2018-08-03" publishedBy={Zerotorescue}>
    There are multiple methods to analyzing the value of damage reductions effects in World of Warcraft. In this article we take a close look at how the damage reduced by <SpellLink id={SPELLS.DEVOTION_AURA_TALENT.id} /> is analyzed. The first part of this article is a general explanation of how different damage reductions can be analyzed. The second part will be specifically about how the DRPS value for <SpellLink id={SPELLS.DEVOTION_AURA_TALENT.id} /> is established.<br /><br />

    <Warning>
      This article is part of the <i>theorycrafting</i> series and gets very technical. You do <b>not</b> need to understand any of this in order to play well.
    </Warning><br />

    <h1>How we analyze damage reductions</h1>

    At the base of damage reduction effects is the formula to apply a single damage reduction effect. The formula for this is <code>damage taken * (100% - DR) = damage taken</code>. This is a recursive formula as damage reductions stack multiplicatively, meaning if there are multiple DR effects, you would have to use this formula multiple times on the result (i.e. recursively). Two 20% DR effects will lead to a total of 36% damage reduction rather than 40%. Because of how damage reduction effects stack, there are multiple methods to calculate the value of DR effects.<br /><br />

    The possible methods are explained below. Each method is accompanied with an example based on the following scenario:<br /><br />

    Imagine you were hit by a spell that does 1,000 raw damage. You have two damage reduction buffs up, <SpellLink id={SPELLS.DIVINE_PROTECTION.id} /> giving 20% DR and Armor giving 40% DR. The effective damage taken would be <code>1000 * (100% - 20%) * (100% - 40%) =</code> 480 damage. The total damage reduced would be 520 damage, or 52% effective DR.<br /><br />

    <h2>Equal share</h2>

    The first method takes all damage reduction effects into account and gives an equal share of the reduced damage to each effect as if they're all comparable. This can be done using the formula <code>total damage reduced / total raw damage reduction * damage reduction</code> where <i>damage reduction</i> is the DR under analysis.<br /><br />

    Using the example values, we have a total of 520 damage reduced by 60% total <i>raw</i> damage reduction. For <SpellLink id={SPELLS.DIVINE_PROTECTION.id} /> (the 20% DR buff) the resulting damage reduction of this method would be <code>520 / 60% * 20% =</code> <strong>173 damage</strong>.<br /><br />

    This method is illustrated in the image below.<br /><br />

    <img src={EqualShare} alt="Equal share damage reduction calculation" /><br /><br />

    <h2>Fair share</h2>

    The issue with the <i>equal share</i> approach is that if you look closely at damage reduction effects, you'll find that most aren't that similar and so giving every DR an equal share would be incorrect.<br /><br />

    The most extreme example of this is static DR such as Armor or Versatility versus a short duration or optional DR such as <SpellLink id={SPELLS.DIVINE_PROTECTION.id} /> or Devotion Aura. Both Armor and Versatility have a 100% uptime and are (mostly) non-variable. On the other hand <SpellLink id={SPELLS.DIVINE_PROTECTION.id} /> can be timed to be active at the exact right moment, or not at all, and Devotion Aura can be replaced with the other talents in the row; Aura of Mercy or Aura of Sacrifice.<br /><br />

    It would be reasonable to assume the damage would have been reduced by the Armor and Versatility DR regardless of there being other DRs active as well. Because of that they should get the full DR value and the remaining damage reduction effects should base their damage reduction on the left-over damage reduced.<br /><br />

    Using the example values once again, we need two steps to determine the damage reduced by the 20% buff (<SpellLink id={SPELLS.DIVINE_PROTECTION.id} />). First we need to account for the Armor DR since it's a static damage reduction. We can just use the regular damage reduction formula; <code>1,000 * (100% - 40%) =</code> 600 damage taken. Next we can calculate the damage taken after <SpellLink id={SPELLS.DIVINE_PROTECTION.id} /> using the same formula with the new values; <code>600 * (100% - 20%) =</code> 480 damage taken. The difference is the the damage reduced by <SpellLink id={SPELLS.DIVINE_PROTECTION.id} />; <code>600 - 480 =</code> <strong>120 damage</strong>.<br /><br />

    This method is illustrated in the image below. Notice how the actual contribution of Devotion Aura is much smaller while the total damage reduced is the same.<br /><br />

    <img src={FairShare} alt="Fair share damage reduction calculation" /><br /><br />

    <h2>Optional DRs</h2>

    The final method only works for optional DRs as it always gives us the lowest possible damage reduction value. A big advantage of this approach is that it doesn't require knowing all applicable DRs nor the raw damage taken. This method only looks at the DR under analysis.<br /><br />

    We can get the damage reduced of just the DR under analysis using the formula <code>actual damage taken / (100% - DR percentage) * DR percentage</code>. Using the example numbers, if we look at the damage reduced by <SpellLink id={SPELLS.DIVINE_PROTECTION.id} /> (20% DR), we would find it reduced the damage taken by <code>480 / (100% - 20%) * 20% =</code> <strong>120 damage</strong>. This is the same result as the fair share approach for optional DRs, but it's much easier to calculate.<br /><br />

    This method is illustrated in the image below.<br /><br />

    <img src={OptionalDRs} alt="Optional damage reduction calculation" /><br /><br />

    The big advantage of this approach is that it works under the assumption that all other DR buffs are out of your control and would have been there regardless. This is great for temporary or optional damage reduction effects such as Devotion Aura or <SpellLink id={SPELLS.DIVINE_PROTECTION.id} /> as it perfectly isolates their value to show how much it was worth. It reveals how much effective damage reduction you would lose out on if you didn't have the talent, or if you didn't cast it when you did. Another advantage is that it discourages stacking DRs because the DR under analysis will get a low value out of it.<br /><br />

    <h1>Devotion Aura damage reduction analysis</h1>

    <a href="https://wowdb.com/spells/183425-devotion-aura"><img src={DevotionAuraTooltip} alt="Devotion Aura tooltip" /></a><br /><br />

    To analyze Devotion Aura we use the <i>optional DRs</i> method because we assume the DR under analysis is the one thing that's optional and everything else likely would have been cast regardless. We assume you use the shown data to consider if you should use the talent at all, or maybe activate Aura Mastery at another time. For example you wouldn't change your <SpellLink id={SPELLS.DIVINE_PROTECTION.id} /> cast based on having slightly more or less Armor, and you probably would have cast <SpellLink id={SPELLS.DIVINE_PROTECTION.id} /> regardless of being affected by Devotion Aura.<br /><br />

    <h2>Analyzing Devotion Aura's passive</h2>

    WoWAnalyzer only receives events relating to the selected player. This makes it impossible to see what damage allies took while affected by the passive. Instead this module works under the assumption that the damage taken by the Paladin is about equal to that taken by allies that may be affected by the passive. Because of how damage is usually spread over the raid, this is almost always the case. With this in mind <strong>the passive damage reduction is calculated using only the Paladin's damage taken</strong>.<br /><br />

    The Devotion Aura passive scales based on the amount of allies within range. The scaling is asymptotic to 3%, with the formula to calculate the current damage reduction being <code>MAX(3%, 2.25% + 7.75% / players)</code>. The damage reduction per player is illustrated in the graph below (<a href="https://github.com/MartijnHols/HolyPaladin/blob/master/Spells/Talents/60/DevotionAura.md">source</a>).<br /><br />

    <img src={DevotionAuraPassiveDR} alt="Passive damage reduction per player" /><br /><br />

    Because of the way the passive scales, its total power is increased as more allies are in range. For example when there are 5 players in range of the aura, each player will have a damage reduction of 3.8%, which comes down to a total damage reduction of 19%. The graph below illustrates the total damage reduction for the amount of players in range.<br /><br />

    <img src={DevotionAuraPassiveDRTotal} alt="Passive damage reduction total (sum of all players)" /><br /><br />

    To account for this in the analysis of the passive, the calculated damage reduction is based on the total damage reduction of the passive to all affected players at that moment. With everything taken into account, the passive's damage taken is calculated with the formula <code>actual damage taken / total passive damage reduction * total passive damage reduction</code> where <i>actual damage taken</i> is the damage taken by the Paladin.<br /><br />

    This damage reduction is calculated separate for each damage taken event. This calculation uses an accurate total current damage reduction based on the amount of players affected by the aura at that time.<br /><br />

    A version that did the extensive analysis, which takes all factors into account including per-player damage taken, has also been built and executed for comparison. This has shown that the method used in the WoWAnalyzer module comes really close to the real value. The extensive analysis takes about 6 minutes per fight to complete and costs a lot of resources, so it's not something that could ever be released as a part of WoWAnalyzer.<br /><br />

    <h2>Analyzing Devotion Aura's active</h2>

    The active (the Aura Mastery effect) is calculated by taking the damage reduction based on the total damage taken of the raid. The required data for this is retrieved via an extra query to Warcraft Logs. This is 99% accurate; only false positives may throw off the result. This should be extremely rare, as we already exclude false positives by excluding damage taken that wasn't affected by at least 20% damage reduction.<br /><br />

    <h2>Conclusion</h2>

    The methods used to get you a DRPS value for Devotion Aura on WoWAnalyzer gives us very accurate results. The methods are described in this article so that anyone can review and verify them. If you have any feedback let me know on Discord; @Zerotorescue.<br /><br />

    More info on Devotion Aura: <a href="https://github.com/MartijnHols/HolyPaladin/blob/master/Spells/Talents/60/DevotionAura.md">https://github.com/MartijnHols/HolyPaladin/blob/master/Spells/Talents/60/DevotionAura.md</a><br />
    More info on all auras: <a href="https://sacredshielding.wordpress.com/2018/07/23/reading-the-color-of-your-aura-in-battle-for-azeroth/">https://sacredshielding.wordpress.com/2018/07/23/reading-the-color-of-your-aura-in-battle-for-azeroth/</a>
  </RegularArticle>
);
