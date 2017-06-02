# Contributing

Hey! Awesome you're interested in helping out. This should get you along the way. It's super basic right now because I hate documentation, but I hope it's enough to help you get started.

# Installing

 * Get Git.
 * Clone the repo.
 * Get Node (6+): https://nodejs.org/en/
 * Open a command window to the cloned repo (do this after installing Node).
 * run this command: `npm install`

# Running

 * run this command: `npm start`

Your command window should now start compiling the application and if all went well open a browser window with everything running :)

# Editing

Start small. Try changing something to see things change. If you verified everything is working, you're ready to go to the real stuff.

The easiest things to contribute are specific modules for statistics such as from spells, traits or items. Go through the Parser directory to see how everything is set up. Once you've decided what you want to add, make a new file in the right directory. Here's a template you can use:

```js
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

import Module from 'Parser/Core/Module';

class StupidRock extends Module {
  healing = 0;

  on_initialized() {
    if (!this.owner.error) {
      this.active = this.owner.selectedCombatant.hasTrinket(ITEMS.STUPID_ROCK.id);
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    // Do something when the player cast something
    // to see what event holds you can do a console.log:
    console.log(event);
  }
}

export default StupidRock;
```

This is the worker behind the statistic. The `on_` functions are your event listeners. Through some magic these functions get called whenever an event with their name is triggered. The following events are available:

 * `begincast, cast, miss, damage, heal, absorbed, healabsorbed, applybuff, applydebuff, applybuffstack, applydebuffstack, refreshbuff, refreshdebuff, removebuff, removedebuff, removebuffstack, removedebuffstack, summon, create, death, destroy, extraattacks, aurabroken, dispel, interrupt, steal, leech, energize, drain, resurrect, encounterstart, encounterend`

The `byPlayer` (and optionally `toPlayer`) part of the function names are just there for ease of use; these make sure only events done **by the player** or **to the player** are listened to. Purely convenience, you can also just do `on_cast` and filter inside with `if (!this.owner.byPlayer(event)) { return; }`, but putting that everywhere gets messy quickly. Do note **only events that involve the selected player are available for performance reasons**, so if you wanted to listen to events when other players take damage you're out of luck (but the selected player taking damage is of course available at `on_toPlayer_damage`).

The file you just made still doesn't do anything as it hasn't been enabled in a parser yet. I assume you're working on a spec specific statistic, let's say for Holy Paladin. Go to `Parser/HolyPaladin/CombatLogParser.js`. Import your new module next to the other imports, for example: `import StupidRock from './Modules/Items/StupidRock';`, then scroll down to the `specModules` static property. Add your module: `stupidRock: StupidRock,`, now it is active but still not visible.

You can add your new statistic to the results page by adding it in the `generateResults` method of the `CombatLogParser` you just modified. If it's an item add it to the items list, just duplicate an existing item and change its values as desired. Please keep the displayed content consistent with the rest of the interface. Most statistics are single line, so that should be your goal too. And if it's a mana trinket you should show the same text as is shown for similar mana trinkets.

# Contributing

When done commit your work.
Then make a pull request, the easiest way to do this is through the GitHub interface. If you cloned it will show a "Create pull request" button in your repository page, if you're using the interface it should be there somewhere too. Explain why what you did matters and why you did what you did (although if you have to explain why you did what you did then you should probably include that as comments in your code).

Don't forget to update the changelog, but only include changes that users might notice. PRs without updated changelogs will not be merged.

# Code style

Please try to respect the eslint rules.

Please never comment *what* you do, comment *why* you do it. I can read code so I know that `hasBuff` checks if someone has a buff, but if it's not obvious why that buff is relevant then include it as a comment (you're free to assume anyone reading your code knows the spec, so this example would have to be pretty weird to warrant a comment).

Please don't get angry when I reformat your code or change it to be cleaner (e.g. replace manual `byPlayer` checks with the function name shorthand). I find code consistency important. I should probably setup a good code style linter and/or fixer.
