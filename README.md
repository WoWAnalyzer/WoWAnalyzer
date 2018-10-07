<h1>
  <img src="https://user-images.githubusercontent.com/4565223/45639348-0a9ef480-bab0-11e8-8688-66e51c80224a.png" height="36" valign="bottom" /> WoWAnalyzer
  <a href="https://travis-ci.org/WoWAnalyzer/WoWAnalyzer">
   <img src="https://travis-ci.org/WoWAnalyzer/WoWAnalyzer.svg?branch=master">
  </a>
</h1>

> WoWAnalyzer is a tool to help you analyze and improve your World of Warcraft raiding performance through various relevant metrics and gameplay suggestions.

[https://wowanalyzer.com](https://wowanalyzer.com)

## Getting started

Before starting, make sure you have the following:
- [git](https://git-scm.com/)
  - Optional: Get a UI such as [GitHub Desktop](https://desktop.github.com/) or [TortoiseGit](https://tortoisegit.org/)
- [Node.js](https://nodejs.org/). We recommend the *current* version.

To get the code running on your computer you will need a few things. You might already have a bunch of things, feel free to skip ahead.

1. [**Make a *fork* of the repo**](https://help.github.com/articles/fork-a-repo/); this is your own public copy on GitHub for you to work in before sharing it.
2. **Clone your fork to your computer.** Open your fork on GitHub, click the green "Clone of download" button, and copy the HTTPS link (or SSH if you have that setup). Then run `git clone <paste link>`
3. Open a command window to the cloned repo.
4. Run this command: `npm install`, this will take a minute the first time.
5. Meanwhile:
    1. Go to project root
    2. Copy the `.env.local.example` file in the same directory
    3. Name it `.env.local`
    4. Go to https://www.warcraftlogs.com/profile to get your WCL API key (at the bottom)
    5. On that page just above the API key, enter "WoWAnalyzer (development)" as the application name
    5. Open `.env.local` with your IDE and replace `INSERT_YOUR_OWN_API_KEY_HERE` in `.env.local` with your _public_ API key
6. You're done installing once `npm install` finishes.

<table align="center">
  <tr>
    <td align="center" width="150"><img src="https://www.docker.com/sites/default/files/mono_horizontal_large.png" alt="Docker"></td>
    <td>There's also a Docker container available so you don't have to install any software other than Git (and your IDE). Follow steps 1-3 and do the <code>.env.local</code> thing and then fire up the Docker container with <code>docker-compose up dev</code> (first start might take a few minutes). Just like the regular development environment it will automatically recompile your code and refresh your browser whenever you make changes to the code so long as it is running.</td>
  </tr>
</table>

See the [contributing guidelines](CONTRIBUTING.md) for further information.

## Collaboration

All contributions, big or small, are welcome. You are welcome to contribute to this project with whatever level of contribution you are comfortable with. We have no expectations for the amount or frequency of contributions from anyone.

We want to share ownership and responsibility with the community where possible. To help with this we hand out *write access* when we deem pull requests consistently of sufficient quality. This isn't always on our mind though so if you think you qualify please contact an admin.

## Vision

This project aims to give users tools to analyze their performance. The most important part of this is providing automated suggestions towards improving their performance based on recorded fights. This makes it so users can quickly, without any hassle and at any time consult this tool to find out points of improvement for their next pull.

Our focus:
 - Focus on one player at a time. A major reason for this is simplicity and giving the user a feeling of importance, but also because the Warcraft Logs API effectively only makes this available.
 - The priority is raid fights, other environments aren't really supported. While it would be nice to show things like who killed the most Explosive Orbs, we can't really with the API endpoints available to us.
 - Clear and concise suggestions that allow a user to quickly understand what potential issues and changes they need to make to improve. No hassle.

We also provide more advanced statistics such as item performance displays. These can be used to help pick what item to use or to see how effective certain abilities are that you can't find out elsewhere. These are secondary to suggestions and other tools that can be used to improve one's performance.

## License

See the [LICENSE](LICENSE) file.

Usage of any API keys found in the source is not allowed for other purposes than described in the source code and/or its documentation. You must at all times use your own API keys.
