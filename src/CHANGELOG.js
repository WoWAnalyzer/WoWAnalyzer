export default `
16-05-2017 - Added Sephuz's Secret uptime indicator.
16-05-2017 - Disabled Retribution Paladin spec since it never really came out of the experimental phase.
16-05-2017 - Holy Paladin: Added Darkmoon Deck: Promises statistic. Disc Priest: Added Darkmoon Deck: Promises statistic. Added Light's Wrath to cast efficiency. Changed Pain Suppression cooldown to take into account the Pain is in your Mind trait.
16-05-2017 - Disc Priest: Added N'ero, Band of Promises statistic.
15-05-2017 - Disc Priest: Added Xalan the Feared's Clench statistic.
15-05-2017 - Disc Priest: Skjoldr, Sanctuary of Ivagont statistic now includes the healing gained via Share in the Light.
14-05-2017 - Disc Priest: Added Skjoldr, Sanctuary of Ivagont statistic. This does not yet include the healing gained via Share in the Light.
14-05-2017 - Disc Priest: Added Cord of Maiev, Priestess of the Moon statistic.
14-05-2017 - Added Disc Priest 2 set bonus statistic.
14-05-2017 - Disc Priest: Renamed <i>Missed penance hits</i> to <i>Wasted Penance bolts</i>. <i>Wasted Penance bolts</i> now accounts for (combat log) latency. Fixed Glyph of the Sha's Shadowfiend not being counted towards Shadowfiend casts. Fixed healing increases (most notably the 15% from Velen's) not working with Disc priest spells.
14-05-2017 - Added Discipline Priest spec. Currently includes basic statistics for Dead GCD time (should be fully operational), shared legendaries, missed Penance hits, cast efficiencies and the other build in tools.
13-05-2017 - Added full multispec support! The right spec specific parser is now selected based on the spec of the selected person. Only players with supported specs will be displayed in the player selection.
11-05-2017 - Fixed a bunch of bugs. The Always Be Casting/Healing module now supports debuffs which allows me to implement boss Haste buffs to make it more accurate. Elisande's Haste buffs are now implemented.
11-05-2017 - <b>A lot</b> more changes under the hood in order to make the analyzer multi-spec compatible. Almost everything was changed, so anything might have gotten broken. Please let me know.
08-05-2017 - Oops one of the lines got mixed up. Fixed Holy Light instead of Flash of Light being suggested to improve Infusion of Light proc usage. Casting Holy Light during IoL is worse, m'kay.
07-05-2017 - Untangled many lines - you shouldn't notice a difference.
05-05-2017 - Added Aura of Mercy and Sacrifice healing done statistic.
05-05-2017 - Changed the report selection interface.
04-05-2017 - Minor importance suggestions are now hidden behind a toggle by default.
01-05-2017 - Added overhealing suggestions and relaxed the non healing time / dead GCD time suggestions (they should be marked as <i>minor</i> issues more often).
27-04-2017 - Prevent caching of fights list so it updates with live logs. You can now directly link specific tabs on the results page.
23-04-2017 - Changed the LotM suggestion to be based on CPM and be much more forgiving. Added death indicators to the mana graph.
21-04-2017 - Added HPS numbers to item healing done. Damaging HS are now included in cast counts. Recommended cast efficiency of CS with CM reduced to 30%. The recommended unused IoL is now adjusted based on if you have CM, DP and/or 4PT19.
21-04-2017 - Added suggestion/issue importance indicators and show a positive message when there are no major issues.
20-04-2017 - Since Easter is over bosses will no longer resurrect in the mana graph<dfn data-tip="This may cause issues with bosses that do actually resurrect, but I will fix that once I encounter such a boss.">*</dfn>. All bosses in a fight get shown instead of just the first<dfn data-tip="If boss adds are classified as bosses they will be shown as well. So far this doesn't appear to happen, but I will fix it if I encounter this.">*</dfn>. This should make the boss health for Mythic Botanist work properly.
19-04-2017 - Added a Mana tab for analyzing your mana usage. This also shows boss health since it is often used as a target for mana levels.
18-04-2017 - Added Velen's Future Sight to cast efficiency. Fixed the parser crashing instead of showing a descriptive error when selected player doesn't appear in a log. Fixed a crash when buff with stacks expired without ever applying.
17-04-2017 - Added LotM suggestion when casting it too often, added Divine Protection and BoS to cast efficiency display. Added Divine Purpose proc indicator.
15-04-2017 - Added Tyr's Deliverance healing contribution.
15-04-2017 - Added Sacred Dawn healing contribution. Note that (when SD wasn't up before) Sacred Dawn increases the Light of Dawn healing on yourself on the initial cast, but other players get healed for the normal amount without the SD healing increase. The calculation is aware of this.
15-04-2017 - Cast efficiency now takes the extra amount of fight time you had to cast an ability into consideration (e.g. a single cast of 3 minute cooldown during a 3:30 fight will have a higher cast efficiency than during a 5:30 fight).
15-04-2017 - Added a <b>Talents</b> tab.
14-04-2017 - Added <b>Suggestions</b> which will give you (way too many) suggestions to improve. This may need to be tuned a bit; any feedback in that regard is welcome. Moved <i>Cast efficiency</i> and <i>Mastery effectiveness player breakdown</i> to separate tabs.
11-04-2017 - Added Rule of Law to cast efficiency and grouped spells by category.
10-04-2017 - Show an error when parsing crashes (usually caused by not having advanced combat logging on). Renamed Casts Per Minute to Cast Efficiency. Show absolute amount of casts in Cast Efficiency. Added Arcane Torrent to Cast Efficiency (only shown if you cast it at least once).
09-04-2017 - Added <i>Casts Per Minute</i> table with very basic recommendations.
08-04-2017 - Added <i>Heals on beacon</i> statistic.
08-04-2017 - Added Wowhead tooltips and show T19 4 set bonus gain.
08-04-2017 - Added Beacon of the Lightbringer mastery radius support!
08-04-2017 - Improve beacon healing tracking accuracy and it now works properly with Beacon of Virtue.
08-04-2017 - Total healing done count now includes absorbed healing.
07-04-2017 - New layout with many usability improvements!
04-04-2017 - Add an Always Be Casting (ABC) module that checks your <i>Non healing time</i> and dead GCD time (this is shown in the tooltip).
29-03-2017 - Fixed a bug where Maraad's healing statistic would show 0% healing after getting only 1 Maraad's charge.
29-03-2017 - Update healing bonuses to the 7.2 values (DoS & Ilterendi nerfs).
27-03-2017 - Added Maraad's Dying Breath healing statistic.
27-03-2017 - Added Prydaz and Obsidian Stone Spaulders healing statistic.
26-03-2017 - Added Chain of Thrayn healing statistic.
26-03-2017 - Completely refactor the core, rename to Holy Paladin Analyzer.
25-03-2017 - Added cast ratios statistic.
`;
