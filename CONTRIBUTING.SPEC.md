# Adding a new spec

You don't need to to do anything special to add a spec. The real issue preventing specs from being added is that in order to add a spec, you need to have the following 3 properties:
1. Know the spec well enough to actually create something useful
2. Know how to program well enough to implement the analysis
3. Have the time and motivation to actually do it

We have worked hard to provide you with many tools to make step 2 as easy as possible. Things such as calculating the dead gcd time (Always Be Casting) and Cast Efficiency have been worked out so that it's a matter of only a few lines of configuration code to get them to work, but more advanced analysis such as the gains from a spec's specific mastery usually require custom code. But you don't worry about that yet; start small.

I recommend adding a new spec in the following order:

1. Add an empty spec (without any analysis)
2. Add a total damage done / healing done / damage taken statistic
3. Add Cast Efficiency
4. Add "Always be Casting" (dead GCD time)
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

# Add an empty spec

1. The easiest way to start is by copy pasting the HolyPaladin folder in `src/Parser`. Name it the full name of the spec you want to work on. I'll call your spec NewSpec from now on.
2. Open `src/Parser/NewSpec/CONFIG.js` and change the `spec` property to your spec (in my case `SPECS.NEW_SPEC`), if your IDE is set up properly auto complete should provide you with the available options. Change the maintainer name as desired.
3. Open `src/Parser/AVAILABLE_CONFIGS.js` and duplicate an import line and add your new spec to the object at the bottom.
4. When you save your spec should now be supported and shown in the player selection list. Clicking it probably won't work yet though, as the Holy Paladin modules aren't compatible with your spec.
5. Go into the NewSpec folder and start deleting stuff you don't need. Delete the `Images` folder, and delete all modules except `AlwaysBeCasting`, `CastEfficiency`, and `CooldownTracker`. You can look at the modules you're deleting if they may be useful to your spec, but you can also do this later as it's easier to continue from a mostly blank slate.
6. Open `src/Parser/NewSpec/CombatLogParser.js` and start deleting the dead references (this would be easiest if your IDE shows this). Then delete all the module entries except for the modules you didn't delete.
7. Delete all methods from the CombatLogParser except `generateResults()`. Adding methods to CombatLogParser to manipulate things is pretty advanced usage that you shouldn't need initially.
8. When you save your NewSpec should now import properly!
9. Now you can start adding modules, look at other specs for how to do things. The Holy Paladin implementation is usually the most up-to-date analyzer, so that's the best place to start looking at.

ps. Tests can be added in the `src/tests` folder. Automated tests are recommended, especially for more complicated parts of your code.

# Add a total damage done / healing done / damage taken statistic

See Holy Paladin's healing done. (more docs coming)

# Add cast efficiency

See Holy Paladin. (more docs coming)

# Add Always be Casting

See Holy Paladin. (more docs coming)

# Create a pull request

See [CONTRIBUTING.md](CONTRIBUTING.md#sharing-your-changes).


