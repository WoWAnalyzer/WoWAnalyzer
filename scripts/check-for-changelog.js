const util = require('util');
const exec = util.promisify(require('child_process').exec);

async function getChangedFiles() {
  // eslint-disable-next-line no-unused-vars
  const { stdout, stderr } = await exec(`git diff --name-only HEAD...$TRAVIS_BRANCH`);
  // TODO: How do I properly handle stderr?
  return stdout.trim().split('\n');
}

async function hasChangelog(changedFiles) {
  return changedFiles.some(path => path.includes('/CHANGELOG.js'));
}

async function checkForChangelog() {
  const changedFiles = await getChangedFiles();
  return hasChangelog(changedFiles);
}

async function main() {
  const hasChangelog = await checkForChangelog();
  let exitCode;
  if (hasChangelog) {
    console.log('Found a changelog entry. Thanks!');
    exitCode = 0;
  } else {
    console.error('Error: Changelog entry missing.\n' +
      'A changelog entry is required. Please explain your change in a relevant CHANGELOG file.\n' +
      'Use the spec specific CHANGELOG file if it was a spec/class specific change. If it\n' +
      'affects many specs you can use the CHANGELOG file in the root src folder.');
    exitCode = 1;
  }
  process.exit(exitCode);
}

main();
