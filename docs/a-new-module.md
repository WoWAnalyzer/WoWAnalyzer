# Making a module

The easiest things to contribute are specific modules for statistics such as from spells, traits or items. Go through the Parser directory to see how everything is set up. Once you've decided what you want to add, make a new file in the right directory. Here's a template you can use:

```js
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import ItemIcon from 'common/ItemIcon';
import { formatNumber } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class MyCuteRock extends Analyzer {
  healing = 0;

  on_initialized() {
  	this.active = this.owner.selectedCombatant.hasTrinket(ITEMS.STUPID_ROCK.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    // Do something when the player cast something
    // to see what event holds you can do a console.log:
    console.log(event);
  }

  statistic() {
    return (
      <StatisticBox
        icon={<ItemIcon id={ITEMS.STUPID_ROCK.id} />}
        value={`${formatNumber(this.healing)} %`}
        label="Healing contributed"
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(40);
}

export default MyCuteRock;
```

This is the worker behind the statistic. The `on_` functions are your event listeners. Through some magic these functions get called whenever an event with their name is triggered. See [events.md](events.md) for the available events.

The `byPlayer` (and `toPlayer`) part of the function names are just there for ease of use; these make sure only events done **by the player** or **to the player** are listened to. Purely convenience, you can also just do `on_cast` and filter inside with `if (!this.owner.byPlayer(event)) { return; }`, but putting that everywhere gets messy quickly. Do note **only events that involve the selected player are available for performance reasons**, so if you wanted to listen to events when other players take damage you're out of luck (but the selected player taking damage is of course available at `on_toPlayer_damage`).

The file you just made still doesn't do anything as it hasn't been enabled in a parser yet. I assume you're working on a spec specific statistic, let's say for Holy Paladin. Go to `Parser/Paladin/Holy/CombatLogParser.js`. Import your new module next to the other imports, for example: `import MyCuteRock from './Modules/Items/MyCuteRock';`, then scroll down to the `specModules` static property. Add your module: `myCuteRock: MyCuteRock,`, now it is active and the statistic should appear on the spec.

### Code examples

- [How to make statistic boxes](../docs/stat-boxes.md)
- Common module examples TBD

**Further documentation for modules is a work in progress. For now looking at the Holy Paladin implementation may be the best way to find out how things are done, as I always try to keep this updated with the latest best practices.** If you want to add something to the items display just do a find-in-files for `item()` to find examples. For suggestions search for `suggestions(when)` (plural, unlike the other functions). You can also add your own tab with the `tab()` function. Almost every problem imaginable has been solved, so looking at other places is one way to find how to do things. Alternatively your questions are always welcome in the WoW Analyzer Discord.