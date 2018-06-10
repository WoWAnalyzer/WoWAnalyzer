import Express from 'express';

import requireAuthenticated from 'helpers/requireAuthenticated';
import { refreshPatreonProfile } from 'helpers/patreon';
import { refreshGitHubLastContribution } from 'helpers/github';

const router = Express.Router();

const GITHUB_COMMIT_PREMIUM_DURATION = 30 * 24 * 3600 * 1000;
// Don't refresh the 3rd party status more often than this, improving performance of this API and reducing the number of API requests to the third parties.
const PATREON_REFRESH_INTERVAL = 7 * 24 * 3600 * 1000;
const GITHUB_REFRESH_INTERVAL = 7 * 24 * 3600 * 1000;

function timeSince(date, now = Date.now()) {
  return now - date;
}
function hasPatreonPremium(user) {
  return user.data.patreon && user.data.patreon.pledgeAmount >= 100;
}
function githubLastCommitDate(user) {
  return new Date(user.data.github.lastContribution);
}
function hasGitHubPremium(user) {
  return user.data.github && timeSince(githubLastCommitDate(user)) < GITHUB_COMMIT_PREMIUM_DURATION;
}
function githubExpiryDate(user) {
  return new Date(+githubLastCommitDate(user) + GITHUB_COMMIT_PREMIUM_DURATION);
}

if (process.env.UNSAFE_ACCESS_CONTROL_ALLOW_ALL) {
  // When developing it might be nice to run the front-end webpack dev server on a different port from the back-end server and route API calls to the local server instead of production. The .env.development enables this automatically. It's unset in production.
  router.all('/', function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', req.headers['origin'] || '*');
    res.setHeader('Access-Control-Allow-Credentials', true);

    next();
  });
}
router.get('/', requireAuthenticated, async function(req, res) {
  const user = req.user;

  const response = {
    name: user.data.name,
    avatar: user.data.avatar,
  };

  if (user.data.patreon) {
    const isOutdated = timeSince(new Date(user.data.patreon.updatedAt)) > PATREON_REFRESH_INTERVAL;
    if (isOutdated) {
      await refreshPatreonProfile(user);
    }
  }
  let githubRefreshed = false;
  if (user.data.github) {
    const isOutdated = timeSince(new Date(user.data.github.updatedAt)) > GITHUB_REFRESH_INTERVAL;
    if (isOutdated) {
      await refreshGitHubLastContribution(user);
      githubRefreshed = true;
    }
  }

  if (hasPatreonPremium(user)) {
    response.premium = true;
    response.patreon = {
      premium: true,
    };
  }
  if (hasGitHubPremium(user)) {
    const expiryDate = githubExpiryDate(user);
    const now = new Date();
    if (now > expiryDate) {
      if (githubRefreshed) {
        throw new Error('GitHub premium is active but it says it expired. It just refreshed so this should never happen.');
      }
      console.log('Refreshing GitHub since Premium expired.');
      await refreshGitHubLastContribution(user);
    }

    if (hasGitHubPremium(user)) { // it might have changed since the refresh
      response.premium = true;
      response.github = {
        premium: true,
        expires: expiryDate,
      };
    }
  }

  res.json(response);
});

export default router;
