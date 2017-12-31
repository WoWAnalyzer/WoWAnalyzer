# Contributing

<img align="right" src="http://i.imgur.com/k8NZMmV.gif">

Hey, welcome! Awesome you're interested in helping out! This should help get you started. If you have any questions the WoW Analyzer Discord is the place to ask: https://discord.gg/AxphPxU


# Installing

Installation instructions can be found [here](installing.md). It's a one-time thing and pretty quick.

# About the project

We use a modern version of JavaScript (JS) called **EcmaScript 6** (ES6). This has a lot of neat new features that help a lot. We also use a very popular library called [**React**](https://reactjs.org) for rendering things in the browser, the main thing you'll see because of this is **JSX** throughout the codebase. This is *XML-like code* directly in JavaScript. The final thing worth mentioning is that we have our own framework in place to make analysis as easy as possible.

Trying to get familiar with all of this at once might be overwhelming, but you don’t need to know the finer details of how all of this works to get started (it will help for more advanced contributions though). 

If you look at our existing code (and are already familiar with JS) you’ll get familiar with ES6 really quick, nothing really changed, we just have more tools at our disposal. The "weirdest" new thing is perhaps "template literals"; instead of `'Your damage: ' + totalDamageDone` you would write `` `Your damage: ${totalDamageDone}` ``.

React and JSX are used extensively throughout the app and is fairly complex to learn, but unless you want to rewrite things like report selection, player selection and the results page, you don’t need to know a lot about it. The gist is that this:
```jsx
      <StatisticBox
        icon={<SpellIcon id={SPELLS.AURA_OF_MERCY_TALENT.id} />}
        value={`${formatNumber(this.hps)} HPS`}
        label="Healing done"
      />
```
Renders a statistic box like this:
![image](https://user-images.githubusercontent.com/4565223/34463567-51882456-ee60-11e7-8659-3c40fe744ab4.png)
The icon is rendered by `SpellIcon` to which we passed the Aura of Mercy spell id that we have defined in the `SPELLS` object. The value is a template literal I showed earlier, with a formatter to make the number human readable. The label is a plain string. There are more complex posibilities with JSX but you won't need that often. If you want to learn more you can always ask in Discord (or see the links below).

And finally we have our own framework. We have written a lot of classes and components to try and make analysis as easy as possible. More about this in the next chapter.

More info about modern JS: https://github.com/getify/You-Dont-Know-JS
More info about React: https://reactjs.org

# Quick start

We're using *EcmaScript 6* for code, this is a modern version of JavaScript. Code is transpiled from ES6 to JS with the `npm start` command whenever you make changes to anything, and the browser then automatically refreshes. This usually takes 1 to 3 seconds. If you want to know more about the DevOps for the front-end see the [Create React App readme](../cra-README.md).

If you want to learn (modern) JavaScript these book series are recommended: https://github.com/getify/You-Dont-Know-JS

The below image attempts to give you an overview of the app setup. If you're going to be working on a spec specific analysis you will only be working on the blue boxes shown in the image for that specific spec. Each modules (any of the blue boxes except that CombatLogParser) is an isolated class, usually found in the "Modules" folder of a spec. Most modules have dependencies on other modules, most commonly `Combatants` which contains information about the selected player, such as equipped gear and talents.

![App overview](images/app-overview.png)

At this time there are two types of modules: Analyzers and Normalizers.

There are a lot of bugs in combat logs that make analysis harder. Normalizers, which are also known as EventsNormalizers, are used to work around these issues. They receive the full events list prior to analysis and change its order, values or even fabricate new events to make it more consistent, less buggy and easier to analyze. You usually won't have to make your own normalizer and should always try to solve things without one first.

Everything else is called an Analyzer, these modules analyze events to calculate a result.

A few analyzers also trigger custom events so are very similar to EventsNormalizer, this is usually not to fix issues in the combat log but to introduce new events that the combat log does not support (e.g. stat rating changes). This is also pretty advanced and I only mention this so you're not surprised when you run into it.

Most analyzers are completely isolated with no information going out except how to display the results. When you look at the results page you'll see a lot of boxes with information in them, almost every single one of them is a single Analyzer. Suggestions are special in that they're usually mixed all over the place, but it's pretty rare to find a suggestion without a box.

Analyzers can display their results in different sorts of formats: statistic (a box like healing/damage done), item (shows in the item list), suggestion (to show one or more suggestions), a tab (some output is too big for one box), or an "extra panel" which would be another panel underneath the items panel. Obviously the most common ones are statistics (aka statistic boxes), items and suggestions.

Not all analyzers even listen to events, like the [Rule of Law](https://github.com/WoWAnalyzer/WoWAnalyzer/blob/a5087fbd21f86ea3cf5281ab33c2da0f09d9336e/src/Parser/Paladin/Holy/Modules/Talents/RuleOfLaw.js) analyzer which just asks another module for the buff uptime and shows that (that other module takes care of the event listening). Take a look at this module to get a good grasp of a regular analyzer.

A good example of a module that does use events for its analysis is the [Ilterendi](https://github.com/WoWAnalyzer/WoWAnalyzer/blob/a5087fbd21f86ea3cf5281ab33c2da0f09d9336e/src/Parser/Paladin/Holy/Modules/Items/Ilterendi.js#L18) module for the Holy Paladin legendary [Ilterendi, Crown Jewel of Silvermoon](http://www.wowhead.com/item=137046/ilterendi-crown-jewel-of-silvermoon); it increases a player's healing done by 15% when the buff is active. The modules calculates the effective healing done by just this effect. Take a look at this module and notice how we're listening to heal events by the selected player through `on_byPlayer_heal`.

Adding a new analyzer can be as simple as finding a similar one and copying it into your spec folder. Modify it as required and enable it in your CombatLogParser. The CombatLogParser is like a *mission control center* that takes care of enabling modules and passing along events. Each spec has exactly one. For an example see the [Holy Paladin CombatLogParser](https://github.com/WoWAnalyzer/WoWAnalyzer/blob/a5087fbd21f86ea3cf5281ab33c2da0f09d9336e/src/Parser/Paladin/Holy/CombatLogParser.js#L59). Most CombatLogParsers don't have more than just the `specModules` static property. This is a list of all modules you wish to load. Loading does not mean they're also active, a module decides for itself if it's active through its `active` property. If a module is active the `suggestions(when)`, `statistic()`, `item()` methods (and a few others) determine how they're rendered. If you look closely you'll notice that our previously mentioned RuleOfLaw and Ilterendi modules are in this list. This is what causes the Rule of Law statistic box to appear, and the Ilterendi contribution to be visible in the items panel.

That should cover the core basics of the project and should prepare you to dive in and make your own new Analyzer.

The main folder structure of the project is as follows:

 - `/src` has all code for the front-end analysis
   - `/src/common` has a lot of utilities, you'll probably have to add to the `SPELLS` and `ITEMS` at some point if you're adding analyzers.
   - `/src/Main` has core layout stuff, you don't need to enter this at all for analyzers.
   - `/src/Parser` this has all the combat log parsing and analyzers.
     - `/src/Parser/Core` "Core" is the name for everything that's shared across most specs. This folder contains most of the shared JS classes and analyzers.
     - `src/Parser/Paladin` Paladin specific code is here.
     - `src/Parser/Paladin/Holy` Holy Paladin specific code is here, including Holy Paladin "CombatLogParser" which is like a mission control for modules (you enable/disable modules here).
     - `/src/Parser/AVAILABLE_CONFIGS.js` this provides a list of all available specs, when adding a new spec you will have to link it here for it to appear.
   - `/src/tests` **deprecated**, the old test location. Please add new tests next to the file they're testing with the `*.test.js` naming convention.
   - `src/CHANGELOG.js` the changelog for core features (anything all users might notice).
 - `/server` has the code for the back-end (the DiscordBot is in another repo, click the organization to find it)

# Editing

Make a feature branch `git checkout -b my-new-feature`. Start small. Try changing something to see things change (your browser should refresh automatically after automatically recompiling). If you verified everything is working, you're ready to go to the real stuff.

Looking into the Holy Paladin implementation is a great way to find out how to do things. This spec is usually the most up-to-date with the best practices in this project.

How to develop parts of the app is further explained in the following files:
- [a-new-spec.md](a-new-spec.md): Information on how to create a spec.
- [a-new-module.md](a-new-module.md): Information on how to create a module.

Continue reading below for more general contribution information.

# Sharing your changes

When you are done with your changes you need to [commit your work](http://dont-be-afraid-to-commit.readthedocs.io/en/latest/git/commandlinegit.html). When you're finished, push your changes to your fork, then open the GitHub page for your fork and it should show a button to *Create pull request*, this is often the easiest way to make a pull request. Explain why what you did matters and why you did what you did (although if you have to explain why you did what you did then you should probably include that as comments in your code). Your PR will be reviewed to find potential issues.

<p align="center">
   <img src="https://media.giphy.com/media/l1J3vV5lCmv8qx16M/giphy.gif">
</p>

Don't forget to update the changelog, but only include changes that users might notice.

We work on this project on a voluntary basis with busy schedules. Some days we have a lot of time available to work on it, other days we are very limited. This can lead to slower PR review times, so please bear with us. Our goal is to respond to small PRs within 24 hours, and anything else within 48 hours. Larger or more complex PRs may take longer to be reviewed as we wish to be just as thorough. We strife to never leave an action required on our end for more than 7 days. If you haven't heard anything by then, feel free to ping us as you deem appropriate.

If you're curious what GitHub name links to who on Discord see [contributor-names.md](contributor-names.md).

<table align="center">
  <tr>
    <td align="center" width="100"><img src="https://cdn1.iconfinder.com/data/icons/CrystalClear/48x48/apps/important.png" alt="Important"></td>
    <td>Please make small Pull Requests. One pull request per feature is preferred, which generally means 1 PR per module. Larger PRs may take a longer time to be reviewed and merged.</td>
  </tr>
</table>

# Code review

Our code review guidelines can be found [here](code-reviews.md). TL;DR: Fix errors in the `npm start` window, make sure your code is maintainable and doesn't have anything that could result in a bug or incorrect results.
