## Features
| Feature | Note | Accuracy |
| --- | --- | --- |
| [Mastery Effectiveness](https://github.com/WoWAnalyzer/WoWAnalyzer/blob/master/src/Parser/RestorationShaman/Modules/Features/MasteryEffectiveness.js) | Tracks how much you benefited from your mastery on average. | 100% |
| [Always Be Casting](https://github.com/WoWAnalyzer/WoWAnalyzer/blob/master/src/Parser/RestorationShaman/Modules/Features/MasteryEffectiveness.js) | Tracks your casting and healing time to determine your non healing and dead GCD time. May get slightly inaccurate with unaccounted for Haste buffs. | 80%-100% |
| [EarthenShieldTotem](https://github.com/WoWAnalyzer/WoWAnalyzer/blob/master/src/Parser/RestorationShaman/Modules/Features/EarthenShieldTotem.js) | Tracks how much damage your Earthen Shield Totems absorbed as a percentage of their maximum potential absorb. . | 100% |
| [Feeding](https://github.com/WoWAnalyzer/WoWAnalyzer/blob/master/src/Parser/RestorationShaman/Modules/Features/CooldownTracker.js) | Provides a breakdown of the spells feeding into CBT, AG and Ascenance.  | 90% |
| [Focuser of Jonat, the Elder](https://github.com/WoWAnalyzer/WoWAnalyzer/blob/master/src/Parser/RestorationShaman/Modules/Legendaries/Jonat.js) | Tracks how much extra healing your chain heals did because of Jonat stacks. Does not account for CBT/AG/Asc | 70%-90% |
| [Intact Nazjatar Molting](https://github.com/WoWAnalyzer/WoWAnalyzer/blob/master/src/Parser/RestorationShaman/Modules/Legendaries/Nazjatar.js) | Tracks how much extra charges you've gained. | 100% |
| [Nobundo's Redemption](https://github.com/WoWAnalyzer/WoWAnalyzer/blob/master/src/Parser/RestorationShaman/Modules/Legendaries/Nobundo.js) | Tracks how much discounted Healing Surges you casted. | 100% |
| [Praetorian's Tidecallers](https://github.com/WoWAnalyzer/WoWAnalyzer/blob/master/src/Parser/RestorationShaman/Modules/Legendaries/Tidecallers.js) | Tracks the healing from both Healing Stream Totem and Healing Tide Totem. | 100% |
| [Uncertain Reminder](https://github.com/WoWAnalyzer/WoWAnalyzer/blob/master/src/Parser/RestorationShaman/Modules/Legendaries/UncertainReminder.js) | Tracks the increased healing from the Sense of Urgency trait and the additional haste. This is done by using the 30% (or 25%) haste as a modifier over spammable spells (HW,HS,CH) or spells which' frequency increases linearly with haste (HST, HR). HTT is also included (underestimation because of Cumulative Upkeep), and so are CBT,AG and Ascendance (slight overestimation, since GotW will probably feed into them but you won't get more casts from the haste). | 80% - 90% |
| [Roots of Shaladrassil](https://github.com/WoWAnalyzer/WoWAnalyzer/blob/master/src/Parser/RestorationShaman/Modules/Legendaries/Roots.js) | Tracks how much healing Roots of Shaladrassil provided, including CBT,AG and Ascendance. The interactions between CBT, AG and Ascendance aren't fully implemented yet. | 95% |
| [Drape of Shame](https://github.com/WoWAnalyzer/WoWAnalyzer/blob/master/src/Parser/RestorationShaman/Modules/Legendaries/DrapeOfShame.js) | Tracks how much percent of your healing the increased crit healing contributed. | 100% |
| [Prydaz, Xavaric's Magnum Opus](https://github.com/WoWAnalyzer/WoWAnalyzer/blob/master/src/Parser/RestorationShaman/Modules/Legendaries/Prdyaz.js) | Tracks how much the absorb from Prydaz healed. | 100% |
| [Velen's Future Sight](https://github.com/WoWAnalyzer/WoWAnalyzer/blob/master/src/Parser/RestorationShaman/Modules/Legendaries/Velens.js) | Tracks both the overhealing redistribution and the 15% healing increase. | 100% |


The accuracy percentages assume there are no bugs in the implementation, the accuracy of all features was verified extensively. 

## Suggestions

This may be outdated.

| Suggestion | Minor | Average | Major |
| --- | --- | --- | --- |
| Non healing time | >30% | >40% | >45% |
| Dead GCD time | >20% | >35% | >40% |
| Velen's Healing | <4.5% | <4% | <3% |
| Unbuffed Healing Surge (% of all HW/HS) | >0% | >15% | >30% |
| Chain Heal Target Efficiency | <97% | <94% | <88% |
| GotQ Target Efficiency | <95% | <90% | <80% |
| Earthen Shield Totem Efficiency | <75% | <60% | <45% |
| Unused Tidal Waves Rate | >15% | >30% | >50% |
| Uncertain Reminder | <4.5% | <3.5% | <2.5% |
| GotQ CBT feeding | <85% | <65% | <45% |
| Cast Efficiency (see spells) | <80% | <75% | <65% |
| Riptide (EotE) Cast Efficiency | <90% | <85% | <75% |
| Riptide Cast Efficiency | <75% | <70% | <60% |
| Astral Shift (Minor) Cast Efficiency | <60% | <55% | <45% |
| Healing Rain (Minor) Cast Efficiency | <60% | <55% | <45% |
| Gift of the Queen Cast Efficiency | <70% | <65% | <55% |
| Spirit Link Totem Cast Efficiency | <70% | <65% | <55% |
