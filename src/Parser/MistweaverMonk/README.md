## Features
| Feature | Note | Accuracy |
| --- | --- | --- |
| [Always Be Casting](https://github.com/buimichael/RestoDruidAnalyzer/blob/master/src/Main/Parser/Modules/Features/AlwaysBeCasting.js) | Tracks your casting and healing time to determine your non healing and dead GCD time. May get slightly inaccurate with unaccounted for Haste buffs. | 0% |
| [Ability Tracker](https://github.com/buimichael/RestoDruidAnalyzer/blob/master/src/Main/Parser/Modules/Core/AbilityTracker.js) | Tracks ability casts and healing done (damage tracking NYI). | 100% |
| [Cast Efficiency](https://github.com/buimichael/RestoDruidAnalyzer/blob/master/src/Main/CastEfficiency.js) | Displays the amount of casts and estimates the max amount of casts possible to determine your skill at keeping important spells (close to) on cooldown. The estimated max amount of casts is slightly inaccurate due to not considering Haste increasers like Bloodlust and boss abilities. | >90% |
| [Drape of Shame](https://github.com/buimichael/RestoDruidAnalyzer/blob/master/src/Main/Parser/Modules/Legendaries/DrapeOfShame.js) |  | 100%|
| [Prydaz, Xavaric's Magnum Opus](https://github.com/buimichael/RestoDruidAnalyzer/blob/master/src/Main/Parser/Modules/Legendaries/Prydaz.js) | | 100% |
| [Velen's Future Sight](https://github.com/buimichael/RestoDruidAnalyzer/blob/master/src/Main/Parser/Modules/Legendaries/Velens.js) | | 100% |
| [Sephuz's Secret](https://github.com/buimichael/RestoDruidAnalyzer/blob/master/src/Main/Parser/Modules/Legendaries/Velens.js) | The average haste gain from both status and procc and calculate throughput. This assumes that 1 haste rating = 1 int.| 90% |


The accuracy percentages assume there are no bugs in the implementation, the accuracy as of right now is not yet verified.
## Suggestions

This may be outdated.

| Suggestion | Minor | Average | Major |
| --- | --- | --- | --- |
| Non healing time | >20% | >40% | >45% |
| Dead GCD time | >20% | >35% | >40% |
| Velen's Healing | <4.5% | <4% | <3% |
| Cast Efficiency (see spells*) | <80% | <75% | <65% |

| Avergae mana spent during innervate | <220k | <180k | <130k |
| Seconds capped on mana during innervate | N/A | N/A | >0 |
