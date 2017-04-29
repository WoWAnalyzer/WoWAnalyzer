# Holy Paladin Analyzer

Use this tool to analyze your performance as a Holy Paladin based on important metrics for the spec.

You will need a Warcraft Logs report with advanced combat logging enabled to start. Private logs can not be used, if your guild has private logs you will have to [upload your own logs](https://www.warcraftlogs.com/help/start/) or change the existing logs to the unlisted privacy option instead.

Run it: [https://martijnhols.github.io/HolyPaladinAnalyzer/build/index.html](https://martijnhols.github.io/HolyPaladinAnalyzer/build/index.html)

Feature requests (and bug reports provided that you're not using one of Microsoft's browsers) are welcome! *@Zerotorescue* on [Discord](https://discordapp.com/invite/hammerofwrath) or create an issue [here](https://github.com/MartijnHols/HolyPaladinAnalyzer/issues).

## Features
| Feature | Note | Accuracy |
| --- | --- | --- |
| [Mastery Effectiveness](https://github.com/MartijnHols/HolyPaladinAnalyzer/blob/master/src/Main/Parser/Modules/Features/MasteryEffectiveness.js) | Tracks your distance to other players and the healing done to determine the effectiveness of your healing weighted by the amount of healing done. | >90% |
| [Always Be Casting](https://github.com/MartijnHols/HolyPaladinAnalyzer/blob/master/src/Main/Parser/Modules/Features/AlwaysBeCasting.js) | Tracks your casting and healing time to determine your non healing and dead GCD time. May get slightly inaccurate with unaccounted for Haste buffs. | 80%-100% |
| [Beacon Targets](https://github.com/MartijnHols/HolyPaladinAnalyzer/blob/master/src/Main/Parser/Modules/PaladinCore/BeaconTargets.js) | Used by other features: tracks who have beacons active for all beacon types. | 100% |
| [Ability Tracker](https://github.com/MartijnHols/HolyPaladinAnalyzer/blob/master/src/Main/Parser/Modules/Core/AbilityTracker.js) | Tracks ability casts and healing done (damage tracking NYI)w. | 100% |
| [Paladin Ability Tracker](https://github.com/MartijnHols/HolyPaladinAnalyzer/blob/master/src/Main/Parser/Modules/PaladinCore/PaladinAbilityTracker.js) | Tracks healing done on beacons and with IoL. | 100% |
| [Cast Efficiency](https://github.com/MartijnHols/HolyPaladinAnalyzer/blob/master/src/Main/CastEfficiency.js) | Displays the amount of casts and estimates the max amount of casts possible to determine your skill at keeping important spells (close to) on cooldown. The estimated max amount of casts is slightly inaccurate due to not considering Haste increasers like Holy Avenger, Bloodlust and from boss abilities. | >90% |
| [Chain of Thrayn](https://github.com/MartijnHols/HolyPaladinAnalyzer/blob/master/src/Main/Parser/Modules/Legendaries/ChainOfThrayn.js) |  | 100% |
| [Drape of Shame](https://github.com/MartijnHols/HolyPaladinAnalyzer/blob/master/src/Main/Parser/Modules/Legendaries/DrapeOfShame.js) |  | 100% |
| [Ilterendi, Crown Jewel of Silvermoon](https://github.com/MartijnHols/HolyPaladinAnalyzer/blob/master/src/Main/Parser/Modules/Legendaries/Ilterendi.js) |  | 100% |
| [Maraad's Dying Breath](https://github.com/MartijnHols/HolyPaladinAnalyzer/blob/master/src/Main/Parser/Modules/Legendaries/MaraadsDyingBreath.js) | The healing gain is calculated by comparing boosted LotMs with unbuffed LotMs. Since most people wouldn't ever cast unbuffed LotMs as fillers but a FoL/HL instead, this can be somewhat inaccurate. | ~70% |
| [Obsidian Stone Spaulders](https://github.com/MartijnHols/HolyPaladinAnalyzer/blob/master/src/Main/Parser/Modules/Legendaries/ObsidianStoneSpaulders.js) | | 100% |
| [Prydaz, Xavaric's Magnum Opus](https://github.com/MartijnHols/HolyPaladinAnalyzer/blob/master/src/Main/Parser/Modules/Legendaries/Prydaz.js) | | 100% |
| [Velen's Future Sight](https://github.com/MartijnHols/HolyPaladinAnalyzer/blob/master/src/Main/Parser/Modules/Legendaries/Velens.js) | | 100% |
| [Sacred Dawn](https://github.com/MartijnHols/HolyPaladinAnalyzer/blob/master/src/Main/Parser/Modules/Features/SacredDawn.js) | | 100% |
| [Tyr's Deliverance](https://github.com/MartijnHols/HolyPaladinAnalyzer/blob/master/src/Main/Parser/Modules/Features/TyrsDeliverance.js) | Includes the healing gained from casting a FoL/HL on a target affected with the buff. | 100% |

The accuracy percentages assume there are no bugs in the implementation, the accuracy of all features was verified extensively. All interactions with Aura of Sacrifice are ignored.

## Further ideas

 * Show WCL performance ranking & HPS on the report
 * Only load optional modules when the required item is equipped.

## License

You are free to use pieces of this project for your own open source non-commercial projects. Other uses will be assessed on a case-by-case basis.

Usage of any API keys found in the source is not allowed. You must at all times use your own API keys.
