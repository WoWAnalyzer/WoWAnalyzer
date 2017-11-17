## Features
| Feature | Note | Accuracy |
| --- | --- | --- |
| [Always Be Casting](https://github.com/buimichael/RestoDruidAnalyzer/blob/master/src/Main/Parser/Modules/Features/AlwaysBeCasting.js) | Tracks your casting and healing time to determine your non healing and downtime. May get slightly inaccurate with unaccounted for Haste buffs. | 0% |
| [Ability Tracker](https://github.com/buimichael/RestoDruidAnalyzer/blob/master/src/Main/Parser/Modules/Core/AbilityTracker.js) | Tracks ability casts and healing done (damage tracking NYI). | 100% |
| [Flourish Analyzer](https://github.com/buimichael/RestoDruidAnalyzer/blob/master/src/Main/Parser/Modules/Talents/Flourish.js) | Tracks flourish usage | 100% |
| [Tree of Life throughput calculcation](https://github.com/buimichael/RestoDruidAnalyzer/blob/master/src/Main/Parser/Modules/Features/TreeOfLife.js) | Calculates Tree of Life throughput | 80-90% |
| [Lifebloom uptime](https://github.com/buimichael/RestoDruidAnalyzer/blob/master/src/Main/Parser/Modules/Features/Lifebloom.js) | Get uptime on lifebloom | 100% |
| [Efflorescence uptime](https://github.com/buimichael/RestoDruidAnalyzer/blob/master/src/Main/Parser/Modules/Features/Efflorescence.js) | Get uptime on efflorescence | 90-100% |
| [Regrowth/clearcasting usage](https://github.com/buimichael/RestoDruidAnalyzer/blob/master/src/Main/Parser/Modules/Features/Clearcasting.js) | Tracks clearcasting and regrowth usage. | 90-100% |
| [Abilities](https://github.com/buimichael/RestoDruidAnalyzer/blob/master/src/Main/Abilities.js) | List of abilities used in displaying the amount of casts and estimates the max amount of casts possible to determine your skill at keeping important spells (close to) on cooldown. | 100% |
| [Drape of Shame](https://github.com/buimichael/RestoDruidAnalyzer/blob/master/src/Main/Parser/Modules/Items/DrapeOfShame.js) |  | 100%|
| [Prydaz, Xavaric's Magnum Opus](https://github.com/buimichael/RestoDruidAnalyzer/blob/master/src/Main/Parser/Modules/Items/Prydaz.js) | | 100% |
| [Velen's Future Sight](https://github.com/buimichael/RestoDruidAnalyzer/blob/master/src/Main/Parser/Modules/Items/Velens.js) | | 100% |
| [Dark Titan's Advice](https://github.com/buimichael/RestoDruidAnalyzer/blob/master/src/Main/Parser/Modules/Items/Velens.js) | 100% of random bloom effect and 300% of the non overhealing part of manual bloom| 100% |
| [Ekowraith](https://github.com/buimichael/RestoDruidAnalyzer/blob/master/src/Main/Parser/Modules/Items/Velens.js) | Increased effect from ysera's gift and if specced into guardian affinity the damage reduction is translated into throughput aswell | 80-90% |
| [Essence of Infusion](https://github.com/buimichael/RestoDruidAnalyzer/blob/master/src/Main/Parser/Modules/Items/Velens.js) | | 100% |
| [Sephuz's Secret](https://github.com/buimichael/RestoDruidAnalyzer/blob/master/src/Main/Parser/Modules/Items/Velens.js) | The average haste gain from both status and procc and calculate throughput. This assumes that 1 haste rating = 1 int.| 90% |
| [Tearstone of Elune](https://github.com/buimichael/RestoDruidAnalyzer/blob/master/src/Main/Parser/Modules/Items/Velens.js) | Counts the amounts of free rejuvs gained (and procchance). Calculates throughput by checking the throughput from 1 rejuvenation and multiplying with the amounts of free rejuvenations gained. | 70-90% |
| [X'oni's Caress](https://github.com/buimichael/RestoDruidAnalyzer/blob/master/src/Main/Parser/Modules/Items/Velens.js) | The healing contributed by the iron bark effect. Doesn't take into consideration of the reduced iron bark CD. | 90% |
| [Soul of the Archdruid / Soul of the Forest](https://github.com/buimichael/RestoDruidAnalyzer/blob/master/src/Main/Parser/Modules/Items/Velens.js) | Tracks the abilities consumed by the SotF buff and the healing done from the healing increases. | 70-100% |
| [Dreamwalker](https://github.com/WoWAnalyzer/WoWAnalyzer/tree/master/src/Parser/RestoDruid/Modules/Features/Dreamwalker.js) | Calculates the amount healed by Dreamwalker. | 100% |
The accuracy percentages assume there are no bugs in the implementation, the accuracy as of right now is not yet verified.
## Suggestions

This may be outdated.

| Suggestion | Minor | Average | Major |
| --- | --- | --- | --- |
| Non healing time | >20% | >40% | >45% |
| Downtime | >20% | >35% | >40% |
| Velen's Healing | <4.5% | <4% | <3% |
| Cast Efficiency (see spells*) | <80% | <75% | <65% |
| Lifebloom uptime | <85% | <70% | <50% |
| Efflorescence uptime | <85% | <70% | <50% |
| Tree of Life throughput | <11% | <7% | <4% |
| Unused clearcasting proccs | >10% | >50% | >75% |
| Healing touches | >0 CPM | > 0.5 CPM | > 1 CPM |
| Non-cc Regrowth | >0% | > 25% | >50% |
| WG per Rejuvenation ratio | <20% | <15% | <10% |
| Ironbark | <85% | N/A | N/A |
| Barkskin | <85% | N/A | N/A |
| Wild Growths extended by flourish | <100% | <80% | 60% |
| Cenarion Wards extended by flourish | <100% | N/A | N/A |
| Avergae mana spent during innervate | <220k | <180k | <130k |
| Seconds capped on mana during innervate | N/A | N/A | >0 |

* Spells: Tranquility, Innervate, Essence of G'hanir, Cenarion Ward, Flourish, Tree Of Life, Arcane torrent, Velens,
