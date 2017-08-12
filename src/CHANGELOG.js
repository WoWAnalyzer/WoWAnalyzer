export default `
12-08-2017 - Guardian Druid: Added damage type into the tooltip of damage taken, added logic for Pulverize and minor fixes. (by wopr)
09-08-2017 - Mistweaver Monk: Bug Fix for Dancing Mist calculation and Ending Mana. (by anomoly)
09-08-2017 - Healers with a <i>non-healing time</i> statistic will no longer have their <i>dead GCD time</i> suggestion marked as major importance. (by Zerotorescue)
09-08-2017 - Holy Paladin: fully migrated to the new suggestions layout. Changed wording on several suggestions to make them clearer, and increased the <i>LotM is inefficient</i> suggestion breakpoints to 1.5/2/3 CPM (up from 1.0/1.5/2.0) (by Zerotorescue)
09-08-2017 - Changed suggestions tab layout to be less cluttered, specs may need additional work to be fully migrated (by Zerotorescue)
05-08-2017 - Mistweaver Monk: Added Player Log tab to support new Mistweaver spreadsheet needs. (by anomoly)
03-08-2017 - Fix a bug that caused DRPS displays to not always work properly. (by Zerotorescue)
02-08-2017 - When there's a new version available ask the user if he wants to refresh. (by Zerotorescue)
02-08-2017 - Holy Paladin: Added tier 21 2 set bonus (experimental, please send logs). (by Zerotorescue)
02-08-2017 - Holy Paladin: Added tier 21 4 set bonus (experimental, please send logs). (by Zerotorescue)
02-08-2017 - Holy Paladin: fixed talent description for Aura of Sacrifice stating Light of Dawn doesn't work (it was fixed). Thanks to @Moonmoon for pointing this out. (by Zerotorescue)
02-08-2017 - Gnawed Thumb Ring should now show DPS values when applicable. (by Gurupitka)
01-08-2017 - Mistweaver Monk: Bug Fix for Thunder Focus Tea casts calulating incorrectly when specific cast sequence was used (by anomoly)
01-08-2017 - Enabled aggressive caching to the app which should allow offline usage as well as improve consecutive load times. (by Zerotorescue)
31-07-2017 - Added Vantus Rune gain display. (by Zerotorescue)
30-07-2017 - Mistweaver Monk: Added Refreshing Jade Wind suggestion and updated some talent descriptions (by anomoly)
22-07-2017 - Added basic Windwalker Monk support. (by AttilioLH)
22-07-2017 - Holy Priest: Added Holy Word: Sanctify efficiency metric and fixed an issue with Prayer of Mending cast efficiency (by enragednuke)
22-07-2017 - Shit browsers will now be told they're shit and redirected to a Google Chrome download page instead of just crashing. (by Zerotorescue)
22-07-2017 - URLs will now show the fight name to make it easier to compare URLs. (by Zerotorescue)
22-07-2017 - Disc Priest: Added mana saved from the legendary Inner Hallation. (by hassebewlen)
21-07-2017 - Changed fight selection styling and fixed back buttons. (by Zerotorescue)
20-07-2017 - Added fight progress indicator to the fight selection page. (by Yuyz0112)
19-07-2017 - Holy Paladin: Changed Devotion Aura's passive estimated DRPS to be based on the paladin's damage taken instead of raid average. This should be more accurate as it doesn't include tank damage taken. (by Zerotorescue)
08-07-2017 - Mistweaver Monk: Added Ovyd's Winter Wrap healing contribution. (by anomoly)
06-07-2017 - Resto Druid: Added mana costs for spells, the cooldown tab should now properly calculate mana costs
06-07-2017 - The <i>report code</i> input field now accepts WCL urls and entering what looks to be valid input will now automatically start loading the report. (by Zerotorescue)
06-07-2017 - Resto Druid: Fixed a bug on 4PT20 calculations. Also added swiftmend to cast efficiency tab. (by Blazyb)
05-07-2017 - Holy Priest: Added Enduring Renewal, Light of Tuure (incl. buff) and fixed a bug that greatly overvalued Divinity (by enragednuke)
04-07-2017 - All healing specs: Added low health healing tab to give more insight into how often you're saving people's lives. (by Zerotorescue)
04-07-2017 - Holy Priest: Added Divinity talent. (by Skamer)
03-07-2017 - Mistweaver Monk: Added Petrichor Lagniappe wasted reduction time in seconds (by anomoly)
02-07-2017 - Holy Priest: Apotheosis now correctly reduces the mana cost of Holy Word spells. Added Symbol of Hope talent. (by Skamer)
01-07-2017 - Holy Paladin: Added Devotion Aura estimated damage reduced statistic. This statistic requires you to click it to be calculated to minimize the used resources. (by Zerotorescue)
01-07-2017 - Added a few new tools for developers to use; <code>ModuleComponent</code> to more cleanly add statistic modules (see <code>DevotionAura</code> for an example), and <code>LazyLoadStatisticBox</code> for statistics that require additional API calls. (by Zerotorescue)
01-07-2016 - Added <span class="Priest">Holy Priest</span> support by <b>@enragednuke</b>.
26-06-2017 - Mistweaver Monk: Added Shelter of Rin and Doorway To Nowhere, fixed Ei'thas, Lunar Glides of Eramas healing contribution formula. (by anomoly)
26-06-2017 - Resto Shaman: Fix a bug that would prevent the Feeding tab from loading. (by Versaya)
24-06-2017 - Fixed an issue with some items not showing up properly (by Zerotorescue)
23-06-2017 - Change home page layout (by Zerotorescue)
23-06-2017 - Resto Druid: Added Essence of G'hanir (by Blazyb)
20-06-2017 - Added prepot/second pot suggestions (by Blazyb)
20-06-2017 - Mistweaver Monk: Added T20 2pc Tracking, Added support for Focused Thunder, adjusted suggestion for TFT usage. (by anomoly)
20-06-2017 - Resto Druid: Added Gnawed Thumb Ring (by Blazyb)
18-06-2017 - Disc Priest: Added Touch of the Grave statistic. (by Zerotorescue)
18-06-2017 - Mistweaver Monk: Implement Dead Time / Non-Healing Time.  Update Mana Tea data tip to show MP5 (by anomoly)
18-06-2017 - Added Archive of Faith, Barbaric Mindslaver, The Deceiver's Grand Design and Sea Star of the Depthmother to all specs, trinket implementations by anomoly. (by Zerotorescue)
17-06-2017 - Holy Paladin: Add Soul of the Highlord legendary. (by Zerotorescue)
17-06-2017 - Disc Priest: Evangelism casts are now also shown under the cooldowns tab. Rapture now shows the total abosrbs applied and the amount of damage absorbed. Fixed a few issues that caused too much healing to be assigned to Evangelism. (by Zerotorescue)
17-06-2017 - Improved the Cooldown tab healing done display. (by Zerotorescue)
16-06-2017 - Mistweaver Monk: Tier 20 4 Piece Effective Healing contribution implemented. (by anomoly)
16-06-2017 - Resto Druid: Added reduction to promises if you did not utilize the effect fully, i.e not needing the extra mana saved. Honorable mentions to Feidan for providing the formula. (by Blazyb)
15-06-2017 - Disc Priest: Fixed Wasted Penance bolts always assumed user had the Castigation talent. (by Zerotorescue)
15-06-2017 - Disc Priest: Disabled suggestions for Pain Suppression and Power Word: Barrier. (by Zerotorescue)
15-06-2017 - Updated Darkmoon Deck: Promises mana reduction values to scale with item level. (by Zerotorescue)
15-06-2017 - Resto Druid: Adjusted promises to base of ilvl 900 also added throughput calc on promises. (by Blazyb)
15-06-2017 - Mistweaver Monk: Mana Cost adjustments for Patch 7.2.5 (by anomoly)
15-06-2017 - Generic: Tier 20 Healing Trinket Implementation (by anomoly)
11-06-2017 - Disc Priest: Added extra suggestion to Power Word: Shield description to add distinction to casts during Rapture. (by milesoldenburg)
09-06-2017 - Mistweaver Monk: Added Ei'thas, Lunar Glides of Eramas statistic and adjusted Sheilun's Gift issue warning to account for low stacks and high overheal. (by anomoly)
08-06-2017 - Holy Paladin: Improve Maraad's healing display; show default an esimation of its value given a Flash of Light as opportunity cost (this should make it easy to compare with other legendaries), in tooltip show gain over casting a filler LotM (may be relevant if the cast time reduction is important to you), and show the total healing done with LotM during the Maraad's buff. (by Zerotorescue)
08-06-2017 - Holy Paladin: Added Holy Avenger estimated healing statistic. (by Zerotorescue)
07-06-2017 - Resto Shaman: Fix crash when CBT, AG or Ascendance was cast before pull. (by Versaya)
07-06-2017 - Holy Paladin: Added Tier 19 4 set healing statistic. (by Zerotorescue)
06-06-2017 - Added refresh button to fights list.
05-06-2017 - Disc Priest: Fix Atonement duration in cast efficiency not accounting for the Doomsayer trait. (by Zerotorescue)
05-06-2017 - Discipline Priest: Fixed issue where critical atonement healing was not being counted, fixed Nero's Band of Promises being broken. (By Reglitch)
05-06-2017 - Mistweaver Monk: Added utlity CDs to cast efficiency for tracking purposes. (by anomoly)
04-06-2017 - Mistweaver Monk: Added Chi Burst healing tracking and suggestions. (by anomoly)
04-06-2017 - Added basic <span class="Shaman">Elemental Shaman</span> support by <b>@fasib</b>.
02-06-2017 - Mistweaver Monk: Enabled Dancing Mists tracking.  Healing provided by Dancing Mists procs now show in analysis. (by anomoly)
01-06-2017 - Mistweaver Monk: Include healing from Chi-Ji talent into overall healing totals for monk. (by anomoly)
01-06-2017 - Mistweaver Monk: Essence Font Tracking Implemented including tagets hit and HOT buffs utilized.  Readme updates for all modules and cast efficiency targets. (by anomoly)
01-06-2017 - Resto Druid: Updated T20 calculations for the 200%/10seconds change.
30-05-2017 - Mistweaver Monk: Adjusted some of the Dancing Mists logic per review. Added in missed Whispers of Shaohao healing. Tracking Celestial Breath and Mists of Sheilun buffs / procs and the healing associated. Refreshing Jade Wind Healing Implemented. Corrected some negative calculations with Uplifting Trance. Correcting formatting error with SG Stacks. (by anomoly)
30-05-2017 - Resto Druid: Added Dreamwalker calculations. Thanks @greatman
30-05-2017 - Resto Druid: Added SotF + Soul of the Archdruid analyzer.
29-05-2017 - Disc Priest: Show Rapture PW:S casts seperate from regular PW:S casts in Cast Efficiency. (by Zerotorescue)
29-05-2017 - Fixed a crash when trying to parse a corrupt combatlog. (by versaya)
29-05-2017 - Resto Shaman: Added overhealing in Cast Efficiency tab for some resto shaman spells. Fixed Uncertain Reminder in case of pre-lust. Added GotQ target efficiency.	Don't allow CBT healing to feed into CBT.
29-05-2017 - Mistweaver Monk: Added Sheilun's Gift statistic and an overhealing suggestion. With Effusive Mists talent, Effuse casts at 12 stacks are considered wasted. Added simple proc counter for Dancing Mists. (by anomoly)
28-05-2017 - Disc Priest: Added unused Power Word: Shield absorb statistic.
28-05-2017 - Added <span class="Shaman">Restoration Shaman</span> support by <b>@Versaya</b>! Thanks a lot for your contribution!
28-05-2017 - Added overhealing percentages to the Cast Efficiency tab.
27-05-2017 - Mistweaver Monk: Added Thunder Focus Tea spell buff tracking. Added Lifecycles mana saving tracking, added Spirit of the Crane mana return tracking. (by anomoly)
27-05-2017 - Holy Paladin: Added Tier 20 4 set bonus statistic. Reworked how spells and their beacon transfer are matched to be much more reliable. (by Zerotorescue)
26-05-2017 - Mistweaver Monk: Added the remaining MW spells / abilities known as of now. Removed UT Usage issue, as this is going away in 7.2.5. Updated CPM Module to give a better understanding of MW Monk Spells. Incorporated TFT -> Viv usage in UT Proc calculations. All of this was done by <b>@anomoly</b>. Thanks a lot for your contribution!
26-05-2017 - Resto Druid: Added Non healing time and dead GCD.
26-05-2017 - Resto Druid: Added Chameleon Song legendary analyzer. Also added additional information on tree of life tool tip.
25-05-2017 - Resto Druid: Added support for T20.
25-05-2017 - Disc Priest: Added <i>Early Atonement refreshes</i> statistic. Fixed Skjoldr sometimes not working properly. Both contributions were created by <b>@Shadowdrizz</b>. Thanks a lot for your contribution!
25-05-2017 - Added Patreon links to the specs I (Zerotorescue) maintain. Please let me know if you think this is inappropriate or makes you hesitate to contribute. Added Discord link.
25-05-2017 - Resto Druid: Fixed a minor error in DTA calculations with partial overheals.
24-05-2017 - Added <span class="Monk">Mistweaver Monk</span> support by <b>@Anomoly</b>! Thanks a lot for your contribution!
An informative message is now shown when trying to parse a report without combatants (usually due to not having advanced combat logging enabled).
Holy Paladin: Show overhealing during cooldowns too. Innervates properly shows mana costs.
Disc Priest: Fix Shadowfiend showing with the Mindbender talent.
21-05-2017 - Fixed a rare crash when auto attacking something.
21-05-2017 - Added Resto Druid support by <b>@blazyb</b> (see: <a href="https://github.com/buimichael/RestoDruidAnalyzer">https://github.com/buimichael/RestoDruidAnalyzer</a>).
20-05-2017 - Added Cooldowns tab to show casts and healing when affected by a cooldown. Added Amalgam's Seventh Spine mana gained statistic. Promises no longer includes mana reduction during Innervate.
18-05-2017 - Disc Priest: Added Shadow Word: Pain/Purge the Wicked global uptime statistic.
17-05-2017 - Disc Priest: Added Twist of Fate healing statistic (damage gain is in the tooltip).
17-05-2017 - Added Sephuz's Secret uptime indicator.
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
