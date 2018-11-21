import { i18n } from 'interface/RootLocalizationProvider';
import { loadLogSync, suppressLogging, parseLog } from './log-tools';
import { statistic, expectSnapshot } from './snapshotTest';

function integrationSnapshot(analyzer, parser) {
  if(!analyzer.active) {
    return 'module inactive';
  }
  if(!analyzer.statistic || analyzer.statistic() === undefined) {
    return 'module has no statistic method';
  }
  return statistic(analyzer, parser);
}

/**
 * Generates an integration test for a spec's CombatLogParser instance.
 *
 * The integration test applies the parser to a single fight that is
 * downloaded and stored in the repository.
 *
 * `console.log` and `console.warn` are suppressed during the test, but
 * `console.error` is not. This behavior can be disabled with the
 * `suppressWarn` and `supressLog` parameters.
 *
 * To obtain the necessary JSON, load the report of interest and get the
 * URLs for each call to the WoWAnalyzer API from the 'Network' section
 * of the developer tools. Download the contents of each URL and store
 * them somewhere. The full set of events should be gzipped (which
 * reduces space usage from several MB to ~100kb).
 *
 * See the Brewmaster analyzer for a worked example.
 *
 * @param {object} parserClass - (uninstantiated) CombatLogParser subclass to test.
 * @param {string} key - Key identifying which log from `test-logs` to load
 * @param {boolean} suppressWarn - Suppress `console.warn`
 * @param {boolean} suppressLog - Suppress `console.log`
 */
export default function integrationTest(parserClass, key, suppressWarn=true, suppressLog=true) {
  return () => {
    let log;
    beforeAll(() => {
      log = loadLogSync(key);
    });

    suppressLogging(suppressLog, suppressWarn, false);

    it('should parse the example report without crashing', () => {
      const parser = parseLog(parserClass, log);
      const results = parser.generateResults({
        i18n,
        adjustForDowntime: false,
      });
      expect(results).toBeTruthy();
    });

    describe('analyzers', () => {
      let parser;
      beforeAll(() => {
        // suppressing logging here always
        const _console = {
          log: console.log,
          warn: console.warn,
        };
        console.log = () => undefined;
        console.warn = () => undefined;

        parser = parseLog(parserClass, log);

        Object.keys(_console).forEach(key => { console[key] = _console[key]; });
      });

      Object.values(parserClass.specModules).forEach(moduleClass => {
        if(moduleClass instanceof Array) {
          // cannot call parser._getModuleClass at this point in
          // execution, so we handle the case manually
          moduleClass = moduleClass[0];
        }
        describe(moduleClass.name, () => {
          suppressLogging(suppressLog, suppressWarn, false);
          it('matches the statistic snapshot', () => expectSnapshot(parser, moduleClass, integrationSnapshot));
        });
      });
    });
  };
}
