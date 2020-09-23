import renderer from 'react-test-renderer';
import { ReactElement } from 'react';

import ParseResults from 'parser/core/ParseResults';
import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';

import CombatLogParser, { DependenciesDefinition } from '../CombatLogParser';
import Module from '../Module';
import Analyzer from '../Analyzer';
import { loadLog, parseLog } from './log-tools';
import { statistic } from './snapshotTest';

function integrationStatistic(analyzer: Analyzer, parser: CombatLogParser) {
  if (!analyzer.active) {
    return undefined; // module inactive
  }
  const output = analyzer.statistic ? analyzer.statistic() : undefined;
  if (output === undefined) {
    return undefined; // module has no statistic method
  }
  return statistic(output, parser);
}

function integrationSuggestions(analyzer: Analyzer) {
  if (!analyzer.active) {
    return undefined; // module inactive
  }
  if (!analyzer.suggestions) {
    return undefined; // module has no suggestions
  }
  const results = new ParseResults();
  analyzer.suggestions(results.suggestions.when);
  return results.issues;
}

function checklist(parser: CombatLogParser) {
  const checklistModule = Object.values((parser.constructor as typeof CombatLogParser).specModules)
    .map(dep => {
      if (dep instanceof Array) {
        return dep[0] as typeof Module;
      } else {
        return dep as typeof Module;
      }
    })
    .find(m => {
      return m.prototype instanceof BaseChecklist;
    });
  if (checklistModule === undefined) {
    return 'no checklist';
  }
  const result = (parser.getModule(checklistModule) as BaseChecklist).render();
  return renderer.create(result as unknown as ReactElement).toJSON();
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
 * @param {string} path - An absolute path to the log to load.
 * @param {string} build - which build to use when parsing the log. undefined means "no build"
 * @param {boolean} suppressWarn - Suppress `console.warn`
 * @param {boolean} suppressLog - Suppress `console.log`
 */
export default function integrationTest(
  parserClass: typeof CombatLogParser,
  path: string,
  build: string | undefined = undefined,
  suppressLog: boolean = true,
  suppressWarn: boolean = true,
) {
  return () => {
    let parser: CombatLogParser;
    beforeAll(async () => {
      const log = await loadLog(path);
      parser = parseLog(parserClass, log, build, suppressLog, suppressWarn);
      window.fetch = jest.fn(url => {
        throw new Error(
          `Attempt to fetch "${url}". These tests shouldn't do AJAX calls.`,
        );
      });
    });

    it('matches the checklist snapshot', () => {
      expect(checklist(parser)).toMatchSnapshot();
    });

    // TODO: Test Abilities, Buffs and other classes extending Module

    const getAnalyzers = (moduleConfig: DependenciesDefinition) =>
      Object.values(moduleConfig)
        .map(moduleClass => {
          if (moduleClass instanceof Array) {
            // cannot call parser._getModuleClass at this point in
            // execution, so we handle the case manually
            return moduleClass[0];
          }
          return moduleClass;
        })
        // Normalizers have no output, their effects are irrelevant so long as the
        // results of analyzers stay the same
        .filter(moduleClass => moduleClass.prototype instanceof Analyzer);
    const testAnalyzers = (moduleConfig: DependenciesDefinition) =>
      getAnalyzers(moduleConfig).forEach(moduleClass => {
        describe(moduleClass.name, () => {
          // We skip anything without output so that adding a new analyzer will
          // only require updating the snapshots if it added or changed output.
          // This reduces the amount of snapshot updating required, as well as
          // the snapshot output diffs making them easier to review.
          let module: Analyzer;
          beforeAll(() => {
            module = parser.getModule(moduleClass);
          });

          it('matches the statistic snapshot', () => {
            const statistic = integrationStatistic(module, parser);
            if (statistic) {
              expect(statistic).toMatchSnapshot();
            }
          });
          it('matches the suggestions snapshot', () => {
            const suggestions = integrationSuggestions(module);
            if (suggestions && suggestions.length !== 0) {
              expect(suggestions).toMatchSnapshot();
            }
          });
        });
      });

    testAnalyzers({
      ...parserClass.internalModules,
      ...parserClass.defaultModules,
      ...parserClass.specModules,
    });
  };
}
