const util = require('util');
const exec = util.promisify(require('child_process').exec);

function getTargetBranch() {
  return process.env.GITHUB_BASE_REF;
}
async function getChangedFiles(targetBranch) {
  // eslint-disable-next-line no-unused-vars
  const { stdout, stderr } = await exec(
    `git diff --name-only ${targetBranch}...HEAD`,
  );
  // TODO: How do I properly handle stderr?
  return stdout.trim().split('\n');
}

function getChangelogs(changedFiles) {
  const allowedChangelogFormats = ['/CHANGELOG.js','/CHANGELOG.tsx'];
  return changedFiles.filter(path => allowedChangelogFormats.some(format => path.includes(format)));
}

async function main() {
  const targetBranch = getTargetBranch();
  const changedFiles = await getChangedFiles(targetBranch);
  // console.log(`Changed files since ${targetBranch}:`);
  // changedFiles.forEach(path => console.log(path));
  // console.log();

  const changelogs = getChangelogs(changedFiles);
  if (changelogs.length > 0) {
    console.log('Found a changelog entry. Thanks!');
    changelogs.forEach(changelog => console.log(changelog));
    process.exit(0);
  } else {
    console.error(
      'Error: Changelog entry missing.\n' +
        'A changelog entry is required. Please explain your change in a relevant CHANGELOG file.\n' +
        'Use the spec specific CHANGELOG file if it was a spec/class specific change. If it\n' +
        'affects many specs you can use the CHANGELOG file in the root src folder.',
    );
    process.exit(1);
  }
}

process.on('unhandledRejection', err => {
  throw err;
});

main();
