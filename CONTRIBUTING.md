# Contributing

Hey, welcome! Awesome you're interested in helping out! This should get you along the way. If you have any questions the WoW Analyzer Discord is the place to ask: https://discord.gg/AxphPxU

# Installing

 * Get Git.
 * Clone the repo.
 * Get Node (6+): https://nodejs.org/en/
 * Open a command window to the cloned repo (do this after installing Node).
 * run this command: `npm install`
 * Meanwhile:
    * Go to project root
    * Copy `.env.local.example`
    * Paste it in the same directory with the name `.env.local`
    * Go to https://www.warcraftlogs.com/accounts/changeuser to get your API key (at the bottom)
    * Replace `INSERT_YOUR_OWN_API_KEY_HERE` in `env.local` with your API key

# Running

 * run this command: `npm start`

Your command window should now start compiling the application and if all went well open a browser window with everything running :)

## Troubleshooting

If you are currently dealing with some path errors (module not found), instead of running `npm start`, run `NODE_PATH=src/ npm run start`.

# Editing

Start small. Try changing something to see things change. If you verified everything is working, you're ready to go to the real stuff.

The easiest things to contribute are specific modules for statistics such as from spells, traits or items. Go through the Parser directory to see how everything is set up. Once you've decided what you want to add, make a new file in the right directory. Here's a template you can use:

```js
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

import Module from 'Parser/Core/Module';

class MyCuteRock extends Module {
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
}

export default MyCuteRock;
```

This is the worker behind the statistic. The `on_` functions are your event listeners. Through some magic these functions get called whenever an event with their name is triggered. See [EVENTS.md](EVENTS.md) for the available events.

The `byPlayer` (and `toPlayer`) part of the function names are just there for ease of use; these make sure only events done **by the player** or **to the player** are listened to. Purely convenience, you can also just do `on_cast` and filter inside with `if (!this.owner.byPlayer(event)) { return; }`, but putting that everywhere gets messy quickly. Do note **only events that involve the selected player are available for performance reasons**, so if you wanted to listen to events when other players take damage you're out of luck (but the selected player taking damage is of course available at `on_toPlayer_damage`).

The file you just made still doesn't do anything as it hasn't been enabled in a parser yet. I assume you're working on a spec specific statistic, let's say for Holy Paladin. Go to `Parser/HolyPaladin/CombatLogParser.js`. Import your new module next to the other imports, for example: `import MyCuteRock from './Modules/Items/MyCuteRock';`, then scroll down to the `specModules` static property. Add your module: `myCuteRock: MyCuteRock,`, now it is active but still not visible.

You can add your new statistic to the results page by adding it in the `generateResults` method of the `CombatLogParser` you just modified. If it's an item add it to the items list, just duplicate an existing item and change its values as desired. Please keep the displayed content consistent with the rest of the interface. Most statistics are single line, so that should be your goal too. And if it's a mana trinket you should show the same text as is shown for similar mana trinkets.

# Contributing

When done commit your work.
Then make a pull request, the easiest way to do this is through the GitHub interface. If you cloned it will show a "Create pull request" button in your repository page, if you're using the interface it should be there somewhere too. Explain why what you did matters and why you did what you did (although if you have to explain why you did what you did then you should probably include that as comments in your code).

Don't forget to update the changelog, but only include changes that users might notice.

# Code style

Please try to respect the eslint rules.

Please never comment *what* you do, comment *why* you do it. I can read code so I know that `hasBuff` checks if someone has a buff, but if it's not obvious why that buff is relevant then include it as a comment (you're free to assume anyone reading your code knows the spec, so this example would have to be pretty weird to warrant a comment).

# Consistency

Many users parse logs for multiple specs, having everything consistent makes it easier to understand and compare different things between specs. Please try to stay as consistent as possible with other specs and similar statistics.

Examples:
* The first two statistics are always *Healing/damage done* and *Non healing/dead gcd time*.
* When space is limited, show the DPS/HPS amounts instead of percentage of total damage/healing as much as possible. The HPS amounts often have the same results even if someone's total performance is either super high or super low, so they make comparison easier.
* If you're showing the performance of an item try to use the *X.XX % / XXk HPS* format and show detailed information in the tooltip.
* Try to keep statististic boxes and item values one liners and if necessary move details to the tooltip.
* Don't add useless tooltips; only add tooltips for necessary or additional information. If tooltips are always useful they're more likely to be read.
* Don't show "intellect" (primary stat) amounts as if they're some sort of indication of something's performance. This is too inaccurate and vague.

If you're planning on working on a radical idea I recommend discussing it before you invest a lot of time. It would be a shame if your idea does not fit the project and your work was for naught. Example:
* Don't convert primary/secondary stats into DPS/HPS values. I'm open to giving this a try, but it needs to be thought through extensively and you'll need to convince it's accurate enough. The buff uptime or average stat gain is probably the most accurate information you could show. This also goes for resources such as mana.
