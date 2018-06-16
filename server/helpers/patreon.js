import request from 'request-promise-native';

export async function fetchRawPatreonProfile(accessToken) {
  // return require('./__fixtures__/patreon-active.json');
  return await request.get({
    url: 'https://api.patreon.com/oauth2/api/current_user',
    headers: {
      'User-Agent': 'WoWAnalyzer.com API',
      'Authorization': `Bearer ${accessToken}`,
    },
    gzip: true, // using gzip was quicker for WCL, so maybe here too
  })
    .then(jsonString => JSON.parse(jsonString));
}
export function parseProfile(profile) {
  const id = profile.data.id;
  const name = profile.data.attributes.full_name;
  const avatar = profile.data.attributes.image_url;
  // There is NO pledge data available at all as soon as a user deletes their pledge, so we're unable to give them their Premium for the remainder of the month. This isn't something we can fix, so all we can do is apologize to our users. :(
  const pledge = profile.included && profile.included.find(item => item.type === 'pledge');
  const pledgeAmount = pledge ? pledge.attributes.amount_cents : null;

  // Reward info needs to get the reward id from the pledge's relations. Since we don't use it yet, I didn't want to spend time implementing it.
  // const reward = profile.included && profile.included.find(item => item.type === 'reward');
  // const rewardId = reward ? reward.id : null;
  // const rewardTitle = reward ? reward.attributes.title : null;

  return {
    id,
    name,
    avatar,
    pledgeAmount,
  };
}
export async function fetchPatreonProfile(accessToken, refreshToken) {
  // TODO: Handle refreshToken https://www.patreondevelopers.com/t/how-can-i-refresh-an-oauth2-token-do-i-need-to-wait-for-the-token-to-expire-patreon-api/615/2
  const patreonProfile = await fetchRawPatreonProfile(accessToken);
  return parseProfile(patreonProfile);
}
export async function refreshPatreonProfile(user) {
  console.log(`Refreshing Patreon data for ${user.data.name} (${user.patreonId})`);
  const patreonProfile = await fetchPatreonProfile(user.data.patreon.accessToken);

  // We shouldn't have to wait for this update to finish, since it immediately updates the local object's data
  user.update({
    data: {
      ...user.data,
      name: patreonProfile.name,
      avatar: patreonProfile.avatar,
      patreon: {
        ...user.data.patreon,
        pledgeAmount: patreonProfile.pledgeAmount,
        updatedAt: new Date(),
      },
    },
  });
}
