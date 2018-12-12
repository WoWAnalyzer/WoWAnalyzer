import { i18n } from 'interface/RootLocalizationProvider';
import ParseResults from 'parser/core/ParseResults';
import BaseChecklist from 'parser/shared/modules/features/Checklist2/Module';
import renderer from 'react-test-renderer';
import { loadLog, parseLog } from './log-tools';
import { statistic, expectSnapshot } from './snapshotTest';

function integrationStatistic(analyzer, parser) {
  if(!analyzer.active) {
    return 'module inactive';
  }
  if(!analyzer.statistic || analyzer.statistic() === undefined) {
    return 'module has no statistic method';
  }
  return statistic(analyzer, parser);
}

function integrationSuggestions(analyzer) {
  if(!analyzer.active) {
    return 'module inactive';
  }
  if(!analyzer.suggestions) {
    return 'module has no suggestions';
  }
  const results = new ParseResults();
  analyzer.suggestions(results.suggestions.when, { i18n });
  return results.issues;
}

function checklist(parser) {
  const checklistModule = Object.values(parser.constructor.specModules).find(m => m.prototype instanceof BaseChecklist);
  if(checklistModule === undefined) {
    return 'no checklist';
  }
  const result = parser.getModule(checklistModule).render();
  return renderer.create(result).toJSON();
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
 * @param {string} filename - which log from `test-logs` to load
 * @param {boolean} suppressWarn - Suppress `console.warn`
 * @param {boolean} suppressLog - Suppress `console.log`
 */
export default function integrationTest(parserClass, filename, suppressLog=true, suppressWarn=true) {
  return () => {
    let log;
    let parser;

    beforeAll(() => {
      return loadLog(filename).then(res => { 
        log = res; 
        parser = parseLog(parserClass, log, suppressLog, suppressWarn);
      });
    });

    it('should match the checklist snapshot', () => {
      expect(checklist(parser)).toMatchSnapshot();
    });

    describe('analyzers', () => {
      Object.values(parserClass.specModules).forEach(moduleClass => {
        if(moduleClass instanceof Array) {
          // cannot call parser._getModuleClass at this point in
          // execution, so we handle the case manually
          moduleClass = moduleClass[0];
        }
        describe(moduleClass.name, () => {
          it('matches the statistic snapshot', () => expectSnapshot(parser, moduleClass, integrationStatistic));
          it('matches the suggestions snapshot', () => expectSnapshot(parser, moduleClass, integrationSuggestions));
        });
      });
    });
  };
}
