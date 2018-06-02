import Express from 'express';

import requireAuthenticated from 'helpers/requireAuthenticated';
import request from 'request-promise-native';

const router = Express.Router();

const GITHUB_COMMIT_PREMIUM_DAYS = 30;
async function getGitHubLastCommitDate(login) {
  // This will only get commits to master, but that should generally be sufficient.
  const url = `https://api.github.com/repos/WoWAnalyzer/WoWAnalyzer/commits?client_id=${process.env.GITHUB_CLIENT_ID}&client_secret=${process.env.GITHUB_CLIENT_SECRET}&author=${login}`;
  const lastCommitDateString = await request.get({
    url: url,
    headers: {
      'User-Agent': 'WoWAnalyzer.com API',
    },
    gzip: true, // using gzip is 80% quicker
  })
    .then(jsonString => JSON.parse(jsonString))
    .then(json => {
      if (!json || json.length === 0) {
        return null;
      }
      // We only need the most recent commit
      return json[0];
    })
    .then(commit => commit ? commit.commit.committer.date : null);

  return lastCommitDateString ? Date.parse(lastCommitDateString) : null;
}
function isWithinDays(date, days) {
  const now = Date.now();
  const secondsSinceLastCommit = (now - date) / 1000;
  const secondsPerMonth = 3600 * 24 * days;
  return secondsSinceLastCommit < secondsPerMonth;
}
async function isGitHubPremiumEligible(login) {
  const lastCommitDate = await getGitHubLastCommitDate(login);
  if (!lastCommitDate) {
    return false;
  }
  return isWithinDays(lastCommitDate, GITHUB_COMMIT_PREMIUM_DAYS);
}

router.get('/', requireAuthenticated, async function(req, res) {
  const user = req.user;

  let premium = false;
  if (user.patreon && user.patreon.pledgeAmount >= 100) {
    premium = true;
  }
  if (user.github && user.github.login) {
    premium = await isGitHubPremiumEligible(user.github.login);
  }

  res.json({
    name: user.name,
    avatar: user.avatar,
    premium: premium,
  });
});

export default router;
