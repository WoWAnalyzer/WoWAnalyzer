# Contributing

<img align="right" src="http://i.imgur.com/k8NZMmV.gif">

Hey, welcome! Awesome you're interested in helping out! This should help get you started. If you have any questions the WoW Analyzer Discord is the place to ask: https://discord.gg/AxphPxU
<br /><br /><br />
# Installing

To get the code running on your computer you will need a few things. You might already have a bunch of things, feel free to skip ahead.

1. [Make a *fork* of the repo](https://help.github.com/articles/fork-a-repo/); this is your own public copy on GitHub for you to work in before sharing it.
2. [Get Git.](https://git-scm.com/) You can also consider installing the [GitHub Desktop](https://desktop.github.com/) client to get an interface to work with.
3. Clone your fork to your computer.
4. [Get NodeJS (6+).](https://nodejs.org/en/)
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
    <td>There's also a Docker container available so you don't have to install any software other than Git. Follow steps 1-3 and do the <code>.env.local</code> thing and then fire up the Docker container with <code>docker-compose up dev</code>. Just like the regular development environment it will automatically recompile your code and refresh your browser whenever you make changes to the code so long as it is running.</td>
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

# Editing

Make a feature branch `git checkout -b my-new-feature`. Start small. Try changing something to see things change (your browser should refresh automatically after automatically recompiling). If you verified everything is working, you're ready to go to the real stuff.

Looking into the Holy Paladin implementation is a great way to find out how to do things. This spec is usually the most up-to-date with the best practices in this project.

How to develop parts of the app is further explained in the following files:
- [CONTRIBUTING.SPEC.md](CONTRIBUTING.SPEC.md): Information on how to create a spec.
- [CONTRIBUTING.MODULE.md](CONTRIBUTING.MODULE.md): Information on how to create a module.

Continue reading below for more general contribution information.

# Sharing your changes

When you are done with your changes you need to [commit your work](http://dont-be-afraid-to-commit.readthedocs.io/en/latest/git/commandlinegit.html). When you're finished, push your changes to your fork, then open the GitHub page for your fork and it should show a button to *Create pull request*, this is often the easiest way to make a pull request. Explain why what you did matters and why you did what you did (although if you have to explain why you did what you did then you should probably include that as comments in your code). Your PR will be reviewed to find potential issues.

<p align="center">
   <img src="https://media.giphy.com/media/l1J3vV5lCmv8qx16M/giphy.gif">
</p>

Don't forget to update the changelog, but only include changes that users might notice.

We work on this project on a voluntary basis with busy schedules. Some days we have a lot of time available to work on it, other days we are very limited. This can lead to slower PR review times, so please bear with us. Our goal is to respond to small PRs within 24 hours, and anything else within 48 hours. Larger or more complex PRs may take longer to be reviewed as we wish to be just as thorough. We strife to never leave an action required on our end for more than 7 days. If you haven't heard anything by then, feel free to ping us as you deem appropriate.

<table align="center">
  <tr>
    <td align="center" width="100"><img src="https://cdn1.iconfinder.com/data/icons/CrystalClear/48x48/apps/important.png" alt="Important"></td>
    <td>Please make small Pull Requests. For example one PR when you got your spec working with Cast Efficiency set up and maybe ABC, and then preferably 1 PR per additional module. Larger PRs may take a long time to be reviewed and merged.</td>
  </tr>
</table>

# Code style

<table align="center">
  <tr>
    <td align="center" width="100"><img src="https://cdn1.iconfinder.com/data/icons/CrystalClear/48x48/apps/important.png" alt="Important"></td>
    <td>The sections below need to be worked out more.</td>
  </tr>
</table>

The eslint rules must be followed to have your PR pass the automatic TravisCI check. These are mostly checks to reveal issues that might indicate bugs. There are no hard code style rules to allow you to develop without worrying about this. If you are in doubt, check the Holy Paladin spec for how things are solved.

Please never comment *what* you do, comment *why* you do it. I can read code so I know that `hasBuff` checks if someone has a buff, but if it's not obvious why that buff is relevant then include it as a comment (you're free to assume anyone reading your code knows the spec, so this example would have to be pretty weird to warrant a comment).

## Consistency

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

![](https://media.giphy.com/media/J1WCiEDZ74RvW/giphy.gif)
