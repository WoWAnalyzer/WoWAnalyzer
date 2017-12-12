#Statistic Boxes

The top display is comprised of statistic boxes that show off module details independently of suggestions. This document will go over some code templates and current examples of how to display information in different styles of boxes.

##Box layout & order

The statistic boxes are laid out in rows from left to right for three columns at most, then top to bottom as long as there are boxes. 

**NOTE**: Display box height will disrupt the order layout, so sometimes it's confusing and awkward to get an exact box order. If you want certain modules to group together in the box display grid, consider using a combo box instead of many default boxes or grouping similarly sized boxes together.
** you can also fudge it within a statistic a la https://github.com/WoWAnalyzer/WoWAnalyzer/blob/master/src/Parser/Paladin/Holy/Modules/PaladinCore/CastBehavior.js

There are three STATISTIC_ORDER values to assign to the box statistic order.
- CORE will display ahead of anything else. This order is typically reserved for core abilities.
- OPTIONAL will display behind anything else. Talents.

##StatisticBox
multiple icons 
- (horiz) https://github.com/WoWAnalyzer/WoWAnalyzer/blob/master/src/Parser/Hunter/BeastMastery/Modules/Spells/DireBeast/DireBeast.js
- (vertical) https://github.com/WoWAnalyzer/WoWAnalyzer/blob/master/src/Parser/Mage/Frost/Modules/Features/WintersChill.js
- (vertical) https://github.com/WoWAnalyzer/WoWAnalyzer/blob/master/src/Parser/Shaman/Elemental/Modules/Features/Overload.js

downtime-style footer bar
- https://github.com/WoWAnalyzer/WoWAnalyzer/blob/master/src/Parser/Monk/Mistweaver/Modules/Spells/UpliftingTrance.js

##SmallStatisticBox
Concordance

##StatisticsListBox
Dimensional Rift - https://github.com/WoWAnalyzer/WoWAnalyzer/blob/master/src/Parser/Warlock/Destruction/Modules/Features/DimensionalRift.js
Relic traits
NLC
Pie charts
- https://github.com/WoWAnalyzer/WoWAnalyzer/blob/master/src/Parser/Hunter/Marksmanship/Modules/Features/VulnerableApplications.js
- https://github.com/WoWAnalyzer/WoWAnalyzer/blob/master/src/Parser/Monk/Mistweaver/Modules/Spells/ThunderFocusTea.js
- https://github.com/WoWAnalyzer/WoWAnalyzer/blob/master/src/Parser/Paladin/Holy/Modules/PaladinCore/CastBehavior.js

##ExpandableStatisticBox
- Flourish https://github.com/WoWAnalyzer/WoWAnalyzer/blob/master/src/Parser/Druid/Restoration/Modules/Talents/Flourish.js
- Evangelism https://github.com/WoWAnalyzer/WoWAnalyzer/blob/master/src/Parser/Priest/Discipline/Modules/Spells/Evangelism.js
- https://github.com/WoWAnalyzer/WoWAnalyzer/blob/master/src/Parser/Priest/Holy/Modules/PriestCore/MasteryBreakdown.js

##LazyLoadStatisticBox
- click to load: ironbarkMitigation https://github.com/WoWAnalyzer/WoWAnalyzer/blob/master/src/Parser/Druid/Restoration/Modules/Features/Ironbark.js
- https://github.com/WoWAnalyzer/WoWAnalyzer/blob/master/src/Parser/Priest/Discipline/Modules/Features/PowerWordBarrier.js
- https://github.com/WoWAnalyzer/WoWAnalyzer/blob/master/src/Parser/Priest/Discipline/Modules/Features/LeniencesReward.js