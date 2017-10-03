export default `
27-09-2017 - Fix relic traits Deliver the Light, Expel the Darkness and Justice through Sacrifice calculations to take into account that the traits are additive with each other. (by Zerotorescue)
27-09-2017 - Wasted IoL procs now includes Infusion of Lights gained from damaging Holy Shocks so it should only be below 0% when you had a pre-combat IoL. (by Zerotorescue)
23-09-2017 - Show cast behavior as doughnut charts to create more visual variety. (by Zerotorescue)
07-09-2017 - Fix the cooldown of Light of Dawn in cast efficiency to take the tier 20 2 set into account. (by Zerotorescue)
31-08-2017 - When going (near) OOM during a fight and the <i>IoL FoL to HL cast ratio</i> is low, emphasize that FoL is the more mana efficient spell during IoL. (by Zerotorescue)
31-08-2017 - Added Justice through Sacrifice trait healing contribution display. (by Zerotorescue)
29-08-2017 - Fixed a bug where the direct beacon healing also included casts of abilities such as Blessing of Sacrifice and Deceiver's Grand Design. (by Zerotorescue)
28-08-2017 - Fixed a bug where beaconing yourself wasn't being detected properly. (by Zerotorescue)
27-08-2017 - Added Tyr's Munificence trait healing contribution to complete the list. (by Zerotorescue)
27-08-2017 - Combined relic traits into one box to clean up the layout. (by Zerotorescue)
26-08-2017 - Added Second Sunrise trait healing contribution display (please read its tooltip). (by Zerotorescue)
26-08-2017 - Added Expel the Darkness trait healing contribution display. (by Zerotorescue)
26-08-2017 - Added Deliver the Light trait healing contribution display. (by Zerotorescue)
26-08-2017 - Added Shock Treatment healing contribution display. This only calculates the value of the last Shock Treatment point, for you with your gear and only during this fight. The value of an additional point would be lower due to the likely increase in overhealing (although small). (by Zerotorescue)
26-08-2017 - Fixed Drape of Shame interaction with the tier 21 4 piece set bonus. (by Zerotorescue)
23-08-2017 - Added Beacon of Virtue to cast efficiency and a suggestion. (by Zerotorescue)
14-08-2017 - Reworded Maraad's Dying Breath display to be less confusing and moved the total display to the tooltip since it was being used wrong. (by Zerotorescue)
12-08-2017 - Changed Crusader Strike cast efficiency suggestion (by Zerotorescue)
09-08-2017 - fully migrated to the new suggestions layout. Changed wording on several suggestions to make them clearer, and increased the <i>LotM is inefficient</i> suggestion breakpoints to 1.5/2/3 CPM (up from 1.0/1.5/2.0) (by Zerotorescue)
02-08-2017 - Added tier 21 2 set bonus (experimental, please send logs). (by Zerotorescue)
02-08-2017 - Added tier 21 4 set bonus (experimental, please send logs). (by Zerotorescue)
02-08-2017 - fixed talent description for Aura of Sacrifice stating Light of Dawn doesn't work (it was fixed). Thanks to @Moonmoon for pointing this out. (by Zerotorescue)
19-07-2017 - Changed Devotion Aura's passive estimated DRPS to be based on the paladin's damage taken instead of raid average. This should be more accurate as it doesn't include tank damage taken. (by Zerotorescue)
01-07-2017 - Added Devotion Aura estimated damage reduced statistic. This statistic requires you to click it to be calculated to minimize the used resources. (by Zerotorescue)
17-06-2017 - Add Soul of the Highlord legendary. (by Zerotorescue)
08-06-2017 - Improve Maraad's healing display; show default an esimation of its value given a Flash of Light as opportunity cost (this should make it easy to compare with other legendaries), in tooltip show gain over casting a filler LotM (may be relevant if the cast time reduction is important to you), and show the total healing done with LotM during the Maraad's buff. (by Zerotorescue)
08-06-2017 - Added Holy Avenger estimated healing statistic. (by Zerotorescue)
07-06-2017 - Added Tier 19 4 set healing statistic. (by Zerotorescue)
27-05-2017 - Added Tier 20 4 set bonus statistic. Reworked how spells and their beacon transfer are matched to be much more reliable. (by Zerotorescue)
21-05-2017 - Show overhealing during cooldowns too. Innervates properly shows mana costs.
16-05-2017 - Added Darkmoon Deck: Promises statistic. Disc Priest: Added Darkmoon Deck: Promises statistic. Added Light's Wrath to cast efficiency. Changed Pain Suppression cooldown to take into account the Pain is in your Mind trait.
08-05-2017 - Oops one of the lines got mixed up. Fixed Holy Light instead of Flash of Light being suggested to improve Infusion of Light proc usage. Casting Holy Light during IoL is worse, m'kay.
26-03-2017 - Completely refactor the core, rename to Holy Paladin Analyzer.
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
25-03-2017 - Added cast ratios statistic.
`;
