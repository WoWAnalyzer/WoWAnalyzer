<h1>
  <img src="https://user-images.githubusercontent.com/4565223/45639348-0a9ef480-bab0-11e8-8688-66e51c80224a.png" height="36" valign="bottom" /> WoWAnalyzer
  <a href="https://travis-ci.org/WoWAnalyzer/WoWAnalyzer">
   <img src="https://travis-ci.org/WoWAnalyzer/WoWAnalyzer.svg?branch=master">
  </a>
</h1>

> WoWAnalyzer is a tool to help you analyze and improve your World of Warcraft raiding performance through various relevant metrics and gameplay suggestions.

[https://wowanalyzer.com](https://wowanalyzer.com)

## New to Open Source?

This guide is an excellent introduction and explains all the jargon we may use: https://medium.com/clarifai-champions/99-pr-oblems-a-beginners-guide-to-open-source-abc1b867385a

If you ever get stuck or want to have a chat, join us on our [Discord](https://wowanalyzer.com/discord) server. We love to hear what you're (going to be) working on!

## Getting started

First make sure you have the following:
- [git](https://git-scm.com/)
  - Optional: Get a UI such as [GitHub Desktop](https://desktop.github.com/) or [TortoiseGit](https://tortoisegit.org/)
- [Node.js](https://nodejs.org/). We recommend the *current* version.

Now you need to pull a copy of the codebase onto your computer. Make a fork of the repo by clicking the **Fork** button at the top of this page. Next, click the green button **Clone or download** and copy your *Clone with HTTPS* URL, and then run the command `git clone <paste link>`. This will take a minute.

When cloning finishes, open a command window to the source and run the command `npm install`. This will take a minute or two the first time. While it's running, copy the `.env.local.example` file in the project root, and name it `.env.local`. Now you need to fill the WCL API key. To get your key, login to Warcraft Logs and go to [your profile](https://www.warcraftlogs.com/profile). Scroll to the bottom, enter an **Application Name** (this is required) and copy the **public key**, then replace `INSERT_YOUR_OWN_API_KEY_HERE` in `.env.local` with this key.

Once all that's done you're ready to fire up the development server! Just run the command `npm start` in the project root. The first start will take another minute.

<table align="center">
  <tr>
    <td align="center" width="150"><img src="https://www.docker.com/sites/default/files/mono_horizontal_large.png" alt="Docker"></td>
    <td>There's also a Docker container available so you don't have to install any software other than Git (and your IDE). Follow the above steps, skipping all `npm` commands, and then fire up the Docker container with <code>docker-compose up dev</code> (first start might take a few minutes). Just like the regular development environment it will automatically recompile your code and refresh your browser whenever you make changes to the code so long as it is running. The app will be available at <a href="http://localhost:3000/">http://localhost:3000/</a>.</td>
  </tr>
</table>

### Troubleshooting

If you are currently dealing with some path errors (module not found), instead of running `npm start`, run `NODE_PATH=src/ npm run start`.

If you are getting `Error: Invalid key specified`, ensure your key is correct in `.env.local` and restart `npm start` after changing the file so the new value is loaded (.env files are cached).

If you are getting an error about a missing module or library you might have to update your dependencies. Run `npm install` or `docker-compose build dev` if you're using the Docker container. Make sure there's no running `npm start` or `npm test` when you do as they might lock files.

## Contributing

See the [contributing guidelines](CONTRIBUTING.md) for further information.
