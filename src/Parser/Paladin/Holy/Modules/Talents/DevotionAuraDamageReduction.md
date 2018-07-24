# Devotion Aura damage reduction analysis

[![Tooltip](https://user-images.githubusercontent.com/4565223/43018363-bc61c862-8c59-11e8-80fc-77938dfe1740.png)](https://beta.wowdb.com/spells/183425-devotion-aura)

## How we analyze damage reductions

I should probably mention that (as with all DRs) I assume the DR under analysis is the one thing that's optional
and everything else likely would have been cast regardless
e.g. you wouldn't change your DP cast based on having Devo or not

- actual damage taken / damage reduction = damage taken without the damage reduction
- damage taken without the damage reduction * damage reduction = damage reduced by the damage reduction

## The passive

WoWAnalyzer only receives events relating to the selected player. This makes it impossible to see what damage allies took while affected by the passive. Instead this module works under the assumption that the damage taken by the Paladin is about equal to that taken by allies that may be affected by the passive. Because of how damage is usually spread over the raid, this is almost always the case.

With this in mind the passive damage reduction is calculated using only the Paladin's damage taken. Extensive analysis has shown this comes really close to the real value.

The Devotion Aura passive scales based on the amount of allies within range. The scaling is asymptotic to 2.5%, with the formula to calculate the current damage reduction being `2.25% + 7.75% / players`. The way the passive scales, its total power is increased as more allies are in range. For example when there are 5 players in range of the aura, each player will have a damage reduction of 3.8%, which comes down to a total damage reduction of 19%. The graph below illustrates the total damage reduction for the amount of players in range ([source](https://sacredshielding.wordpress.com/2018/07/23/reading-the-color-of-your-aura-in-battle-for-azeroth/)).

![Graph](https://user-images.githubusercontent.com/4565223/43164365-48c83e6e-8f91-11e8-8d0b-7466ea9d292a.png)

To account for this, the calculated damage reduced is based on the total damage reduction at that moment. With everything taken into account, the passive's damage taken is calculated with the formula `actual damage taken / total current damage reduction * total current damage reduction` where actual damage taken is the damage taken by the Paladin.

This damage reduction is calculated for each event with an accurate total current damage reduction based on the amount of players affected by the aura at that time.

More info on the passive: https://github.com/MartijnHols/HolyPaladin/blob/master/Spells/Talents/60/DevotionAura.md#about-the-passive-effect
Even more info: https://sacredshielding.wordpress.com/2018/07/23/reading-the-color-of-your-aura-in-battle-for-azeroth/

## The active

The active (the Aura Mastery effect) is calculated by taking the damage reduction based on the total damage taken of the raid. The required data for this is retrieved via an extra query to Warcraft Logs.
