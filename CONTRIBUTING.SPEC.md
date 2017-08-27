# Contributing a new spec

Adding a spec isn't that hard, but it does take a little bit of your time defining all the spells and related things.

1. The easiest way to start is by copy pasting the HolyPaladin folder in `src/Parser`. Name it the full name of the spec you want to work on. I'll call your spec NewSpec from now on.
2. Open `src/Parser/NewSpec/CONFIG.js` and change the `spec` property to your spec (in my case `SPECS.NEW_SPEC`), if your IDE is set up properly auto complete should provide you with the available options. Change the maintainer name as desired.
3. Open `src/Parser/AVAILABLE_CONFIGS.js` and duplicate an import line and add the spec to the object at the bottom.
4. When you save your spec should now be supported and shown in the player selection list. Clicking it probably won't work yet though, as the Holy Paladin modules aren't compatible with your spec.
5. Go into the NewSpec folder and start deleting stuff you don't need. Delete the `Images` folder, and delete all modules except `AlwaysBeCasting`, `CastEfficiency`, and `CooldownTracker`. You can look at the modules you're deleting if they may be useful to your spec, but you can also do this later as it's easier to continue from a mostly blank slate.
6. Open `src/Parser/NewSpec/CombatLogParser.js` and start deleting the dead references (this would be easiest if your IDE shows this). Then delete all the module entries except for the modules you didn't delete.
7. Delete all methods from the CombatLogParser except `generateResults()`. Adding methods to CombatLogParser to manipulate things is pretty advanced usage that you shouldn't need initially.
8. When you save your NewSpec should now work properly!
9. Now you can start adding modules, look at other specs for how to do things. The Holy Paladin implementation is usually the most up-to-date analyzer, so that's the best place to look at.
10. Don't forget to change the `src/Parser/NewSpec/TALENT_DESCRIPTIONS.js` file. If you decide to use talent descriptions from a guide, you should ask for permission first.

ps. Tests can be added in the `src/tests` folder. Automated tests are recommended, although there aren't many examples yet. :(
