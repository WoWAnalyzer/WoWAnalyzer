import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import { ESLint, Linter } from 'eslint';
import process from 'node:process';

/**
 * Run eslint, excluding rules that are present in the baseline.
 * @returns true if any new errors were found
 */
async function lint(fix: boolean = false, patterns: string[]): Promise<boolean> {
  const patternsToLint = patterns.length === 0 ? ['src/'] : patterns;

  const baseline = await loadBaseline();
  const linter = new ESLint({ fix, warnIgnored: false });
  const results = await linter.lintFiles(patternsToLint);
  const formatter = await linter.loadFormatter('stylish');

  if (fix) {
    await ESLint.outputFixes(results);
  }

  const newResults: ESLint.LintResult[] = [];

  const observedKeys = new Set();

  for (const result of results) {
    const newResult = {
      ...result,
      messages: [],
      errorCount: 0,
      fatalErrorCount: 0,
      warningCount: 0,
    } as typeof result;
    for (const message of result.messages) {
      const key = baselineKey(result.filePath, message);
      observedKeys.add(key);
      if (baseline.has(key)) {
        continue;
      }

      newResult.messages.push(message);
      if (message.fatal) {
        newResult.fatalErrorCount += 1;
        newResult.errorCount += 1;
      } else if (message.severity === 1) {
        newResult.warningCount += 1;
      } else if (message.severity === 2) {
        newResult.errorCount += 1;
      }
    }

    if (newResult.messages.length > 0) {
      newResults.push(newResult);
    }
  }

  const output = await formatter.format(newResults);

  console.log(output);

  const unusedBaselineEntries = new Set();
  for (const key of baseline) {
    if (!observedKeys.has(key)) {
      unusedBaselineEntries.add(key);
    }
  }

  if (unusedBaselineEntries.size > 0) {
    console.warn(
      `${unusedBaselineEntries.size} baseline entries are unused. Run \`pnpm run lint-baseline update\` to update the baseline.`,
    );
  }

  return newResults.length > 0;
}

/**
 * Run eslint, replacing the baseline with the output errors and warnings.
 */
async function updateBaseline(): Promise<void> {
  const linter = new ESLint();
  const results = await linter.lintFiles('src/');
  const formatter = await linter.loadFormatter('stylish');

  const baseline: string[] = [];
  for (const result of results) {
    for (const message of result.messages) {
      baseline.push(baselineKey(result.filePath, message));
    }
  }

  baseline.sort();

  const output = JSON.stringify(baseline, null, 2);
  await fs.writeFile(path.join(import.meta.dirname, './baseline.json'), output, {
    encoding: 'utf8',
  });

  console.log(await formatter.format(results));
}

const PROJECT_ROOT = path.join(import.meta.dirname, '../../');

function baselineKey(file: string, message: Linter.LintMessage): string {
  // replaces windows separator with posix separator
  const relativePath = path.relative(PROJECT_ROOT, file).replaceAll(path.win32.sep, path.posix.sep);
  return `${relativePath}:${message.line}:${message.column}__${message.ruleId}`;
}

async function loadBaseline(): Promise<Set<string>> {
  try {
    const contents = await fs.readFile(path.join(import.meta.dirname, './baseline.json'), {
      encoding: 'utf8',
    });
    return new Set(JSON.parse(contents));
  } catch {
    return new Set();
  }
}

// arguments are anything after "node" and this script file
const args = process.argv.slice(2);
const command = args.at(0);

let hasLints = false;
switch (command) {
  case 'update':
    console.log('updating baseline...');
    await updateBaseline();
    break;
  case 'fix':
    hasLints = await lint(true, args.slice(1));
    process.exit(hasLints ? 1 : 0);
    break;
  default:
    hasLints = await lint(false, args);
    process.exit(hasLints ? 1 : 0);
    break;
}
