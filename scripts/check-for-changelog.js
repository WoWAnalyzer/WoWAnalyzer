const util = require('util');
const exec = util.promisify(require('child_process').exec);

function getTargetBranch() {
  return process.env.TRAVIS_BRANCH;
}
async function getChangedFiles(targetBranch) {
  // eslint-disable-next-line no-unused-vars
  const { stdout, stderr } = await exec(`git diff --name-only ${targetBranch}...HEAD`);
  // TODO: How do I properly handle stderr?
  return stdout.trim().split('\n');
}

function hasChangelog(changedFiles) {
  return changedFiles.some(path => path.includes('/CHANGELOG.js'));
}

async function main() {
  const targetBranch = getTargetBranch();
  const changedFiles = await getChangedFiles(targetBranch);
  console.log(`Changed files since ${targetBranch}:`);
  changedFiles.forEach(path => console.log(path));
  console.log();

  if (hasChangelog(changedFiles)) {
    console.log('Found a changelog entry. Thanks!');
    process.exit(0);
  } else {
    console.error('Error: Changelog entry missing.\n' +
      'A changelog entry is required. Please explain your change in a relevant CHANGELOG file.\n' +
      'Use the spec specific CHANGELOG file if it was a spec/class specific change. If it\n' +
      'affects many specs you can use the CHANGELOG file in the root src folder.');
    process.exit(1);
  }
}

main();
