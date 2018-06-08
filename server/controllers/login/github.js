import Express from 'express';
import Passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github';

import models from 'models';

const User = models.User;

const router = Express.Router();

Passport.use(new GitHubStrategy(
  {
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL,
  },
  async function (accessToken, refreshToken, profile, done) {
    // The passport strategy removes data we need from `profile`, so re-extract the raw data received
    const fullProfile = profile._json;

    const id = fullProfile.id;
    const name = fullProfile.name;

    if (process.env.NODE_ENV === 'development') {
      console.log('GitHub login:', fullProfile);
    } else {
      console.log(`GitHub login by ${name} (${id})`);
    }

    const user = await User.create({
      gitHubId: id,
      data: {
        name: name,
        avatar: fullProfile.avatar_url,
        github: {
          id: fullProfile.id,
          login: fullProfile.login,
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
