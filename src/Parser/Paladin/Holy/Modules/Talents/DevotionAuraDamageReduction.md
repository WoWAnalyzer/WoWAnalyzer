# Devotion Aura damage reduction analysis

[![Tooltip](https://user-images.githubusercontent.com/4565223/43018363-bc61c862-8c59-11e8-80fc-77938dfe1740.png)](https://wowdb.com/spells/183425-devotion-aura)

## How we analyze damage reductions

Damage reduction buffs stack multiplicatively, so two 20% DR buffs will lead to a total of 36% damage reduction rather than 40%. Because of this, there are two ways to calculate the value of DR buffs.

Imagine you were hit by a spell that does 1,000 raw damage. You have two damage reduction buffs up, one of 20% and one of 40%. The actual damage you would take would be 1000*80%*60%=480 damage. If we wanted to know the damage reduced by the 20% buff, there would be two ways to calculate it.

One way would be to only look at the 20% buff. Using the formula `actual damage taken / (100% - DR percentage) * DR percentage` would give us the damage reduced by the buff. In this example that would be (`480 / 80% * 20%=`) 120.

This first method...

The other way is to take all damage reduction buffs into account and give a fair share of the reduced damage to each. Using the example values, we would have a total of 520 damage reduced by 60% damage reduction. To calculate the value of a damage reduction buff using this method, we can use the formula `damage reduced / total damage reduction * damage reduction`. For the 20% DR buff this would be (`520 / 60% * 20%=`) 173 damage reduced.

The second method gives an equal share to each DR buff as if they're all comparable. However, if you look closely at DR buffs you'll find that they aren't very similar. The most extreme example of this is Armor versus a short duration DR such as Divine Protection.

We use the first method because we assume the DR under analysis is the one thing that's optional and everything else likely would have been cast regardless. e.g. you wouldn't change your DP cast based on having Devo or not

- `actual damage taken / damage reduction` = damage taken without this specific damage reduction
- `damage taken without the damage reduction * damage reduction` = damage reduced by just this damage reduction

## The passive

WoWAnalyzer only receives events relating to the selected player. This makes it impossible to see what damage allies took while affected by the passive. Instead this module works under the assumption that the damage taken by the Paladin is about equal to that taken by allies that may be affected by the passive. Because of how damage is usually spread over the raid, this is almost always the case.

With this in mind the passive damage reduction is calculated using only the Paladin's damage taken.

The Devotion Aura passive scales based on the amount of allies within range. The scaling is asymptotic to 2.5%, with the formula to calculate the current damage reduction being `2.25% + 7.75% / players`. The damage reduction per player is illustrated in the graph below.

![Passive damage reduction per player](https://user-images.githubusercontent.com/4565223/43223719-46bc0da8-9054-11e8-82d4-7e669bd2366d.png)

Because of the way the passive scales, its total power is increased as more allies are in range. For example when there are 5 players in range of the aura, each player will have a damage reduction of 3.8%, which comes down to a total damage reduction of 19%. The graph below illustrates the total damage reduction for the amount of players in range.

![Passive damage reduction total sum of all players](https://user-images.githubusercontent.com/4565223/43223721-4846f0f2-9054-11e8-9910-c37d38abc4e7.png)

To account for this in the analysis, the calculated damage reduced is based on the total damage reduction to all affected players at that moment. With everything taken into account, the passive's damage taken is calculated with the formula `actual damage taken / total current damage reduction * total current damage reduction` where actual damage taken is the damage taken by the Paladin.

This damage reduction is calculated separate for each damage taken event. This calculation uses an accurate total current damage reduction based on the amount of players affected by the aura at that time.

I have also built and run a version that did the full, extensive, analysis, which takes all factors into account. This has shown the method used for comes really close to the real value. The extensive analysis takes about 6 minutes per fight to complete and costs a lot of resources, so it's not something that could ever be released on WoWAnalyzer.

More info on the aura: https://github.com/MartijnHols/HolyPaladin/blob/master/Spells/Talents/60/DevotionAura.md
More info on all auras: https://sacredshielding.wordpress.com/2018/07/23/reading-the-color-of-your-aura-in-battle-for-azeroth/

## The active

The active (the Aura Mastery effect) is calculated by taking the damage reduction based on the total damage taken of the raid. The required data for this is retrieved via an extra query to Warcraft Logs. This is 99% accurate; only false positives should throw off the result which should be extremely rare.
