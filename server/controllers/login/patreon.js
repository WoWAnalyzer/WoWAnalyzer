import Express from 'express';
import Passport from 'passport';
import { Strategy as PatreonStrategy } from 'passport-patreon';

import models from 'models';
import { fetchPatreonProfile } from 'helpers/patreon';

const User = models.User;

const router = Express.Router();

Passport.use(new PatreonStrategy(
  {
    clientID: process.env.PATREON_CLIENT_ID,
    clientSecret: process.env.PATREON_CLIENT_SECRET,
    callbackURL: process.env.PATREON_CALLBACK_URL,
    scope: 'users pledges-to-me',
    skipUserProfile: true, // less unnecessary and duplicate code if we manually do this the same everywhere
  },
  async function (accessToken, refreshToken, _, done) {
    const patreonProfile = await fetchPatreonProfile(accessToken, refreshToken);

    if (process.env.NODE_ENV === 'development') {
      console.log('Patreon login:', patreonProfile);
    } else {
      console.log(`Patreon login by ${patreonProfile.name} (${patreonProfile.id})`);
    }

    const user = await User.create({
      patreonId: patreonProfile.id,
      data: {
        name: patreonProfile.name,
        avatar: patreonProfile.avatar,
        patreon: {
          pledgeAmount: patreonProfile.pledgeAmount,
          updatedAt: new Date(),
          accessToken,
          refreshToken,
        },
      },
    });

    done(null, user);
  }
));

router.get('/', Passport.authenticate('patreon'));
router.get('/callback', Passport.authenticate('patreon', {
  successRedirect: process.env.LOGIN_REDIRECT_LOCATION,
  failureRedirect: process.env.LOGIN_REDIRECT_LOCATION,
}));

export default router;
