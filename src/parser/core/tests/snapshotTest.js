import React from 'react';
import PropTypes from 'prop-types';
import renderer from 'react-test-renderer';

import { loadLog, parseLog } from './log-tools';

class ParserContextProvider extends React.PureComponent {
  static propTypes = {
    parser: PropTypes.object,
    children: PropTypes.node,
  };

  static childContextTypes = {
    parser: PropTypes.object,
  };

  getChildContext() {
    return {
      parser: this.props.parser,
    };
  }

  render() {
    return this.props.children;
  }
}

function renderWithParser(output, parser) {
  let sanitizedOutput = output;
  if (Array.isArray(output)) {
    sanitizedOutput = output.map((item, index) =>
      React.cloneElement(item, {
        key: `statistic-output-${index}`,
      }),
    );
  }

  return renderer
    .create(
      <ParserContextProvider parser={parser}>
        {sanitizedOutput}
      </ParserContextProvider>,
    )
    .toJSON();
}

export function statistic(output, parser = null) {
  return renderWithParser(output, parser);
}

export function tab(analyzer, parser = null) {
  const tab = analyzer.tab().render();
  return renderWithParser(tab, parser);
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
export default function snapshotTest(
  parserClass,
  moduleClass,
  key,
  propFn = statistic,
  suppressLog = true,
  suppressWarn = true,
) {
  return () => {
    return loadLog(key).then(log => {
      const parser = parseLog(parserClass, log, suppressLog, suppressWarn);
      expectSnapshot(parser, moduleClass, propFn);
    });
  };
}

export function expectSnapshot(parser, moduleClass, propFn = statistic) {
  const result = propFn(parser.getModule(moduleClass), parser);
  expect(result).toMatchSnapshot();
}
