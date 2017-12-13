# Statistic Boxes

Statistic boxes show off module details independently of suggestions. Statistic boxes are coded into their related module Javascript files, typically as the last thing in the module code. 

**General topics**
- [Box layout & order](#box-layout--order)
- [Imports used](#imports-used)
- [Basic statistic box](#statisticbox)
  - [Code skeleton and anatomy](#code-skeleton) 

**Statistic box styles**
- Basic (above)
- [Multiple icons in a basic box](#multiple-listing)
- [Downtime's styled footer bar](#downtimes-styled-footer-bar)
- [Small](#smallstatisticbox)
- [List (Netherlight Crucible style)](#statisticslistbox)
- [Expandable](#expandablestatisticbox)
- [Click to load](#lazyloadstatisticbox)

## Box layout & order

The statistic boxes are laid out in rows from left to right for three columns at most, then top to bottom as long as there are boxes. 

**NOTE**: Display box height will disrupt the order layout, so sometimes it's confusing and awkward to get an exact box order. If you want certain modules to group together in the box display grid, consider using a combo box instead of many default boxes or grouping similarly sized boxes together.
** you can also fudge it within a statistic a la https://github.com/WoWAnalyzer/WoWAnalyzer/blob/master/src/Parser/Paladin/Holy/Modules/PaladinCore/CastBehavior.js

Typically two STATISTIC_ORDER values are used in spec statistic boxes. `CORE` is for base spec abilities, resources, and core spec procs; `OPTIONAL` is used for sometimes-things like talents or minor constants like relics and artifact traits. In detail, the [STATISTIC_ORDER](https://github.com/WoWAnalyzer/WoWAnalyzer/blob/master/src/Main/STATISTIC_ORDER.js) uses this ordering, first > last: `CORE` > `DEFAULT` > `OPTIONAL` > `UNIMPORTANT`.

## Imports used

```javascript
// icons
import SpellIcon from 'common/SpellIcon';
import Icon from 'common/Icon';

// text/number formatting
// see /src/common/format.js for more formats
import { formatPercentage } from 'common/format';
import { formatThousands } from 'common/format'; // formats into 1,000
import { formatNumber } from 'common/format'; // formats into 1k

// statistic boxes + order
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
```

## StatisticBox

StatisticBox is the default and basic statistic box that you will see in the [getting started module documentation](https://github.com/poneria/WoWAnalyzer/blob/doc-statbox/docs/a-new-module.md). Here's a basic example.

![Agony uptime](images/agony-uptime-box.jpg)

```javascript
// Simple DoT uptime box (Agony Uptime)

  statistic() {
    const agonyUptime = this.enemies.getBuffUptime(SPELLS.AGONY.id) / this.owner.fightDuration;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.AGONY.id} />}
        value={`${formatPercentage(agonyUptime)} %`}
        label="Agony uptime"
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.CORE(3);
```

### Code skeleton

```javascript
statistic() {
  // variables or constants if needed

  return (
    <StatisticBox
      icon={} // icon on left; default aligns center-vertical if the box grows in height
      value={` `} // the big display value
      label={} // text label; can also be adjusted for a bigger tooltip display 
      tooltip={} // tooltip not through label
    />
  );
}

statisticOrder = STATISTIC_ORDER.CORE(###);
```

### Icon

For a Wowhead tooltip on the icon mouseover, use a `<SpellIcon />` for the icon. The id should either be a numerical spellID from Wowhead or referencing one of the spells already in the WoWAnalyzer SPELLS folder.
- `icon={<SpellIcon id={SPELLS.AGONY.id} />}`
- `icon={<SpellIcon id={980} />}`

For a plain icon, use an `<Icon />` with the icon name.
- `icon={<Icon icon="ability_hunter_snipershot" />}`

For a custom icon, include an import of your icon image file in the top of the module, then reference it in a plain `<img src={icon_img_name} />`.
- `icon={<img src={MasteryRadiusImage} style={{ border: 0 }} alt="Mastery effectiveness" />}` from the [Holy Paladin - Mastery Effectiveness](../src/Parser/Paladin/Holy/Modules/Features/MasteryEffectiveness.js) stat box.
- note that MasteryRadiusImage is in `/public/img` not in the `Paladin/Holy` folder.
  
### Value

To get a value into a percentage, use formatPercentage (import module). It's common practice to do calculations before and store with a variable/constant name, then reference the variable/constant name here.
- ```value={`${formatPercentage(agonyUptime)} %`}```
- ```value={`${((this.heals / totalCastsIncludingDp) || 0).toFixed(2)} players`}```
- ```value={`${formatNumber(this.hps)} HPS`}```

### Label

For basic text with no tooltip, just use a basic double-quote string.
- `label="Agony uptime"`

For a basic tooltip via label: 
```javascript
label={(
  <dfn data-tip={'This is the effective healing contributed by the Eveloping Mists buff.'}>
    Healing Contributed
  </dfn>
)}
``` 

For a longer tooltip via label --> see [Mistweaver Monk - Mana Tea](../src/Parser/Monk/Mistweaver/Modules/Talents/ManaTea.js) talent module stat box.

![Mana Tea tooltip](images/mana-tea-box-tooltip.jpg)

### Tooltip

For a basic tooltip:
```
tooltip="Tooltip text here."
```

For longer tooltip variations, see [Holy Paladin - Beacon of Faith healing](/src/Parser/Paladin/Holy/Modules/PaladinCore/BeaconHealing.js) or [Holy Paladin - Holy Avenger](../src/Parser/Paladin/Holy/Modules/Talents/HolyAvenger.js) talent module stat boxes.

![Beacon of Faith tooltip](images/beacon-faith-box-tooltip.jpg)
![Holy Avenger tooltip](images/holy-avenger-box-tooltip.jpg)

### Footer

This footer bar is usually seen as part of the damage taken, healing done, or downtime module boxes. However, you can also adapt it to a display module -- see [the styled footer bar](#downtimes-styled-footer-bar) box variation section below.

---

## Multiple listing

You can add multiple icons or text rows within a StatisticBox, if you want to show different parts of a module. Horizontal grouping is cleaner, but tends to work with only a single counter beside each icon. 

- (horiz) https://github.com/WoWAnalyzer/WoWAnalyzer/blob/master/src/Parser/Hunter/BeastMastery/Modules/Spells/DireBeast/DireBeast.js
- (vertical) https://github.com/WoWAnalyzer/WoWAnalyzer/blob/master/src/Parser/Mage/Frost/Modules/Features/WintersChill.js
- (vertical) https://github.com/WoWAnalyzer/WoWAnalyzer/blob/master/src/Parser/Shaman/Elemental/Modules/Features/Overload.js

## Downtime's styled footer bar

![Mistweaver Monk - Uplifting Trance box](images/uplifting-trance-box-footer-bar.jpg)

```javascript
// Mistweaver Monk - Uplifting Trance box
<StatisticBox
  icon={<SpellIcon id={SPELLS.UPLIFTING_TRANCE_BUFF.id} />}
  value={`${formatPercentage(unusedUTProcsPerc)}%`}
  label={(
    <dfn data-tip={`${this.nonUTVivify} of your vivify's were used without an uplifting trance procs.`}>
      Unused Procs
    </dfn>
  )}
  footer={(
    <div className="statistic-bar">
      <div
        className="stat-healing-bg"
        style={{ width: `${this.consumedUTProc / this.UTProcsTotal * 100}%` }}
        data-tip={`You consumed a total of ${this.consumedUTProc} procs.`}
      >
        <img src="/img/healing.png" alt="Healing" />
      </div>
      
      <div
        className="remainder stat-overhealing-bg"
        data-tip={`You missed a total of ${unusedUTProc} procs.`}
      >
        <img src="/img/overhealing.png" alt="Overhealing" />
      </div>
    </div>
  )}
  footerStyle={{ overflow: 'hidden' }}
/>
```

Look at the [DamageTaken module](/src/Parser/Core/Modules/DamageTaken.js) for a .map() version of many sections in the footer bar.

The last bar color is always coded `className="remainder {bg color}"` so that the bar fills the remainder in with that background color. If the bar colors were switched in the Uplifting Trance example, the first would be `className="stat-overhealing-bg"` and the second would be `className="remainder stat-healing-bg"`.

The white images on top of the colored bars come from `/public/img`. 

The bar colors come from the className value, and are found deep in `/src/Main/App.css`.
- `"{class}-bg"` colors: lines 667-678.
- `"stat-{something}-bg"` colors: lines 713-736.
- `"spell-school-{type}-bg"` colors: lines 739-764.

## SmallStatisticBox

This is the stat box that contains a one-liner of text. 

Concordance
Tyr's Deliverance - https://github.com/WoWAnalyzer/WoWAnalyzer/blob/master/src/Parser/Paladin/Holy/Modules/Features/TyrsDeliverance.js

## StatisticsListBox

This is the statistic box that looks like a list of SmallStatisticBoxes one-liners but in one box. The general example is Netherlight Crucible traits and the Relic traits in some class-specs. However, this box type isn't restricted to artifact traits; in fact, you can use it to make pie chart statistics.

Dimensional Rift - https://github.com/WoWAnalyzer/WoWAnalyzer/blob/master/src/Parser/Warlock/Destruction/Modules/Features/DimensionalRift.js

Pie charts
- https://github.com/WoWAnalyzer/WoWAnalyzer/blob/master/src/Parser/Hunter/Marksmanship/Modules/Features/VulnerableApplications.js
- https://github.com/WoWAnalyzer/WoWAnalyzer/blob/master/src/Parser/Monk/Mistweaver/Modules/Spells/ThunderFocusTea.js
- https://github.com/WoWAnalyzer/WoWAnalyzer/blob/master/src/Parser/Paladin/Holy/Modules/PaladinCore/CastBehavior.js

## ExpandableStatisticBox

Some statistic boxes have a big red button to expand. Do note that the expansion doesn't shove the rest of the column's boxes down the page, but overlaps them. The box has a tinted background, but depending on the box below, the overlapping graphics may or may not cause reading issues.

- Flourish https://github.com/WoWAnalyzer/WoWAnalyzer/blob/master/src/Parser/Druid/Restoration/Modules/Talents/Flourish.js
- Evangelism https://github.com/WoWAnalyzer/WoWAnalyzer/blob/master/src/Parser/Priest/Discipline/Modules/Spells/Evangelism.js
- https://github.com/WoWAnalyzer/WoWAnalyzer/blob/master/src/Parser/Priest/Holy/Modules/PriestCore/MasteryBreakdown.js

## LazyLoadStatisticBox

If you need a statistic to wait to load until asked for, you can do it with a LazyLoad box. When you click the button, the statistic loads, instead of the normal loading with the page.

- https://github.com/WoWAnalyzer/WoWAnalyzer/blob/master/src/Parser/Druid/Restoration/Modules/Features/Ironbark.js
- https://github.com/WoWAnalyzer/WoWAnalyzer/blob/master/src/Parser/Priest/Discipline/Modules/Features/PowerWordBarrier.js
- https://github.com/WoWAnalyzer/WoWAnalyzer/blob/master/src/Parser/Priest/Discipline/Modules/Features/LeniencesReward.js
