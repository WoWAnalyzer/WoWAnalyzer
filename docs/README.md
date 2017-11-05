# Contributing

<img align="right" src="http://i.imgur.com/k8NZMmV.gif">

Hey, welcome! Awesome you're interested in helping out! This should help get you started. If you have any questions the WoW Analyzer Discord is the place to ask: https://discord.gg/AxphPxU


# Installing

Installation instructions can be found [here](installing.md). It's a one-time thing and pretty quick.

# Editing

Make a feature branch `git checkout -b my-new-feature`. Start small. Try changing something to see things change (your browser should refresh automatically after automatically recompiling). If you verified everything is working, you're ready to go to the real stuff.

Looking into the Holy Paladin implementation is a great way to find out how to do things. This spec is usually the most up-to-date with the best practices in this project.

How to develop parts of the app is further explained in the following files:
- [a-new-spec.md](a-new-spec.md): Information on how to create a spec.
- [a-new-module.md](a-new-module.md): Information on how to create a module.

Continue reading below for more general contribution information.

# Quick start

We're using *EcmaScript 6* for code, this is a modern version of JavaScript. Code is transpiled from ES6 to JS with the `npm start` command whenever you make changes to anything, and the browser then automatically refreshes. This usually takes 1 to 3 seconds. If you want to know more about the DevOps for the front-end see the [Create React App readme](../cra-README.md).

If you want to learn (modern) JavaScript these book series are recommended: https://github.com/getify/You-Dont-Know-JS

The main structure of the project is as follows:

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

Our code review guidelines can be found [here](docs/code-reviews.md). TL;DR: Fix errors in the `npm start` window, make sure your code is maintainable and doesn't have anything that could result in a bug or incorrect results.
