const fs = require('fs');
const path = require('path');

const appDirectory = fs.realpathSync(process.cwd());

[
  '.env.production.local',
  '.env.production',
  '.env.local',
  '.env',
].forEach(dotenvFile => {
  const source = path.resolve(appDirectory, dotenvFile);
  if (fs.existsSync(source)) {
    const dest = path.resolve(appDirectory, 'build', dotenvFile);
    fs.writeFileSync(dest, fs.readFileSync(source, 'utf-8'));
    console.log(`${dotenvFile} -> build/${dotenvFile}`);
  }
});
