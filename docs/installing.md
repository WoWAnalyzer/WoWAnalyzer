This document explains how to install and run the application locally.

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
