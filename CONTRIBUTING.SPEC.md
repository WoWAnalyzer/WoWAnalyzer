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

The most useful things to do are to add information that isn't yet easily available and to fine-tune the suggestions so that they give the best possible recommendations to people.

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
