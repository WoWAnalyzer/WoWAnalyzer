# How we analyze damage reductions

There are multiple methods to analyzing the value of damage reductions effects in World of Warcraft. This article describes the available methods and goes into the methods used to get you a DRPS value for Devotion Aura on WoWAnalyzer.

At the base of damage reduction effects is the formula to apply a single damage reduction effect. The formula for this is `damage taken * (100% - DR) = damage taken`. This is a recursive formula as damage reductions stack multiplicatively, meaning if there are multiple DR effects, you would have to use this formula multiple times on the result (i.e. recursively). Two 20% DR effects will lead to a total of 36% damage reduction rather than 40%. Because of how damage reduction effects stack, there are multiple methods to calculate the value of DR effects.

The possible methods are explained below. Each method is accompanied with an example based on the following scenario:

Imagine you were hit by a spell that does 1,000 raw damage. You have two damage reduction buffs up, Divine Protection giving 20% DR and Armor giving 40% DR. The effective damage taken would be `1000 * (100% - 20%) * (100% - 40%) =` 480 damage. The total damage reduced would be 520 damage, or 52% effective DR.

## Equal share

The first method takes all damage reduction effects into account and gives an equal share of the reduced damage to each effect as if they're all comparable. This can be done using the formula `total damage reduced / total raw damage reduction * damage reduction` where *damage reduction* is the DR under analysis.

Using the example values, we have a total of 520 damage reduced by 60% total *raw* damage reduction. For Divine Protection (the 20% DR buff) the resulting damage reduction of this method would be `520 / 60% * 20% =` **173 damage**.

This method is illustrated in the image below.

![Equal share damage reduction calculation](https://user-images.githubusercontent.com/4565223/43356596-caed9382-9273-11e8-94eb-c109bb442298.png)

## Fair share

The issue with the *equal share* approach is that if you look closely at damage reduction effects, you'll find that most aren't that similar and so giving every DR an equal share would be incorrect.

The most extreme example of this is static DR such as Armor or Versatility versus a short duration or optional DR such as Divine Protection or Devotion Aura. Both Armor and Versatility have a 100% uptime and are (mostly) non-variable. On the other hand Divine Protection can be timed to be active at the exact right moment, or not at all, and Devotion Aura can be replaced with the other talents in the row; Aura of Mercy or Aura of Sacrifice.

It would be reasonable to assume the damage would have been reduced by the Armor and Versatility DR regardless of there being other DRs active as well. Because of that they should get the full DR value and the remaining damage reduction effects should base their damage reduction on the left-over damage reduced.

Using the example values once again, we need two steps to determine the damage reduced by the 20% buff (Divine Protection). First we need to account for the Armor DR since it's a static damage reduction. We can just use the regular damage reduction formula; `1,000 * (100% - 40%) =` 600 damage taken. Next we can calculate the damage taken after Divine Protection using the same formula with the new values; `600 * (100% - 20%) =` 480 damage taken. The difference is the the damage reduced by Divine Protection; `600 - 480 =` **120 damage**.

This method is illustrated in the image below. Notice how the actual contribution of Devotion Aura is much smaller while the total damage reduced is the same.

![Fair share damage reduction calculation](https://user-images.githubusercontent.com/4565223/43354049-2cc22de0-9245-11e8-80db-9a998cf2c396.png)

## Optional DRs

The final method only works for optional DRs as it always gives us the lowest possible damage reduction value. A big advantage of this approach is that it doesn't require knowing all applicable DRs nor the raw damage taken. This method only looks at the DR under analysis.

We can get the damage reduced of just the DR under analysis using the formula `actual damage taken / (100% - DR percentage) * DR percentage`. Using the example numbers, if we look at the damage reduced by Divine Protection (20% DR), we would find it reduced the damage taken by `480 / (100% - 20%) * 20% =` **120 damage**.

This method is illustrated in the image below.

![Optional damage reduction calculation](https://user-images.githubusercontent.com/4565223/43354048-2ca6d680-9245-11e8-9751-5f5fd14b844a.png)

The big advantage of this approach is that it works under the assumption that all other DR buffs are out of your control and would have been there regardless. This is great for temporary or optional damage reduction effects such as Devotion Aura or Divine Protection as it perfectly isolates their value to show how much it was worth. It reveals how much effective damage reduction you would lose out on if you didn't have the talent, or if you didn't cast it when you did. Another advantage is that it discourages stacking DRs because the DR under analysis will get a low value out of it.

# Devotion Aura damage reduction analysis

[![Tooltip](https://user-images.githubusercontent.com/4565223/43018363-bc61c862-8c59-11e8-80fc-77938dfe1740.png)](https://wowdb.com/spells/183425-devotion-aura)

To analyze Devotion Aura we use the *optional DRs* method because we assume the DR under analysis is the one thing that's optional and everything else likely would have been cast regardless. We assume you use the shown data to consider if you should use the talent at all, or maybe activate Aura Mastery at another time. For example you wouldn't change your Divine Protection cast based on having slightly more or less Armor, and you probably would have cast Divine Protection regardless of being affected by Devotion Aura.

## Analyzing Devotion Aura's passive

WoWAnalyzer only receives events relating to the selected player. This makes it impossible to see what damage allies took while affected by the passive. Instead this module works under the assumption that the damage taken by the Paladin is about equal to that taken by allies that may be affected by the passive. Because of how damage is usually spread over the raid, this is almost always the case. With this in mind **the passive damage reduction is calculated using only the Paladin's damage taken**.

The Devotion Aura passive scales based on the amount of allies within range. The scaling is asymptotic to 3%, with the formula to calculate the current damage reduction being `MAX(3%, 2.25% + 7.75% / players)`. The damage reduction per player is illustrated in the graph below ([source](https://github.com/MartijnHols/HolyPaladin/blob/master/Spells/Talents/60/DevotionAura.md)).

![Passive damage reduction per player](https://user-images.githubusercontent.com/4565223/43359142-1550084a-929e-11e8-97fe-c658279244e8.png)

Because of the way the passive scales, its total power is increased as more allies are in range. For example when there are 5 players in range of the aura, each player will have a damage reduction of 3.8%, which comes down to a total damage reduction of 19%. The graph below illustrates the total damage reduction for the amount of players in range.

![Passive damage reduction total (sum of all players)](https://user-images.githubusercontent.com/4565223/43359144-16f16de2-929e-11e8-81db-5ad85f864625.png)

To account for this in the analysis of the passive, the calculated damage reduction is based on the total damage reduction of the passive to all affected players at that moment. With everything taken into account, the passive's damage taken is calculated with the formula `actual damage taken / total passive damage reduction * total passive damage reduction` where *actual damage taken* is the damage taken by the Paladin.

This damage reduction is calculated separate for each damage taken event. This calculation uses an accurate total current damage reduction based on the amount of players affected by the aura at that time.

A version that did the extensive analysis, which takes all factors into account including per-player damage taken, has also been built and executed for comparison. This has shown that the method used in the WoWAnalyzer module comes really close to the real value. The extensive analysis takes about 6 minutes per fight to complete and costs a lot of resources, so it's not something that could ever be released as a part of WoWAnalyzer.

## Analyzing Devotion Aura's active

The active (the Aura Mastery effect) is calculated by taking the damage reduction based on the total damage taken of the raid. The required data for this is retrieved via an extra query to Warcraft Logs. This is 99% accurate; only false positives may throw off the result. This should be extremely rare, as we already exclude false positives by excluding damage taken that wasn't affected by at least 20% damage reduction.

## Conclusion

The methods used to get you a DRPS value for Devotion Aura on WoWAnalyzer gives us very accurate results. The methods are described in this article so that anyone can review and verify them. If you have any feedback let me know on Discord; @Zerotorescue.

More info on Devotion Aura: https://github.com/MartijnHols/HolyPaladin/blob/master/Spells/Talents/60/DevotionAura.md
More info on all auras: https://sacredshielding.wordpress.com/2018/07/23/reading-the-color-of-your-aura-in-battle-for-azeroth/
