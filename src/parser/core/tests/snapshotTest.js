import { loadLogSync, suppressLogging, parseLog } from './log-tools';
import renderer from 'react-test-renderer';

function statistic(analyzer) {
  const result = renderer.create(analyzer.statistic()).toJSON();
  return result;
} 

/**
 * Perform a test using the Jest snapshot tool (https://jestjs.io/docs/en/snapshot-testing#snapshot-testing-with-jest).
 *
 * This is a consistency test, testing only that the output of the given
 * function (default: statistic()) matches the snapshotted value. See
 * the docs linked above for information on how to update a snapshot.
 *
 * @param {object} parserClass - CombatLogParser class. Uninstantiated
 * @param {object} moduleClass - Analyzer or other module. Uninstantiated
 * @param {string} key - Log identifier
 * @param {function} propFn - Function returning serializable output to be tested for consistency. Optional.
 * @param {boolean} suppressLog - Suppress console.log
 * @param {boolean} suppressWarn - Suppress console.warn
 */
export default function snapshotTest(parserClass, moduleClass, key, 
  propFn = statistic, suppressLog = true, suppressWarn = true) {
  let log;
  beforeAll(() => {
    log = loadLogSync(key);
  });

  suppressLogging(suppressLog, suppressWarn, false);

  it(`should match the ${propFn.name} snapshot`, () => {
    const parser = parseLog(parserClass, log);
    const result = propFn(parser.getModule(moduleClass));
    expect(result).toMatchSnapshot();
  });
}
