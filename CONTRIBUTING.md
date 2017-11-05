# Contributing

<img align="right" src="http://i.imgur.com/k8NZMmV.gif">

Hey, welcome! Awesome you're interested in helping out! This should help get you started. If you have any questions the WoW Analyzer Discord is the place to ask: https://discord.gg/AxphPxU



# Installing

To get the code running on your computer you will need a few things. You might already have a bunch of things, feel free to skip ahead.

1. [Make a *fork* of the repo](https://help.github.com/articles/fork-a-repo/); this is your own public copy on GitHub for you to work in before sharing it.
2. [Get Git.](https://git-scm.com/) You can also consider installing the [GitHub Desktop](https://desktop.github.com/) client to get an interface to work with.
3. Clone your fork to your computer.
4. [Get NodeJS (6+, it's recommended to get the "current" edition).](https://nodejs.org/en/)
5. Open a command window to the cloned repo (do this after installing Node).
6. Run this command: `npm install`, this will take a minute.
7. Meanwhile:
    1. Go to project root
    2. Copy `.env.local.example` in the same directory
    3. Name it `.env.local`
    4. Go to https://www.warcraftlogs.com/accounts/changeuser to get your WCL API key (at the bottom)
    5. Open `.env.local` with your IDE and replace `INSERT_YOUR_OWN_API_KEY_HERE` in `.env.local` with your API key
8. You're done once `npm install` finishes.

<table align="center">
  <tr>
    <td align="center" width="150"><img src="https://www.docker.com/sites/default/files/mono_horizontal_large.png" alt="Docker"></td>
    <td>There's also a Docker container available so you don't have to install any software other than Git (and your IDE). Follow steps 1-3 and do the <code>.env.local</code> thing and then fire up the Docker container with <code>docker-compose up dev</code> (first start might take a few minutes). Just like the regular development environment it will automatically recompile your code and refresh your browser whenever you make changes to the code so long as it is running.</td>
  </tr>
</table>

# Running

 * run this command: `npm start`

Your command window should now start compiling the application and if all went well open a browser tab to http://localhost:3000/ with everything running :)

<table align="center">
  <tr>
    <td align="center" width="150"><img src="https://www.docker.com/sites/default/files/mono_horizontal_large.png" alt="Docker"></td>
    <td>If you're using the Docker dev container it won't automatically open a browser tab. Sorry. That should be the only difference.</td>
  </tr>
</table>

![Thumbs up!](https://media.giphy.com/media/111ebonMs90YLu/giphy.gif)

## Troubleshooting

If you are currently dealing with some path errors (module not found), instead of running `npm start`, run `NODE_PATH=src/ npm run start`.

If you are getting `Error: Invalid key specified`, ensure your key is correct in `.env.local` and restart `npm start` after changing the file so the new value is loaded (.env files are cached).

If you are getting an error about a missing module or library you might have to update your dependencies. Run `npm install` or `docker-compose build dev` if you're using the Docker container. Make sure there's no running `npm start` or `npm test` when you do as they might lock files.

# Editing

Make a feature branch `git checkout -b my-new-feature`. Start small. Try changing something to see things change (your browser should refresh automatically after automatically recompiling). If you verified everything is working, you're ready to go to the real stuff.

Looking into the Holy Paladin implementation is a great way to find out how to do things. This spec is usually the most up-to-date with the best practices in this project.

How to develop parts of the app is further explained in the following files:
- [CONTRIBUTING.SPEC.md](CONTRIBUTING.SPEC.md): Information on how to create a spec.
- [CONTRIBUTING.MODULE.md](CONTRIBUTING.MODULE.md): Information on how to create a module.

Continue reading below for more general contribution information.

# Quick start

We're using *EcmaScript 6* for code, this is a modern version of JavaScript. Code is transpiled from ES6 to JS with the `npm start` command whenever you make changes to anything, and the browser then automatically refreshes. This usually takes 1 to 3 seconds. If you want to know more about the DevOps for the front-end see the [Create React App readme](cra-README.md).

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

If you're curious what GitHub name links to who on Discord see [CONTRIBUTORNAMES.md](CONTRIBUTORNAMES.md).

<table align="center">
  <tr>
    <td align="center" width="100"><img src="https://cdn1.iconfinder.com/data/icons/CrystalClear/48x48/apps/important.png" alt="Important"></td>
    <td>Please make small Pull Requests. One pull request per feature is preferred, which generally means 1 PR per module. Larger PRs may take a longer time to be reviewed and merged.</td>
  </tr>
</table>

# Code review

Our code review guidelines can be found [here](docs/code-reviews.md). TL;DR: Fix errors in the `npm start` window, make sure your code is maintainable and doesn't have anything that could result in a bug or incorrect results.
