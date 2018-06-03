import request from 'request-promise-native';

export async function getGitHubLastCommitDate(login) {
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
