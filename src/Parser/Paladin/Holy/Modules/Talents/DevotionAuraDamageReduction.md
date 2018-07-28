# Devotion Aura damage reduction analysis

[![Tooltip](https://user-images.githubusercontent.com/4565223/43018363-bc61c862-8c59-11e8-80fc-77938dfe1740.png)](https://wowdb.com/spells/183425-devotion-aura)

## How we analyze damage reductions

Damage reductions stack multiplicatively, so two 20% DR buffs will lead to a total of 36% damage reduction rather than 40%. Because of this, there are two ways to calculate the value of DR buffs.

Imagine you were hit by a spell that does 1,000 raw damage. You have two damage reduction buffs up, one of 20% and one of 40%. The actual damage you would take would be 1000*80%*60%=480 damage (total DR is 520 damage, or 52%). If we wanted to know the damage reduced by the 20% buff, there would be two methods to calculate it.

One method takes all damage reduction buffs into account and give a fair share of the reduced damage to each. Using the example values, we have a total of 520 damage reduced by 60% total *raw* damage reduction (52% effective DR). To calculate the value of a damage reduction buff using this method, we can use the formula `damage reduced / total raw damage reduction * damage reduction`. For the 20% DR buff this would be (`520 / 60% * 20%=`) 173 damage reduced.

This method gives an equal share to each DR buff as if they're all comparable. However, if you look closely at damage reduction effects, you'll find that most aren't that similar.

The most extreme example of this is Armor versus a short duration DR such as Divine Protection. The Armor DR has a 100% uptime and is (mostly) non-variable while Divine Protection can be timed to be active at the exact right moment, or not at all. It would be fair to assume the damage would have been reduced by the Armor DR regardless, and because of that it should get the full DR value. Once we have accounted for the Armor damage reduction, only the remaining damage reduction would be effective DR by Divine Protection.

Devotion Aura is similarly optional. You can replace it completely with either Aura of Mercy or Aura of Sacrifice. The graph below illustrates the damage taken when accounting for static DR such as from Armor, but it applies the same to static DRs such as Versatility.

<center>
  <img src="https://user-images.githubusercontent.com/4565223/43354049-2cc22de0-9245-11e8-80db-9a998cf2c396.png">
</center>

The other method would be to only look at the 20% buff. Using the formula `actual damage taken / (100% - DR percentage) * DR percentage` would give us the damage reduced by just the buff. In this example that would be (`480 / 80% * 20%=`) 120. The graph below illustrates this approach.

<center>
  <img src="https://user-images.githubusercontent.com/4565223/43354048-2ca6d680-9245-11e8-9751-5f5fd14b844a.png">
</center>

The big advantage of this approach is that it works under the assumption that all other DR buffs are out of your control and would have been there regardless. This is great for temporary or optional damage reduction effects such as Devotion Aura or Divine Protection as it perfectly isolates their value to show how much it was worth. It reveals how much effective damage reduction you would lose out on if you didn't have the talent, or if you didn't cast it when you did. Another advantage is that it discourages stacking DRs because the DR under analysis will get a low value out of it.

We use the last method because we assume the DR under analysis is the one thing that's optional and everything else likely would have been cast regardless. We assume you use the shown data to consider if you should use the DR at all, or maybe at another time. For example you wouldn't change your Divine Protection cast based on having slightly more or less Armor, and you probably would have cast Divine Protection regardless of being affected by Devotion Aura.

## Analyzing Devotion Aura's passive

WoWAnalyzer only receives events relating to the selected player. This makes it impossible to see what damage allies took while affected by the passive. Instead this module works under the assumption that the damage taken by the Paladin is about equal to that taken by allies that may be affected by the passive. Because of how damage is usually spread over the raid, this is almost always the case. With this in mind **the passive damage reduction is calculated using only the Paladin's damage taken**.

The Devotion Aura passive scales based on the amount of allies within range. The scaling is asymptotic to 2.5%, with the formula to calculate the current damage reduction being `2.25% + 7.75% / players`. The damage reduction per player is illustrated in the graph below.

![Passive damage reduction per player](https://user-images.githubusercontent.com/4565223/43223719-46bc0da8-9054-11e8-82d4-7e669bd2366d.png)

Because of the way the passive scales, its total power is increased as more allies are in range. For example when there are 5 players in range of the aura, each player will have a damage reduction of 3.8%, which comes down to a total damage reduction of 19%. The graph below illustrates the total damage reduction for the amount of players in range.

![Passive damage reduction total sum of all players](https://user-images.githubusercontent.com/4565223/43223721-4846f0f2-9054-11e8-9910-c37d38abc4e7.png)

To account for this in the analysis of the passive, the calculated damage reduction is based on the total damage reduction of the passive to all affected players at that moment. With everything taken into account, the passive's damage taken is calculated with the formula `actual damage taken / total passive damage reduction * total passive damage reduction` where *actual damage taken* is the damage taken by the Paladin.

This damage reduction is calculated separate for each damage taken event. This calculation uses an accurate total current damage reduction based on the amount of players affected by the aura at that time.

I have also built and run a version that did the full, extensive, analysis, which takes all factors into account. This has shown the method used for comes really close to the real value. The extensive analysis takes about 6 minutes per fight to complete and costs a lot of resources, so it's not something that could ever be released as a part of WoWAnalyzer.

## Analyzing Devotion Aura's active

The active (the Aura Mastery effect) is calculated by taking the damage reduction based on the total damage taken of the raid. The required data for this is retrieved via an extra query to Warcraft Logs. This is 99% accurate; only false positives may throw off the result which should be extremely rare.

More info on Devotion Aura: https://github.com/MartijnHols/HolyPaladin/blob/master/Spells/Talents/60/DevotionAura.md
More info on all auras: https://sacredshielding.wordpress.com/2018/07/23/reading-the-color-of-your-aura-in-battle-for-azeroth/
