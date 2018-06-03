import Express from 'express';

import requireAuthenticated from 'helpers/requireAuthenticated';
import { getGitHubLastCommitDate } from 'helpers/github';

const router = Express.Router();

const GITHUB_COMMIT_PREMIUM_DAYS = 30;
function isWithinDays(date, days) {
  const now = Date.now();
  const secondsSinceLastCommit = (now - date) / 1000;
  const secondsPerMonth = 3600 * 24 * days;
  return secondsSinceLastCommit < secondsPerMonth;
}
export async function isGitHubPremiumEligible(login) {
  const lastCommitDate = await getGitHubLastCommitDate(login);
  // TODO: Store date in user object and only refresh after it expired
  if (!lastCommitDate) {
    return false;
  }
  return isWithinDays(lastCommitDate, GITHUB_COMMIT_PREMIUM_DAYS);
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

  const patreon = data.patreon ? {
    premium: data.patreon.pledgeAmount >= 100,
  } : undefined;
  const github = data.github ? {
    premium: data.github.login && await isGitHubPremiumEligible(data.github.login),
  } : undefined;

  res.json({
    name: data.name,
    avatar: data.avatar,
    patreon,
    github,
    premium: (patreon && patreon.premium) || (github && github.premium),
  });
});

export default router;
