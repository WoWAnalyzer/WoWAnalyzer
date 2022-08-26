<h1>
  <img src="https://user-images.githubusercontent.com/4565223/54240739-2d6e0b00-451f-11e9-8473-d15e78914c9b.png" height="36" valign="bottom" /> WoWAnalyzer
</h1>

> WoWAnalyzer is a tool to help you analyze and improve your World of Warcraft raiding performance through various relevant metrics and gameplay suggestions.

[https://wowanalyzer.com](https://wowanalyzer.com)

## New to Open Source?

This guide is an excellent introduction and explains all the jargon we may use: https://medium.com/clarifai-champions/99-pr-oblems-a-beginners-guide-to-open-source-abc1b867385a

If you ever get stuck or want to have a chat, join us on our [Discord](https://wowanalyzer.com/discord) server. We love to hear what you're (going to be) working on!

Our docs aren't very good, but we have a really fun and helpful developer community on Discord. So please consider joining and reaching out if you need help. Be bold!

## Getting started

First make sure you have the following:

- [git](https://git-scm.com/)
  - Optional: Get a UI such as [Fork](https://git-fork.com/) or [TortoiseGit](https://tortoisegit.org/)
- [Node.js](https://nodejs.org/). We recommend the _LTS_ version.
- [Yarn 1](https://yarnpkg.com/en/docs/install)

Now you need to pull a copy of the codebase onto your computer. Make a fork of the repo by clicking the **Fork** button at the top of this page. Next, click the green button **Clone or download** and copy your _Clone with HTTPS_ URL, and then run the command `git clone <paste link>`. This will take a minute.

When cloning finishes, open a command window to the source and run the command `yarn`. This will take a minute or two the first time. While it's running, copy the `.env.local.example` file in the project root, and name it `.env.local`. Now you need to fill the WCL API key. To get your key, login to Warcraft Logs and go to [your profile](https://www.warcraftlogs.com/profile). Scroll to the bottom, enter the **V1 Client Name** "WoWAnalyzer (development)" (this is required) and copy the **V1 Client Key**, then replace `INSERT_YOUR_OWN_API_KEY_HERE` in `.env.local` with this key.

Optionally if you're on a bash compatible machine, you can run `scripts/setup` for an interactive setup of this application.

Once all that's done you're ready to fire up the development server! Just run the command `yarn start` in the project root. The first start may take a few minutes as it has to compile everything. This does get cached, so that any code changes while the server is already running will be compiled much quicker.

<table align="center">
  <tr>
    <td align="center" width="150"><img src="https://www.docker.com/wp-content/uploads/2022/03/horizontal-logo-monochromatic-white.png" alt="Docker"></td>
    <td>Alternatively <b>there's a Docker container available</b> so you don't have to install any software other than Git (and your IDE with its dependencies which likely includes Node.js). Follow the above steps, skipping all `yarn` commands, and then fire up the Docker container with <code>docker-compose up dev</code> (first start might take a few minutes). Just like the regular development environment it will automatically recompile your code and refresh your browser whenever you make changes to the code so long as it is running. The app will be available at <a href="http://localhost:3000/">http://localhost:3000/</a>.</td>
  </tr>
</table>

### Troubleshooting

If you are getting `Error: Invalid key specified`, ensure your key is correct in `.env.local` and restart `yarn start` after changing the file so the new value is loaded (.env files are cached).

If you are getting an error about a missing module or library you might have to update your dependencies. Run `yarn install` or `docker-compose build dev` if you're using the Docker container. Make sure there's no running `yarn start` or `yarn test` when you do as they might lock files.

## Contributing

See the [contributing guidelines](CONTRIBUTING.md) for further information.
