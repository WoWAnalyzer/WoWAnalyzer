import renderer from 'react-test-renderer';
import { loadLogSync, parseLog } from './log-tools';

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
 * Honestly no longer sure this deserves its own function.
 *
 * @param {object} parserClass - CombatLogParser class. Uninstantiated
 * @param {object} moduleClass - Analyzer or other module. Uninstantiated
 * @param {string} key - Log identifier
 * @param {function} propFn - Function returning serializable output to be tested for consistency. Optional.
 */
export default function snapshotTest(parserClass, moduleClass, key, propFn = statistic) {
  return () => {
    const log = loadLogSync(key);
    const parser = parseLog(parserClass, log);
    const result = propFn(parser.getModule(moduleClass));
    expect(result).toMatchSnapshot();
  };
}
