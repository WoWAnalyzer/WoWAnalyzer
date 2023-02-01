import { cloneElement, ReactNode } from 'react';
import renderer, { ReactTestRendererJSON } from 'react-test-renderer';
import CombatLogParser from 'parser/core/CombatLogParser';
import { CombatLogParserProvider } from 'interface/report/CombatLogParserContext';

import { loadLog, parseLog } from './log-tools';
import Analyzer from 'parser/core/Analyzer';
function renderWithParser(output: ReactNode, parser: CombatLogParser) {
  let sanitizedOutput = output;
  if (Array.isArray(output)) {
    sanitizedOutput = output.map((item, index) =>
      cloneElement(item, {
        key: `statistic-output-${index}`,
      }),
    );
  }

  return renderer
    .create(
      <CombatLogParserProvider combatLogParser={parser}>{sanitizedOutput}</CombatLogParserProvider>,
    )
    .toJSON();
}

export function statistic(output: ReactNode, parser: CombatLogParser) {
  return renderWithParser(output, parser);
}

export function tab(analyzer: Analyzer, parser: CombatLogParser) {
  const tab = analyzer.tab()?.render();
  return renderWithParser(tab, parser);
}

export function expectSnapshot(
  parser: CombatLogParser,
  moduleClass: typeof Analyzer,
  propFn = statistic,
) {
  const result = propFn(parser.getModule(moduleClass), parser);
  expect(result).toMatchSnapshot();
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
 * @param {boolean} suppressLog - Should console.log be suppressed
 * @param {boolean} suppressWarn - Should console.warn be suppressed
 */
export default function snapshotTest(
  parserClass: typeof CombatLogParser,
  moduleClass: typeof Analyzer,
  key: string,
  propFn: (
    output: ReactNode,
    parser: CombatLogParser,
  ) => ReactTestRendererJSON | ReactTestRendererJSON[] | null = statistic,
  suppressLog = true,
  suppressWarn = true,
) {
  return () =>
    loadLog(key).then((log) => {
      const parser = parseLog(parserClass, log, undefined, suppressLog, suppressWarn);
      expectSnapshot(parser, moduleClass, propFn);
    });
}
