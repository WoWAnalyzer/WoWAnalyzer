# Holy Paladin Stat Values Methodology
The goal with "stat values" is to reveal what your stats were actually worth after an actual real-world fight. Instead of using generalized averages or best case simulations, this takes into account everything the player *actually* had to deal with; his raid setup, his raid's tactics, his assignments within these tactics, his skill, his cast behavior, his gear, etc.

This approach is more accurate *for that fight* than using tools that are very generalized and do not come close to that actual real-world situation. While it might be "easy" to modify those tools to match the real-world situation, very few users will actually do so as it goes beyond the amount of effort they are willing to spend and/or their skills.

It's likely the results will be somewhat different on successive pulls and so the shown values might not always be best suited to base gearing around. This is ok and I believe the approach of just showing the actual values within the fight fits the log analysis paradigm and can still be useful. I think it's important to keep the information presented in the analyzer based on facts as much as possible and add as little opinion to the data as possible so that everyone can make their own assessments without being misled. The consequences of this paradigm might not be obvious to all users and we will have to work on making this more apparent, the first step towards this was renaming "Stat weights" to "Stat values".

I personally believe it's hard to say which approach (generalized simulation or fight based log analysis) will more accurately match a player's future pulls but I concur that SimC is a more than good enough means of getting actual stat weights for the majority of players.

The implementation is based on the amazing work by @kfinch on the [Resto Druid Stat Weights](https://github.com/WoWAnalyzer/WoWAnalyzer/pull/604). Some of the below explanation was also blatantly stolen from his.

*This documentation might be outdated by the time you're reading it since it doesn't magically auto-update whenever the code is changed.*

## Approach
We made a list of all healing spells along with which stats those spells scales with, and for each stat a heal scales with we do some math to find out how much the last point of that stat contributed in healing. We compare the total healing contributions caused by each stat in order to generate values.

## Overheal
A problem to face when generating healing stat values is what to do about overhealing. Unfortunately, there is no one correct answer. A main issue is what I call The "Would've" Problem. We can say "an extra bit of healing here doesn't matter because it *would've* just caused the next heal to overheal", but how far can we take this logic? My approach is that it doesn't only matter how much is healed, but also how quickly. We'll count all healing that doesn't overheal even if we theorize that it might lead to overhealing. We're more strict on heals that overheal: they're disregarded entirely even if they're only partial overhealing. This is because a spell that partially overheals will do the same amount of effective healing regardless of the raw strength of the heal. This approach can cause some possible weirdness. For example, consider a situation where there is a heal for 500 (0 overheal) followed immediately by a heal for 400 (+ 100 overheal). 500 of this healing would be counted towards stat values. Now consider a situation where one heal does 900 (+ 100 overheal). Functionally, this situation is identical, but in this case none of the healing is counted towards stat values. Counting all effective healing, even heals that partially overheal, fixes this issue and is overall a valid approach, but still not one I will be taking. I think an advantage of disregarding all partial overheals is that it gives "top off" heals an effective lower value than "life saver" heals. Still, this is a decision I will revisit.

This applies for Intellect, Mastery, Versatility and Leech as they are stats that only increase the power (health) a heal restores. The other stats are special and behave differently as explained below.

## Stat Tracking
These calculations work best when they use the players actual stats at the moment of a heal. This is being taken care of by the StatTracker module which adjusts a player's stats based on applied buffs. If all buffs are implemented properly, this has a very high accuracy.

## Intellect
Math here is straightforward, as spells that scale with int scale directly and linearly with total int. Due to the 'all plate' bonus, each point of int gained is increased by 5%, which has to be taken into account. Effectively the increase in power from one int is simply `1.05 / totalInt`.

Because heals with overhealing are ignored, if every single heal had overhealed the value of Int would be 0. This makes sense as adding any health on top of the heal would only be adding to overhealing.

## Crit
1 more crit does not directly increase the power of a heal, instead it just increases the chance that heals that didn't crit, crit. Predicting the increased amount of crits from 1 crit rating would be impossible and averaging it our likely inaccurate. But this isn't a problem for our approach since we are calculating stats **not** based on *gaining 1 more rating* but based on the value of the *last 1 rating* of a stat. This means we don't need to predict anything and we only need to base our calculations on heals that actually crit during this log.

If heals with overhealing were ignored, if every single heal had overhealed the value of Crit would be 0. This wouldn't make sense as crit gives a boost of 100% (+Drape of Shame and other bonuses) and if only 10% of that boost overhealed it still gave us 90% healing. This means we need to take into account heals that overheal when calculating the value of crit.
The only time crit should be worth 0 is if we are crit **hard** capped. This means exceeding 100% crit chance.

With this in mind imagine when you average out a fight this is the result with 33% crit chance (10,000 rating) total:
```
type effective overheal   raw
hit      1,000        0 1,000
hit      1,000        0 1,000
crit     1,500      500 2,000
```
This approach would ignore the two hits completely and focus on the crit.
The crit's base healing was `1,000`, the raw crit part `1,000` and `500` of the crit part was effective crit healing. `1` crit rating would be worth `500 / crit rating` if we didn't get a `8%` base crit chance. Doing `500 * (1 - (8% / 33%))` gives us the averaged out value of the crit **rating** alone; `378,79`, dividing this by the crit rating gets us the value per 1 rating; `378,79 / 10,000 = 0,0379` healing per rating. This gives us the healing value of the last 1 rating in this log.
If we had 9% crit, the 500 effective healing gained from the rating would be just 55 HP after adjusting for base crit chance, which makes sense as only a fraction of the crit would have been gained from the rating.

If at the heal-event the critical strike chance was more than 100% for that spell, it is completely ignored and not included in the value of this spell. We take into account Holy Shock's double crit chance as well as crit buffs such as Avenging Wrath.

## Haste (HPCT)
HPCT stands for "Healing per Cast Time". This is the max value that Haste would be worth if you would cast everything you are already casting (that scales with Haste) faster. Mana and overhealing are not accounted for in any way.

If your spell's cooldown scales with Haste that speeds up your entire "rotation", e.g. HS -> FoL -> LoD -> BF -> FoL -> J -> HS stays the same you just cast them quicker after each other This isn't the kind of rotation you repeat exactly as after the second HS LoD and BF will be on CD, but imagine that those spells are available to you then that's how you'd cast it, with 10% Haste you'd cast the exact same thing only 10% faster. The result is that you cast everything that's limited by a Hasted cooldown 10% faster.

The real value of Haste (HPCT) will be between 0 and the shown value. It depends on various things, such as if you have the mana left to spend, if the gained casts would overheal, and how well you are at casting spells end-to-end. If you are going OOM before the end of the fight you might instead want to drop some Haste or cast fewer bad heals. If you had mana left-over, Haste could help you convert that into healing. If your Haste usage is optimal Haste will then be worth the shown max value.

Haste can also help you safe lives during intense damage phases. If you notice you're GCD capped when people are dying, Haste might help you land more heals. This may contribute more towards actually getting the kill.

**The easiest advice here is to get Haste to a point you're comfortable at. Experiment with different Haste levels, and don't drop a lot of item level for it.**

## Mastery
Mastery is pretty basic; every time a spell is cast we calculate the mastery effectiveness of that spell. The value of Mastery is then the same calculation as for Versatility, but multiplied for the actual mastery effectiveness of that spell. The same overhealing approach counts as well.

## Versatility
This is the same calculation as for Mastery without the mastery effectiveness (so Versa is more consistent); `healAmount / (1 + versPercentage) * versPercentageFromOneRating`. In addition to this we show the stat value from the damage reduced by Versatility by considering the DRPS as HPS.

  Because heals with overhealing are ignored, if every single heal had overhealed the value of Versatility would be 0. This makes sense as adding any health on top of the heal would only be adding to overhealing.

## Leech
Calculating this is different depending on if the player does or does not already have any Leech. If the player does have Leech we calculate this pretty much the same as int: for every Leech heal the increase in power from one leech is simply `1 / totalLeechRating`. If the player does not already have Leech, we predict that 1 Leech rating would have done full healing so long as the player has health missing.

## Special cases

Leech, Velens, Aura of Sacrifice, Obsidian Stone Spaulders and Lay on Hands healing is disregarded for the purpose of the main stat's values, as they scale with whatever procced them. It's easiest to just not count them.

If a heal is not in the database of heals, it's assumed to scale only with Versatility. This is generally a good assumption, and this is how most trinket heals behave.
