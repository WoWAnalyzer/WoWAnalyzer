import request from 'request-promise-native';

export async function fetchCommits(login) {
  // This will only get commits to master, but that should generally be sufficient.
  const url = `https://api.github.com/repos/WoWAnalyzer/WoWAnalyzer/commits?client_id=${process.env.GITHUB_CLIENT_ID}&client_secret=${process.env.GITHUB_CLIENT_SECRET}&author=${login}`;
  return await request.get({
    url: url,
    headers: {
      'User-Agent': 'WoWAnalyzer.com API',
    },
    gzip: true, // using gzip is 80% quicker
  })
    .then(jsonString => JSON.parse(jsonString));
}
function getMostRecentCommit(commits) {
  if (!commits || commits.length === 0) {
    return null;
  }
  return commits[0];
}
export async function fetchLastCommit(login) {
  const commits = await fetchCommits(login);
  return getMostRecentCommit(commits);
}
function getCommitDate(commit) {
  return new Date(commit.commit.committer.date);
}
export async function fetchGitHubLastCommitDate(login) {
  const lastCommit = await fetchLastCommit(login);
  if (!lastCommit) {
    return null;
  }
  return getCommitDate(lastCommit);
}
