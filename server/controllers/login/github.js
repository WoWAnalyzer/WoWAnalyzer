import Express from 'express';
import Passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github';

import models from 'models';
import { fetchGitHubLastCommitDate } from 'helpers/github';

const User = models.User;

const router = Express.Router();

Passport.use(new GitHubStrategy(
  {
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL,
  },
  async function (accessToken, refreshToken, originalProfile, done) {
    // The passport strategy removes data we need from `profile`, so re-extract the raw data received
    const profile = originalProfile._json;

    const id = profile.id;
    const login = profile.login;
    const name = profile.name || login; // name is optional on GitHub

    if (process.env.NODE_ENV === 'development') {
      console.log('GitHub login:', profile);
    } else {
      console.log(`GitHub login by ${name} (${id} - ${login})`);
    }

    const lastContribution = await fetchGitHubLastCommitDate(login);

    const user = await User.create({
      gitHubId: id,
      data: {
        name,
        avatar: profile.avatar_url,
        github: {
          login,
          lastContribution,
          updatedAt: new Date(),
          accessToken,
          refreshToken,
        },
      },
    });

    done(null, user);
  }
));

router.get('/', Passport.authenticate('github'));
router.get('/callback', Passport.authenticate('github', {
  successRedirect: process.env.LOGIN_REDIRECT_LOCATION,
  failureRedirect: process.env.LOGIN_REDIRECT_LOCATION,
}));

export default router;
