# Table of Contents
* [Adding a new spec](#adding-a-new-spec)
* [Add an empty spec](#add-an-empty-spec)
* [Add a total damage done / healing done / damage taken statistic](#add-a-total-damage-done--healing-done--damage-taken-statistic)
* [Add Cast Efficiency](#add-cast-efficiency)
* [Add Always Be Casting](#add-always-be-casting)
  * [Code skeleton](#general-code-skeleton)
  * [Code skeleton: Healers](#code-skeleton-healers)
* [Create a pull request](#create-a-pull-request)
* [Suggestions](#suggestions)
  * [Suggestion texts](#suggestion-texts)
  * [Suggestion thresholds](#suggestion-thresholds)

# Adding a new spec

You don't need to to do anything special to add a spec. The real issue preventing specs from being added is that in order to add a spec, you need to have the following 3 properties:
1. Know the spec well enough to actually create something useful
2. Know how to program well enough to implement the analysis
3. Have the time and motivation to actually do it

We have worked hard to provide you with many tools to make step 2 as easy as possible. Things such as calculating the downtime (Always Be Casting) and Cast Efficiency have been worked out so that it's a matter of only a few lines of configuration code to get them to work, but more advanced analysis such as the gains from a spec's specific mastery usually require custom code. But you don't worry about that yet; start small.

I recommend adding a new spec in the following order:

1. Add an empty spec (without any analysis)
2. Add a total damage done / healing done / damage taken statistic
3. Add Cast Efficiency
4. Add "Always be Casting" (downtime)
4a. Create a pull request

The next steps can be done in no particular order:
* Add something that can not be analyzed yet that people are interested in (e.g. the value of your mastery)
* Add suggestions for common issues
    * Look at what other people look for when analyzing logs, and copy that analysis into the analyzer with appropriate suggestions
* Tune suggestion thresholds to give better advice (on-going)
* Add legendary performance modules
* Add set bonus modules
* Add modules for relic trait performance (this may not be as useful for SimCraftable specs)
* Configure the cooldown tracker

The most useful things to do are to add information that isn't yet easily available and to fine-tune the suggestions so that they give the best possible recommendations to people.

# Add an empty spec

1. The easiest way to start is by copy pasting the Holy folder in `src/Parser/Paladin`. Name it the full name of the spec you want to work on. I'll call your spec NewSpec from now on.
2. Open `src/Parser/NewSpec/CONFIG.js` and change the `spec` property to your spec (in my case `SPECS.NEW_SPEC`), if your IDE is set up properly auto complete should provide you with the available options. Change the maintainer name as desired.
3. Open `src/Parser/AVAILABLE_CONFIGS.js` and duplicate an import line and add your new spec to the object at the bottom.
4. When you save your spec should now be supported and shown in the player selection list. Clicking it probably won't work yet though, as the Holy Paladin modules aren't compatible with your spec.
5. Go into the NewSpec folder and start deleting stuff you don't need. Delete the `Images` folder, and delete all modules except `AlwaysBeCasting`, `Abilities`, and `CooldownThroughputTracker`. You can look at the modules you're deleting if they may be useful to your spec, but you can also do this later as it's easier to continue from a mostly blank slate.
6. Open `src/Parser/NewSpec/CombatLogParser.js` and start deleting the dead references (this would be easiest if your IDE shows this). Then delete all the module entries except for the modules you didn't delete.
7. Delete all methods from the CombatLogParser except `generateResults()`. Adding methods to CombatLogParser to manipulate things is pretty advanced usage that you shouldn't need initially.
8. When you save your NewSpec should now import properly!
9. Now you can start adding modules, look at other specs for how to do things. The Holy Paladin implementation is usually the most up-to-date analyzer, so that's the best place to start looking at.

ps. Tests can be added in the `src/tests` folder. Automated tests are recommended, especially for more complicated parts of your code.

# Add a total damage done / healing done / damage taken statistic

This statistic module box doesn't get its own .js file in your class-spec folder; it's already been worked out in `src/Parser/Core/Modules/` and imported into your `CLASS/SPECIALIZATION/CombatLogParser.js`. Often this is just a total damage done box, but if you want total healing and/or total damage taken statistics, you'll import them in this same file.

Because the box order is set in the Core, these will be the first boxes on your layout.

Within your `src/Parser/CLASS/SPECIALIZATION/CombatLogParser.js`, add the desired statistic lines into your imports at the top:
```javascript
import DamageDone from 'Parser/Core/Modules/DamageDone';
import HealingDone from 'Parser/Core/Modules/HealingDone';
import DamageTaken from 'Parser/Core/Modules/DamageTaken';
```

Within `specModules = { ... }`, add the matching desired statistic lines:
```javascript
damageDone: [DamageDone, { showStatistic: true }],
healingDone: [HealingDone, { showStatistic: true }],
damageTaken: [DamageTaken, { showStatistic: true }],
```

# Add Cast Efficiency

Cast Efficiency is a tab that shows stats concerning the number of ability uses and includes suggestions for spellcasts that are below preferred thresholds. It needs a list of your spec's abilities in order to be generated.

To create and show this tab, in your class-specialization's `CombatLogParser.js` add two lines of code:
* `import Abilities from './Modules/Features/Abilities';` in the list of imports at the top
* `abilities: Abilities,` in the specModules block

In `src/Parser/CLASS/SPECIALIZATION/Modules/Features`, create or edit the `Abilities.js`. Here is a code skeleton, if none exists:
```javascript
import SPELLS from 'common/SPELLS';
import CoreAbilities from 'Parser/Core/Modules/Abilities';

class Abilities extends CoreAbilities {
  static ABILITIES = [
    ...CoreAbilitiesy.ABILITIES,
    // Category
    {
      spell: SPELLS.SPELL_NAME,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      cooldown: 120,
    },

    // Second category
    {
      spell: SPELLS.SPELL_NAME_2,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
    },
  ];
}

export default Abilities;
```

Optional import modules:
```javascript
// used for referring to spells in <span></span> suggestions
import SpellLink from 'common/SpellLink';

// used for the optional importance property in a spell block
import ISSUE_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';
```

The spell categories appear in the tab in the same order as the [CoreAbilities](../src/Parser/Core/Modules/Abilities.js) SPELL_CATEGORIES. Within each category, the spells appear in order as entered in the code.

`spell: ` & `cooldown: ` are required for the page to load without errors. `category: ` is additionally required for the spell to appear in the Cast Efficiency tab. A full list of available properties are commented in the beginning of the [Ability](../src/Parser/Core/Modules/Ability.js) class and are generally self-explanatory.

### cooldown
This property can be set a number of ways. Simply, the property lists the length of the cooldown in seconds.
* **No cooldown**: `cooldown` can be omitted
    * Example: [FIREBALL](../src/Parser/Mage/Fire/Modules/Features/Abilities.js)
* **Static cooldown**:  `120,`
    * Example: [SOUL_HARVEST](../src/Parser/Warlock/Affliction/Modules/Features/Abilities.js)
* **Hasted cooldown**: `haste => 15 / (1 + haste),`
    * Example: [DEMON_SPIKES](../src/Parser/DemonHunter/Vengeance/Modules/Features/Abilities.js)
* A **dynamic cooldown** may require a custom function to define the potential cast efficiency. Examples:
    * [METAMORPHOSIS_HAVOC](../src/Parser/DemonHunter/Havoc/Modules/Features/Abilities.js) - artifact relic trait reduces cooldown
    * [SWIFTMEND](../src/Parser/Druid/Restoration/Modules/Features/Abilities.js) - passive talent reduces cooldown
    * [FISTS_OF_FURY_CAST](../src/Parser/Monk/Windwalker/Modules/Features/Abilities.js) - active talent buff further reduces hasted cooldown
    * [HEALING_STREAM_TOTEM_CAST](../src/Parser/Shaman/Restoration/Modules/Features/Abilities.js) - other spell interactions with tier bonus reduces cooldown
    * [MANGLE_BEAR](../src/Parser/Druid/Guardian/Modules/Features/Abilities.js) - estimated cooldown resets from a proc, but proc's chance is determined by multiple factors

# Add Always Be Casting

AlwaysBeCasting.js is the Downtime statistic module box, commonly the first or second box on a player's WoWAnalyzer report. It also controls downtime suggestions for the player in the Suggestions tab.

To create and show this tab, in your class-specialization's `CombatLogParser.js` add two lines of code:
* `import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';` in the list of imports at the top
* `alwaysBeCasting: AlwaysBeCasting,` in the specModules block

In `src/Parser/CLASS/SPECIALIZATION/Modules/Features`, create or edit the `AlwaysBeCasting.js`. The damage dealing/tanks AlwaysBeCasting is the basic code skeleton. Healers use a specific healing version and some healer specs have used additional optional code.

### General code skeleton
```javascript
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import { STATISTIC_ORDER } from 'Main/StatisticBox';

import CoreAlwaysBeCasting from 'Parser/Core/Modules/AlwaysBeCasting';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  static ABILITIES_ON_GCD = [
    // Category
    SPELLS.SPELL_NAME.id,
    123456, // if using spellid, please comment what it is
    SPELLS.SPELL_NAME.id,

    // Useless/extremely minor abilities
      // either include them anyway for sake of completion
      // or comment each out & note categorically why
  ];

  suggestions(when) {
    const deadTimePercentage = this.totalTimeWasted / this.owner.fightDuration;

    when(deadTimePercentage).isGreaterThan(0.2)
      .addSuggestiong((suggest, actual, recommended) => {
        return suggest('Your downtime can be improved. Try to reduce your downtime, for example by reducing the delay between casting spells and when you\'re not healing try to contribute some damage.')
          .icon('spell_mage_altertime')
          .actual('${formatPercentage(actual)}% downtime')
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(recommended + 0.15).major(recommended + 0.2);
      });
  }

  showStatistic = true;
  statisticOrder = STATISTIC_ORDER.CORE(0); // change the number to change the position order
}

export default AlwaysBeCasting;
```

**Optional import modules**
```javascript
// used for referring to spells in <span></span> suggestions
import SpellLink from 'common/SpellLink';
```

**Optional suggestions messages**

See the [Suggestions](#suggestions) section below for more specific suggestion guidelines.

To include particular spell suggestions, use the SpellLink import and a `<span></span>` message in the suggest() instead of a string (example: [Retribution Paladin](../src/Parser/Paladin/Retribution/Modules/Features/AlwaysBeCasting.js)).

### Code skeleton: Healers
Healer modules can differentiate between healing downtime (casting non-healing spells) and overall downtime (not casting anything). So, instead they extend from a special Healing version of the Core AlwaysBeCasting, and they include different code bits to deal with the distinction of healing versus other spells.

```javascript
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import { STATISTIC_ORDER } from 'Main/StatisticBox';

import CoreAlwaysBeCastingHealing from 'Parser/Core/Modules/AlwaysBeCastingHealing';

const HEALING_ABILITIES_ON_GCD = [
   SPELLS.HEALING_SPELL_NAME.id,
   SPELLS.HEALING_SPELL_NAME.id,
   SPELLS.HEALING_SPELL_NAME.id,
];

class AlwaysBeCasting extends CoreAlwaysBeCastingHealing {
  static HEALING_ABILITIES_ON_GCD = HEALING_ABILITIES_ON_GCD;
  static ABILITES_ON_GCD = [
    // healing abilities
    ...HEALING_ABILITIES_ON_GCD,

    // damage abilities
    SPELLS.SPELL_NAME.id,
    123456, // if using spellid, please comment what it is
    SPELLS.SPELL_NAME.id,

    // Useless/extremely minor abilities
      // either include them anyway for sake of completion
      // or comment each out & ntoe categorically why
  ];

  suggestions(when) {
    const nonHealingTimePercentage = this.totalHealingTimeWaste / this.owner.fightDuration;
    const deadTimePercentage = this.totalTimeWasted / this owner.fightDuration;

    when(nonHealingTimePercentage).isGreaterThan(0.3)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest('Your non healing time can be improved. Try to reduce the delay between casting spells and try to continue healing when you have to move.')
          .icon('petbattle_health-down')
          .actual(`${formatPercentage(actual)}% non healing time`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(recommended + 0.1).major(recommended + 0.15);
      });
    when(deadTimePercentage).isGreaterThan(0.2)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest('Your downtime can be improved. Try to Always Be Casting (ABC); try to reduce the delay between casting spells and when you\'re not healing try to contribute some damage.')
          .icon('spell_mage_altertime')
          .actual(`${formatPercentage(actual)}% downtime`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(recommended + 0.15).major(1);
      });
  }

  showStatistic = true;
  statisticOrder = STATISTIC_ORDER.CORE(0); // change the number to change the position order
}

export default AlwaysBeCasting;
```

**Optional code: healers**

[Holy Paladin](../src/Parser/Paladin/Holy/Modules/Features/AlwaysBeCasting.js) has some extra code (including `import ITEMS from 'common/ITEMS';`) for distinguishing when a damage ability can be counted as a healing ability due to talents, items, or target selection.

[Discipline Priest](../src/Parser/Priest/Discipline/Modules/Features/AlwaysBeCasting.js) only needs one downtime suggestion box, since its damage spells are also healing through Atonement.

Although also seen in [Balance Druid](../src/Parser/Druid/Balance/Modules/Features/AlwaysBeCasting.js), verification of cast times is primarily seen in Holy Paladin (`_verifyChannel()` for Flash of Light) and Discipline Priest (custom code for distinguishing consecutive Penance channels).

# Create a pull request

See [CONTRIBUTING.md](README.md#sharing-your-changes).

# Suggestions

Suggestions are one of the most important parts of a spec analysis. This is what will help most players improve their play and getting it right will allow your spec analysis to replace manual log analysis, which is the primary goal of the tool. It's hard getting the suggestions perfect right away, but that's ok. Expect to fiddle with thresholds and suggestion texts a lot.

## Suggestion texts
Suggestion texts can consist of the following parts, but usually they only have the first two parts:

1. **Explain what was found.** e.g. `Your Mastery Effectiveness can be improved.` or `You are wasting Soul Shards.` This should be a concise summary as it's usually further explained in the suggestion. This can be omitted when it's obvious enough from the suggestion (e.g. there's no point stating `Your Judgment cast efficiency can be improved.` when the suggestions reveals this well enough; `Try to cast Judgment more often.`).
2. **Make a suggestion**, usually starting with `Try to...`. This should assume the player doesn't know what to do, so suggest an approach. For example `Try keeping at least 1 charge on cooldown; you should (almost) never be at max charges.` would be better than `Try to improve your uptime.`.
3. **Explain why** doing something is important. While the tool doesn't aim to be a class guide we do want to help people improve their play. Understanding *why* they should do something makes it a lot easier to do it. For example `Light of the Martyr is an inefficient spell to cast` (you can go into more detail).
4. **Suggest an alternative.** Sometimes a certain item, talent or something else is much harder to use than an alternative, so suggesting to switch to the easier solution might be appropriate (e.g. `Try to line up Light of Dawn and Holy Shock with the buff or consider using an easier legendary.`)

## Suggestion thresholds

It's important to properly tune the threshold for showing a suggestion and the thresholds for upgrading it to regular or major importance. **Make sure gameplay issues with a major impact get shown before and with higher importance than minor things.** This is very important. Don't nag at players for things they either can't improve or that's not important enough. If they're unimportant, mark them as minor importance and they'll be hidden behind the toggle. Only if an issue has a significant impact on someone's performance it should be of average importance, and only after really becoming serious it should be marked *major*.

Suggestions thresholds should be consistent regardless of fight length. Wasting 100 Rage in a 3 minute fight is a much bigger issue than wasting 100 Rage in a 15 minute fight. The best suggestion triggers are either per minute amounts (e.g. *rage wasted per minute*) or percentages (e.g. *80% uptime* or *5% rage wasted*). You can't really blame a player for making a minor mistake a few times in a 15 minute fight, and while you can point it out, it shouldn't be bumped up to a major issue just because the fight lasted longer and therefore it happened several times.

There are several properties in the cast efficiency configuration to change the threshold, or disable or limit the importance of suggestions. Use them. There's also the option to add a custom suggestion text.
Some suggestions are never important enough to be marked average or major importance, you should limit these to minor.

Please don't hesitate to ask for someone to review your suggestions thresholds outside a PR. We believe getting them right is important but also hard, having a second set of eyes look at them might help get them right.
