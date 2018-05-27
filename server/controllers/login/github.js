import Express from 'express';
import Passport from 'passport';
import request from 'request-promise-native';
import { Strategy as GitHubStrategy } from 'passport-github';

const router = Express.Router();

Passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL,
  },
  async function(accessToken, refreshToken, profile, done) {
    // passport-patreon removes data we need from `profile`, so re-extract the raw data received
    const fullProfile = profile._json;

    // This will only get commits to master, but this should generally be sufficient.
    const url = `https://api.github.com/repos/WoWAnalyzer/WoWAnalyzer/commits?client_id=${process.env.GITHUB_CLIENT_ID}&client_secret=${process.env.GITHUB_CLIENT_SECRET}&author=${fullProfile.login}`;
    const lastCommitDate = await request.get({
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

    done(null, {
      name: fullProfile.name,
      avatar: fullProfile.avatar_url,
      github: {
        id: fullProfile.id,
        login: fullProfile.login,
        lastCommitDate,
        accessToken,
        refreshToken,
      },
    });
  }
));

router.get('/', Passport.authenticate('github'));
router.get(
  '/callback',
  Passport.authenticate('github', {
    successRedirect: '/premium',
    failureRedirect: '/premium',
  }),
  function (req, res) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.send(JSON.stringify(req.user));
  }
);

export default router;
