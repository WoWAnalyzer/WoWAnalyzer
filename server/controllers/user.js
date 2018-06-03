import Express from 'express';

import requireAuthenticated from 'helpers/requireAuthenticated';
import { getGitHubLastCommitDate } from 'helpers/github';

const router = Express.Router();

const GITHUB_COMMIT_PREMIUM_DAYS = 30;

async function getPatreonFromUser(data) {
  if (!data.patreon) {
    return undefined;
  }
  return {
    premium: data.patreon.pledgeAmount >= 100,
  };
}
async function getGitHubFromUser(data) {
  if (!data.github || !data.github.login) {
    return undefined;
  }
  const lastCommitDate = await getGitHubLastCommitDate(data.github.login);
  if (!lastCommitDate) {
    return undefined;
  }
  const premiumExpiry = new Date(lastCommitDate + (GITHUB_COMMIT_PREMIUM_DAYS * 24 * 3600 * 1000));
  // TODO: Store date in user object and only refresh after it expired and allow user to manually refresh it

  return {
    premium: Date.now() < premiumExpiry,
    expires: premiumExpiry,
  };
}

if (process.env.UNSAFE_ACCESS_CONTROL_ALLOW_ALL) {
  // When developing it might be nice to run the front-end webpack dev server on a different port from the back-end server and route API calls to the local server instead of production. The .env.development sets this to *. It's unset in production.
  router.all('/', function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', req.headers['origin'] || '*');
    res.setHeader('Access-Control-Allow-Credentials', true);

    next();
  });
}
router.get('/', requireAuthenticated, async function(req, res) {
  const user = req.user;
  const data = user.data;

  const patreon = await getPatreonFromUser(data);
  const github = await getGitHubFromUser(data);

  res.json({
    name: data.name,
    avatar: data.avatar,
    patreon,
    github,
    premium: (patreon && patreon.premium) || (github && github.premium),
  });
});

export default router;
