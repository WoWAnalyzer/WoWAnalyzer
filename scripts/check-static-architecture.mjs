import { readFile, readdir } from 'node:fs/promises';
import { extname, join } from 'node:path';

const root = new URL('../', import.meta.url);

async function filesBelow(directory) {
  const entries = await readdir(new URL(directory, root), { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? filesBelow(`${path}/`) : [path];
    }),
  );
  return files.flat();
}

const failures = [];
const analyzerFiles = (
  await Promise.all(['src/analysis/', 'src/parser/', 'src/interface/guide/'].map(filesBelow))
).flat();
for (const file of analyzerFiles.filter((file) =>
  ['.ts', '.tsx', '.js', '.jsx'].includes(extname(file)),
)) {
  const source = await readFile(new URL(file, root), 'utf8');
  if (source.includes('common/fetchWclApi')) {
    failures.push(`${file} imports the legacy WCL transport instead of AnalysisDataSource.`);
  }
}

try {
  for (const file of (await filesBelow('dist/')).filter((file) =>
    ['.js', '.html'].includes(extname(file)),
  )) {
    const artifact = await readFile(new URL(file, root), 'utf8');
    for (const marker of [
      '/api/v2/report/',
      'wowanalyzer.com/i/',
      'VITE_SERVER_BASE',
      'client_secret',
    ]) {
      if (artifact.includes(marker))
        failures.push(`${file} contains forbidden server marker ${marker}.`);
    }
  }
} catch (error) {
  if (error?.code !== 'ENOENT') throw error;
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
}
