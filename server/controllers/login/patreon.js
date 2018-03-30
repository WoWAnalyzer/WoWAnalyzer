import Express from 'express';
import Passport from 'passport';
import { Strategy as PatreonStrategy } from 'passport-patreon';

const router = Express.Router();

Passport.use(new PatreonStrategy({
    clientID: process.env.PATREON_CLIENT_ID,
    clientSecret: process.env.PATREON_CLIENT_SECRET,
    callbackURL: process.env.PATREON_CALLBACK_URL,
  },
  function(accessToken, refreshToken, profile, done) {
    // passport-patreon removes data we need from `profile`, so re-extract the raw data received
    const raw = profile._raw;
    const fullProfile = JSON.parse(raw);

    const id = fullProfile.data.id;
    const name = fullProfile.data.attributes.full_name;
    const avatar = fullProfile.data.attributes.image_url;
    const pledge = fullProfile.included && fullProfile.included.find(item => item.type === 'pledge');
    const pledgeAmount = pledge ? pledge.attributes.amount_cents : null;
    const reward = fullProfile.included && fullProfile.included.find(item => item.type === 'reward');
    const rewardId = reward ? reward.id : null;
    const rewardTitle = reward ? reward.attributes.title : null;

    done(null, {
      name,
      avatar,
      patreon: {
        id,
        pledgeAmount,
        rewardId,
        rewardTitle,
        accessToken,
        refreshToken,
      },
    });
  }
));

router.get('/', Passport.authenticate('patreon'));
router.get('/callback', Passport.authenticate('patreon', { successRedirect: '/', failureRedirect: '/patreon' }), function (req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.send(JSON.stringify(req.user));
});

export default router;
