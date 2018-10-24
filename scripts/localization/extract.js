'use strict';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err;
});

// Need to set this for babel
process.env.NODE_ENV = 'development';

const exec = require('child_process').exec;

function run(command) {
  return new Promise((resolve, reject) => {
    console.log(`> ${command}`);
    const cmd = exec(command, { stdio: 'inherit' });
    cmd.stdout.pipe(process.stdout);
    cmd.stderr.pipe(process.stderr);
    cmd.addListener('error', reject);
    cmd.addListener('exit', resolve);
  });
}

async function main() {
  // TODO: Reimplement (but let's focus on everything else first)
  // await run('npm run script scripts/localization/extract-spells.js');

  await run('lingui extract');
}

main();
