import Express from 'express';
import Passport from 'passport';
import { Strategy as PatreonStrategy } from 'passport-patreon';

import models from 'models';

const User = models.User;

const router = Express.Router();

Passport.use(new PatreonStrategy(
  {
    clientID: process.env.PATREON_CLIENT_ID,
    clientSecret: process.env.PATREON_CLIENT_SECRET,
    callbackURL: process.env.PATREON_CALLBACK_URL,
    scope: 'users pledges-to-me',
  },
  async function (accessToken, refreshToken, profile, done) {
    // passport-patreon removes data we need from `profile`, so re-extract the raw data received
    const raw = profile._raw;
    const fullProfile = JSON.parse(raw);

    // const fullProfile = require('./__fixtures__/patreon-active.json');

    const id = fullProfile.data.id;
    const name = fullProfile.data.attributes.full_name;

    if (process.env.NODE_ENV === 'development') {
      console.log('Patreon login:', fullProfile);
    } else {
      console.log(`Patreon login by ${name} (${id})`);
    }

    const avatar = fullProfile.data.attributes.image_url;
    // There is NO pledge data available at all as soon as a user deletes their pledge, so we're unable to give them their Premium for the remainder of the month. This isn't something we can fix, so all we can do is apologize to our users. :(
    const pledge = fullProfile.included && fullProfile.included.find(item => item.type === 'pledge');
    const pledgeAmount = pledge ? pledge.attributes.amount_cents : null;

    // Reward info needs to get the reward id from the pledge's relations. Since we don't use it yet, I didn't want to spend time implementing it.
    // const reward = fullProfile.included && fullProfile.included.find(item => item.type === 'reward');
    // const rewardId = reward ? reward.id : null;
    // const rewardTitle = reward ? reward.attributes.title : null;

    const user = await User.create({
      patreonId: id,
      data: {
        name,
        avatar,
        patreon: {
          id,
          pledgeAmount,
          checked: new Date(),
          // rewardId,
          // rewardTitle,
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
