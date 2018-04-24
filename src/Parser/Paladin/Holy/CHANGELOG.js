import React from 'react';

import { sref, Zerotorescue, blazyb } from 'CONTRIBUTORS';
import ItemLink from 'common/ItemLink';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default [
  {
    date: new Date('2018-04-15'),
    changes: <React.Fragment>Updated everything for Battle for Azeroth compatibility.</React.Fragment>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-04-14'),
    changes: <React.Fragment>Changed the analysis of <SpellLink id={SPELLS.DEVOTION_AURA_TALENT.id} /> to use a method that will continue to work in Battle for Azeroth.</React.Fragment>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-03-12'),
    changes: <React.Fragment>Inefficient <SpellLink id={SPELLS.FLASH_OF_LIGHT.id} /> casts will now be highlighted in the timeline with a red border.</React.Fragment>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-03-12'),
    changes: <React.Fragment>Fixed a bug where chained <SpellLink id={SPELLS.FLASH_OF_LIGHT.id} /> casts might incorrectly mark the second <SpellLink id={SPELLS.FLASH_OF_LIGHT.id} /> as being affected by <SpellLink id={SPELLS.INFUSION_OF_LIGHT.id} /> instead of being marked as inefficient.</React.Fragment>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-02-23'),
    changes: <React.Fragment>Fixed beacon healing tracking for precasted <SpellLink id={SPELLS.FLASH_OF_LIGHT.id} /> into <SpellLink id={SPELLS.BEACON_OF_VIRTUE_TALENT.id} />.</React.Fragment>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-02-09'),
    changes: <React.Fragment>Fixed an issue where sometimes <SpellLink id={SPELLS.SECOND_SUNRISE.id} /> would not be detected properly, throwing off the average players hit per <SpellLink id={SPELLS.LIGHT_OF_DAWN_CAST.id} /> and some other things. This likely only might have occured if the logger had a poor internet connection.</React.Fragment>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-02-01'),
    changes: <React.Fragment>Added <i>total filler <SpellLink id={SPELLS.FLASH_OF_LIGHT.id} /> casts while <SpellLink id={SPELLS.HOLY_SHOCK_CAST.id} /> was available</i> suggestion, and changed the filler <SpellLink id={SPELLS.LIGHT_OF_THE_MARTYR.id} /> check to also include a 200ms buffer time.</React.Fragment>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-01-12'),
    changes: 'Fixed Garothi Feedback Conduit average Haste calculations.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-01-11'),
    changes: 'Fixed a bug where beacon tracking sometimes failed when doing a fight with multiple Holy Paladins.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-01-11'),
    changes: <React.Fragment>Changed the <SpellLink id={SPELLS.AURA_OF_SACRIFICE_TALENT.id} /> suggestion thresholds to 80k minor/60k average/40k major importance (up from 60k minor/50k average/40k major) to more closely match the <SpellLink id={SPELLS.AURA_OF_MERCY_TALENT.id} /> average.</React.Fragment>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-12-31'),
    changes: <React.Fragment><ItemLink id={ITEMS.DRAPE_OF_SHAME.id} /> now shows an estimated item level.</React.Fragment>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-12-30'),
    changes: <React.Fragment>Added a suggestion to consider using <SpellLink id={SPELLS.JUDGMENT_OF_LIGHT_HEAL.id} /> when not using it.</React.Fragment>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-12-24'),
    changes: <React.Fragment>Fixed a crash when using <ItemLink id={ITEMS.ILTERENDI_CROWN_JEWEL_OF_SILVERMOON.id} /> without <SpellLink id={SPELLS.JUDGMENT_OF_LIGHT_HEAL.id} />.</React.Fragment>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-12-24'),
    changes: <React.Fragment>Implemented the checklist.</React.Fragment>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-12-23'),
    changes: <React.Fragment>Update cast efficiency to include all available spells for a full overview.</React.Fragment>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-12-23'),
    changes: <React.Fragment>Added <SpellLink id={SPELLS.LAY_ON_HANDS.id} /> to cast efficiency with a 20% recommended cooldown time (to suggest casting it at least once).</React.Fragment>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-12-11'),
    changes: <React.Fragment>Fixed an issue where healing increases (such as Ilterendi and Velen's) didn't include healing buffed for <ItemLink id={ITEMS.HIGHFATHERS_MACHINATION.id} />, <ItemLink id={ITEMS.SEA_STAR_OF_THE_DEPTHMOTHER.id} /> and <ItemLink id={ITEMS.DECEIVERS_GRAND_DESIGN.id} />.</React.Fragment>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-12-08'),
    changes: <React.Fragment>Increased <SpellLink id={SPELLS.AURA_OF_SACRIFICE_TALENT.id} />\'s suggestion healing requirement to 60k HPS for minor, 50k HPS for average and 40k HPS for major (up from 30k/25k/20k).</React.Fragment>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-12-07'),
    changes: 'Stat values shows healing gained per 1 rating on hover.',
    contributors: [blazyb],
  },
  {
    date: new Date('2017-11-05'),
    changes: 'Reworded haste tooltip and changed the display to be 0.00 - value to be more obvious it\'s a max.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-11-02'),
    changes: <React.Fragment>Changed the recommended <ItemLink id={ITEMS.ILTERENDI_CROWN_JEWEL_OF_SILVERMOON.id} /> healing contribution to be at least 4% (down from 4.5%).</React.Fragment>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-11-01'),
    changes: 'Fixed Leech stat value when someone doesn\'t have any Leech to no longer include self-healing or healing from Velen\'s Future Sight.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-10-31'),
    changes: <React.Fragment>Fixed the <i>Haste HPCT</i> stat value not taking current Haste into account leading to a slightly overvaluation.</React.Fragment>,
    contributors: [sref],
  },
  {
    date: new Date('2017-10-30'),
    changes: 'Renamed stat weights to stat values and updated tooltips to be more informative.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-10-28'),
    changes: 'Added stat weights.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-10-28'),
    changes: 'Fixed a bug where Shock Treatment\'s effect was incorrectly doubled one too many times leading to an undervaluation of the Shock Treatment trait.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-10-22'),
    changes: <React.Fragment>Reworded downtime suggestions to avoid suggesting to "always be casting" and instead (as intended) suggest not having <b>high</b> downtime.</React.Fragment>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-10-16'),
    changes: 'Added a Light of Dawn average players hit statistic.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-10-11'),
    changes: 'Added a suggestion for casting Light of the Martyr while Holy Shock is available.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-10-11'),
    changes: 'Reduced the recommended cast efficiency for Crusader Strike (with Crusader\'s Might talent) to 35%.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-09-27'),
    changes: 'Fix relic traits Deliver the Light, Expel the Darkness and Justice through Sacrifice calculations to take into account that the traits are additive with each other.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-09-27'),
    changes: 'Wasted IoL procs now includes Infusion of Lights gained from damaging Holy Shocks so it should only be below 0% when you had a pre-combat IoL.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-09-23'),
    changes: 'Show cast behavior as doughnut charts to create more visual variety.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-09-07'),
    changes: 'Fix the cooldown of Light of Dawn in cast efficiency to take the tier 20 2 set into account.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-08-31'),
    changes: <React.Fragment>When going (near) OOM during a fight and the <i>IoL FoL to HL cast ratio</i> is low, emphasize that FoL is the more mana efficient spell during IoL.</React.Fragment>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-08-31'),
    changes: 'Added Justice through Sacrifice trait healing contribution display.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-08-29'),
    changes: 'Fixed a bug where the direct beacon healing also included casts of abilities such as Blessing of Sacrifice and Deceiver\'s Grand Design.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-08-28'),
    changes: 'Fixed a bug where beaconing yourself wasn\'t being detected properly.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-08-27'),
    changes: 'Added Tyr\'s Munificence trait healing contribution to complete the list.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-08-27'),
    changes: 'Combined relic traits into one box to clean up the layout.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-08-26'),
    changes: 'Added Second Sunrise trait healing contribution display (please read its tooltip).',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-08-26'),
    changes: 'Added Expel the Darkness trait healing contribution display.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-08-26'),
    changes: 'Added Deliver the Light trait healing contribution display.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-08-26'),
    changes: 'Added Shock Treatment healing contribution display. This only calculates the value of the last Shock Treatment point, for you with your gear and only during this fight. The value of an additional point would be lower due to the likely increase in overhealing (although small).',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-08-26'),
    changes: 'Fixed Drape of Shame interaction with the tier 21 4 piece set bonus.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-08-23'),
    changes: 'Added Beacon of Virtue to cast efficiency and a suggestion.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-08-14'),
    changes: 'Reworded Maraad\'s Dying Breath display to be less confusing and moved the total display to the tooltip since it was being used wrong.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-08-12'),
    changes: 'Changed Crusader Strike cast efficiency suggestion',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-08-09'),
    changes: <React.Fragment>Fully migrated to the new suggestions layout. Changed wording on several suggestions to make them clearer, and increased the <i>LotM is inefficient</i> suggestion breakpoints to 1.5/2/3 CPM (up from 1.0/1.5/2.0)</React.Fragment>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-08-02'),
    changes: 'Added tier 21 2 set bonus (experimental, please send logs).',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-08-02'),
    changes: 'Added tier 21 4 set bonus (experimental, please send logs).',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-08-02'),
    changes: 'fixed talent description for Aura of Sacrifice stating Light of Dawn doesn\'t work (it was fixed). Thanks to @Moonmoon for pointing this out.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-07-19'),
    changes: 'Changed Devotion Aura\'s passive estimated DRPS to be based on the paladin\'s damage taken instead of raid average. This should be more accurate as it doesn\'t include tank damage taken.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-07-01'),
    changes: 'Added Devotion Aura estimated damage reduced statistic. This statistic requires you to click it to be calculated to minimize the used resources.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-06-17'),
    changes: 'Add Soul of the Highlord legendary.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-06-08'),
    changes: 'Improve Maraad\'s healing display; show default an esimation of its value given a Flash of Light as opportunity cost (this should make it easy to compare with other legendaries), in tooltip show gain over casting a filler LotM (may be relevant if the cast time reduction is important to you), and show the total healing done with LotM during the Maraad\'s buff.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-06-08'),
    changes: 'Added Holy Avenger estimated healing statistic.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-06-07'),
    changes: 'Added Tier 19 4 set healing statistic.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-05-27'),
    changes: 'Added Tier 20 4 set bonus statistic. Reworked how spells and their beacon transfer are matched to be much more reliable.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-05-21'),
    changes: 'Show overhealing during cooldowns too. Innervates properly shows mana costs.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-05-16'),
    changes: 'Added Darkmoon Deck: Promises statistic.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-05-08'),
    changes: 'Oops one of the lines got mixed up. Fixed Holy Light instead of Flash of Light being suggested to improve Infusion of Light proc usage. Casting Holy Light during IoL is worse, m\'kay.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-03-26'),
    changes: 'Completely refactor the core, rename to Holy Paladin Analyzer.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-05-05'),
    changes: 'Added Aura of Mercy and Sacrifice healing done statistic.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-05-05'),
    changes: 'Changed the report selection interface.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-05-04'),
    changes: 'Minor importance suggestions are now hidden behind a toggle by default.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-05-01'),
    changes: <React.Fragment>Added overhealing suggestions and relaxed the non healing time / dead GCD time suggestions (they should be marked as <i>minor</i> issues more often).</React.Fragment>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-04-27'),
    changes: 'Prevent caching of fights list so it updates with live logs. You can now directly link specific tabs on the results page.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-04-23'),
    changes: 'Changed the LotM suggestion to be based on CPM and be much more forgiving. Added death indicators to the mana graph.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-04-21'),
    changes: 'Added HPS numbers to item healing done. Damaging HS are now included in cast counts. Recommended cast efficiency of CS with CM reduced to 30%. The recommended unused IoL is now adjusted based on if you have CM, DP and/or 4PT19.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-04-21'),
    changes: 'Added suggestion/issue importance indicators and show a positive message when there are no major issues.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-04-20'),
    changes: <React.Fragment>Since Easter is over bosses will no longer resurrect in the mana graph<dfn data-tip="This may cause issues with bosses that do actually resurrect, but I will fix that once I encounter such a boss.">*</dfn>. All bosses in a fight get shown instead of just the first<dfn data-tip="If boss adds are classified as bosses they will be shown as well. So far this doesn\'t appear to happen, but I will fix it if I encounter this.">*</dfn>. This should make the boss health for Mythic Botanist work properly.</React.Fragment>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-04-19'),
    changes: 'Added a Mana tab for analyzing your mana usage. This also shows boss health since it is often used as a target for mana levels.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-04-18'),
    changes: 'Added Velen\'s Future Sight to cast efficiency. Fixed the parser crashing instead of showing a descriptive error when selected player doesn\'t appear in a log. Fixed a crash when buff with stacks expired without ever applying.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-04-17'),
    changes: 'Added LotM suggestion when casting it too often, added Divine Protection and BoS to cast efficiency display. Added Divine Purpose proc indicator.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-04-15'),
    changes: 'Added Tyr\'s Deliverance healing contribution.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-04-15'),
    changes: 'Added Sacred Dawn healing contribution. Note that (when SD wasn\'t up before) Sacred Dawn increases the Light of Dawn healing on yourself on the initial cast, but other players get healed for the normal amount without the SD healing increase. The calculation is aware of this.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-04-15'),
    changes: 'Cast efficiency now takes the extra amount of fight time you had to cast an ability into consideration (e.g. a single cast of 3 minute cooldown during a 3:30 fight will have a higher cast efficiency than during a 5:30 fight).',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-04-15'),
    changes: <React.Fragment>Added a <b>Talents</b> tab.</React.Fragment>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-04-14'),
    changes: <React.Fragment>Added <b>Suggestions</b> which will give you (way too many) suggestions to improve. This may need to be tuned a bit; any feedback in that regard is welcome. Moved <i>Cast efficiency</i> and <i>Mastery effectiveness player breakdown</i> to separate tabs.</React.Fragment>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-04-11'),
    changes: 'Added Rule of Law to cast efficiency and grouped spells by category.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-04-10'),
    changes: 'Show an error when parsing crashes (usually caused by not having advanced combat logging on). Renamed Casts Per Minute to Cast Efficiency. Show absolute amount of casts in Cast Efficiency. Added Arcane Torrent to Cast Efficiency (only shown if you cast it at least once).',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-04-09'),
    changes: <React.Fragment>Added <i>Casts Per Minute</i> table with very basic recommendations.</React.Fragment>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-04-08'),
    changes: <React.Fragment>Added <i>Heals on beacon</i> statistic.</React.Fragment>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-04-08'),
    changes: 'Added Wowhead tooltips and show T19 4 set bonus gain.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-04-08'),
    changes: 'Added Beacon of the Lightbringer mastery radius support!',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-04-08'),
    changes: 'Improve beacon healing tracking accuracy and it now works properly with Beacon of Virtue.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-04-08'),
    changes: 'Total healing done count now includes absorbed healing.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-04-07'),
    changes: 'New layout with many usability improvements!',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-04-04'),
    changes: <React.Fragment>Add an Always Be Casting (ABC) module that checks your <i>Non healing time</i> and dead GCD time (this is shown in the tooltip).</React.Fragment>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-03-29'),
    changes: 'Fixed a bug where Maraad\'s healing statistic would show 0% healing after getting only 1 Maraad\'s charge.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-03-29'),
    changes: 'Update healing bonuses to the 7.2 values (DoS & Ilterendi nerfs).',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-03-27'),
    changes: 'Added Maraad\'s Dying Breath healing statistic.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-03-27'),
    changes: 'Added Prydaz and Obsidian Stone Spaulders healing statistic.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-03-26'),
    changes: 'Added Chain of Thrayn healing statistic.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-03-25'),
    changes: 'Added cast ratios statistic.',
    contributors: [Zerotorescue],
  },
];
