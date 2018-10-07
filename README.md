<h1>
  <img src="https://user-images.githubusercontent.com/4565223/45639348-0a9ef480-bab0-11e8-8688-66e51c80224a.png" height="36" valign="bottom" /> WoWAnalyzer
  <a href="https://travis-ci.org/WoWAnalyzer/WoWAnalyzer">
   <img src="https://travis-ci.org/WoWAnalyzer/WoWAnalyzer.svg?branch=master">
  </a>
</h1>

> WoWAnalyzer is a tool to help you analyze and improve your World of Warcraft raiding performance through various relevant metrics and gameplay suggestions.

[https://wowanalyzer.com](https://wowanalyzer.com)

## Getting started

**NOTE:** Join our server on [Discord](https://wowanalyzer.com/discord) to have a chat and get any assistance needed.

First make sure you have the following:
- [git](https://git-scm.com/)
  - Optional: Get a UI such as [GitHub Desktop](https://desktop.github.com/) or [TortoiseGit](https://tortoisegit.org/)
- [Node.js](https://nodejs.org/). We recommend the *current* version.

Now you need to pull a copy of the codebase onto your computer. Make a fork of the repo by clicking the **Fork** button at the top of this page. Next, click the green button **Clone or download** and copy your *Clone with HTTPS* URL, and then run the command `git clone <paste link>` on your computer. This will take a minute.

When cloning finishes, open a command window to the source and run the command `npm install`. This will take a minute or two the first time. While it's running, copy the `.env.local.example` file in the project root, and name it `.env.local`. Now you need to fill the WCL API key. To get your key login on Warcraft Logs and go to https://www.warcraftlogs.com/profile. Enter an **Application Name** (this is required) and copy the **public key**, and replace `INSERT_YOUR_OWN_API_KEY_HERE` in `.env.local` with this key

Once that's done you're ready to fire up the development server! Just run the command `npm start`. The first start will take another minute.

<table align="center">
  <tr>
    <td align="center" width="150"><img src="https://www.docker.com/sites/default/files/mono_horizontal_large.png" alt="Docker"></td>
    <td>There's also a Docker container available so you don't have to install any software other than Git (and your IDE). Follow the above steps, skipping all `npm` commands and then fire up the Docker container with <code>docker-compose up dev</code> (first start might take a few minutes). Just like the regular development environment it will automatically recompile your code and refresh your browser whenever you make changes to the code so long as it is running.</td>
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
