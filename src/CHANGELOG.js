export default `
24-08-2017 - Better error handling when the WCL API is sending weird responses. (by Zerotorescue)
24-08-2017 - Slightly improve layouts for both desktop and mobile. (by Zerotorescue)
24-08-2017 - Changelogs are now seperated by a select box. (by Blazyb)
24-08-2017 - Added a mana usage graph to the mana tab for all healers. (by Zerotorescue)
20-08-2017 - The background image will now be a screenshot of the boss currently analyzing when available. (by Zerotorescue)
14-08-2017 - Major under the hood changes, you might see some things move around but no data should be lost or changed. (by Zerotorescue)
09-08-2017 - Healers with a <i>non-healing time</i> statistic will no longer have their <i>dead GCD time</i> suggestion marked as major importance. (by Zerotorescue)
09-08-2017 - Changed suggestions tab layout to be less cluttered, specs may need additional work to be fully migrated (by Zerotorescue)
03-08-2017 - Fix a bug that caused DRPS displays to not always work properly. (by Zerotorescue)
02-08-2017 - When there's a new version available ask the user if he wants to refresh. (by Zerotorescue)
02-08-2017 - Gnawed Thumb Ring should now show DPS values when applicable. (by Gurupitka)
01-08-2017 - Enabled aggressive caching to the app which should allow offline usage as well as improve consecutive load times. (by Zerotorescue)
31-07-2017 - Added Vantus Rune gain display. (by Zerotorescue)
22-07-2017 - Shit browsers will now be told they're shit and redirected to a Google Chrome download page instead of just crashing. (by Zerotorescue)
22-07-2017 - URLs will now show the fight name to make it easier to compare URLs. (by Zerotorescue)
21-07-2017 - Changed fight selection styling and fixed back buttons. (by Zerotorescue)
20-07-2017 - Added fight progress indicator to the fight selection page. (by Yuyz0112)
06-07-2017 - The <i>report code</i> input field now accepts WCL urls and entering what looks to be valid input will now automatically start loading the report. (by Zerotorescue)
04-07-2017 - All healing specs: Added low health healing tab to give more insight into how often you're saving people's lives. (by Zerotorescue)
01-07-2017 - Added a few new tools for developers to use; <code>ModuleComponent</code> to more cleanly add statistic modules (see <code>DevotionAura</code> for an example), and <code>LazyLoadStatisticBox</code> for statistics that require additional API calls. (by Zerotorescue)
24-06-2017 - Fixed an issue with some items not showing up properly (by Zerotorescue)
23-06-2017 - Change home page layout (by Zerotorescue)
20-06-2017 - Added prepot/second pot suggestions (by Blazyb)
18-06-2017 - Added Archive of Faith, Barbaric Mindslaver, The Deceiver's Grand Design and Sea Star of the Depthmother to all specs, trinket implementations by anomoly. (by Zerotorescue)
17-06-2017 - Improved the Cooldown tab healing done display. (by Zerotorescue)
15-06-2017 - Updated Darkmoon Deck: Promises mana reduction values to scale with item level. (by Zerotorescue)
15-06-2017 - Generic: Tier 20 Healing Trinket Implementation (by anomoly)
06-06-2017 - Added refresh button to fights list.
29-05-2017 - Fixed a crash when trying to parse a corrupt combatlog. (by versaya)
28-05-2017 - Added overhealing percentages to the Cast Efficiency tab.
25-05-2017 - Added Patreon links to the specs I (Zerotorescue) maintain. Please let me know if you think this is inappropriate or makes you hesitate to contribute. Added Discord link.
21-05-2017 - An informative message is now shown when trying to parse a report without combatants (usually due to not having advanced combat logging enabled).
21-05-2017 - Fixed a rare crash when auto attacking something.
20-05-2017 - Added Cooldowns tab to show casts and healing when affected by a cooldown. Added Amalgam's Seventh Spine mana gained statistic. Promises no longer includes mana reduction during Innervate.
17-05-2017 - Added Sephuz's Secret uptime indicator.
16-05-2017 - Disabled Retribution Paladin spec since it never really came out of the experimental phase.
13-05-2017 - Added full multispec support! The right spec specific parser is now selected based on the spec of the selected person. Only players with supported specs will be displayed in the player selection.
11-05-2017 - Fixed a bunch of bugs. The Always Be Casting/Healing module now supports debuffs which allows me to implement boss Haste buffs to make it more accurate. Elisande's Haste buffs are now implemented.
11-05-2017 - <b>A lot</b> more changes under the hood in order to make the analyzer multi-spec compatible. Almost everything was changed, so anything might have gotten broken. Please let me know.
07-05-2017 - Untangled many lines - you shouldn't notice a difference.
`;
