import React from 'react';

import TickIcon from 'Icons/Tick';
import CrossIcon from 'Icons/Cross';
import ChevronIcon from 'Icons/Chevron';
import InformationIcon from 'Icons/Information';

import Analyzer from 'Parser/Core/Analyzer';
import Expandable from 'Main/Expandable';
import SpellLink from 'common/SpellLink';
import { formatNumber, formatPercentage, formatThousands } from 'common/format';
import Wrapper from 'common/Wrapper';

export function performanceForThresholds(thresholds) {
  if (thresholds.isGreaterThan) {
    if (typeof thresholds.isGreaterThan === 'object') {
      return performanceForGreaterThanThresholds(thresholds.actual, thresholds.isGreaterThan);
    } else {
      return thresholds.isGreaterThan / thresholds.actual;
    }
  } else if (thresholds.isLessThan) {
    if (typeof thresholds.isLessThan === 'object') {
      return performanceForLessThanThresholds(thresholds.actual, thresholds.isLessThan);
    } else {
      return thresholds.actual / thresholds.isLessThan;
    }
  } else if (thresholds.is !== undefined) {
    return thresholds.actual !== thresholds.is ? 1 : 0;
  } else {
    throw new Error('Failed to recognize threshold type');
  }
}
/**
 *   0 - 33% major This is different from the *minor* threshold which is at 100% instead of 66%. The reason for this is that the minor threshold being at 75% and then 75%-100% being minor - max is that this would suggest going for max is best while this is not always the case. Something like Crusader Strike (with the Crusader's Might talent) has a recommended cast efficiency of 35% *because* you should only cast it enough to benefit you, more than that would be good but not 100% cast efficiency as then you're losing healing.
 * 33% - 66% average
 * 66% - 99% minor
 * 100% good (no issue)
 * @param actual
 * @param minor
 * @param average
 * @param major
 * @returns {number}
 */
export function performanceForLessThanThresholds(actual, { minor, average, major }) {
  if (actual >= minor) {
    // no issue
    return 1;
  }
  if (actual >= average) {
    // minor issue (between average and minor issue)
    return 0.666 + 0.333 * ((actual - average) / (minor - average));
  }
  if (actual >= major) {
    // average issue (between major and average issue)
    return 0.333 + 0.333 * ((actual - major) / (average - major));
  }
  // major issue
  return 0.333 * actual / major;
}
export function performanceForGreaterThanThresholds(actual, { minor, average, major }) {
  if (actual <= minor) {
    // no issue
    return 1;
  }
  if (actual < average) {
    // minor issue (between average and minor issue)
    return 0.666 + 0.333 * ((actual - minor) / (average - minor));
  }
  if (actual < major) {
    // average issue (between major and average issue)
    return 0.333 + 0.333 * ((actual - average) / (major - average));
  }
  // major issue
  return 0.333 * major / actual;
}
function colorForPerformance(performance) {
  if (performance >= 1) {
    return '#4ec04e';
  } else if (performance > 0.666) {
    return '#a6c34c';
  } else if (performance > 0.5) {
    return '#ffc84a';
  } else if (performance > 0.333) {
    return '#df7102';
  } else {
    return '#ac1f39';
  }
}
function formatThresholdsActual(thresholds) {
  switch (thresholds.style) {
    case 'percentage':
      return `${formatPercentage(thresholds.actual)}%`;
    case 'number':
      return `${formatNumber(thresholds.actual)}`;
    case 'thousands':
      return `${formatThousands(thresholds.actual)}`;
    case 'boolean':
      return thresholds.actual ? 'Yes' : 'No';
    case 'seconds':
      return `${thresholds.actual.toFixed(2)}s`;
    default:
      throw new Error(`Unknown style: ${thresholds.style}`);
  }
}

function calculateRulePerformance(values, style='median'){
  switch (style) {
    case 'median':
      return calculateMedian(values);
    case 'average':
      return values.reduce((c, p) => c + p, 0) / values.length;
    case 'lowest':
      return Math.min(...values);
    default:
      throw new Error(`Unknown style: ${style}`);
  }
}


function calculateMedian(values) {
  const arr = [...values];
  arr.sort((a, b) => a - b);

  const half = Math.floor(arr.length / 2);

  if (arr.length % 2) {
    return arr[half];
  } else {
    return (arr[half - 1] + arr[half]) / 2.0;
  }
}

export class Rule {
  name = null;
  requirements = null;
  when = null;
  constructor(options) {
    Object.keys(options).forEach(key => {
      this[key] = options[key];
    });
  }
}

export class Requirement {
  name = null;
  check = null;
  when = null;
  constructor(options) {
    Object.keys(options).forEach(key => {
      this[key] = options[key];
    });
  }
}

export class GenericCastEfficiencyRequirement extends Requirement {
  constructor({ spell, ...others }) {
    super({
      name: <SpellLink id={spell.id} icon />,
      check: function () {
        const { efficiency, recommendedEfficiency: minor, averageIssueEfficiency: average, majorIssueEfficiency: major } = this.castEfficiency.getCastEfficiencyForSpellId(spell.id);
        return {
          actual: efficiency,
          isLessThan: {
            minor,
            average,
            major,
          },
          style: 'percentage',
        };
      },
      ...others,
    });
  }
}

class Checklist extends Analyzer {
  rules = [];

  constructor(...args) {
    super(...args);
    this.whenFilter = this.whenFilter.bind(this);
    this.renderRule = this.renderRule.bind(this);
  }

  whenFilter(rule) {
    if (rule.when === null) {
      // Rule isn't conditional
      return true;
    }
    if (typeof rule.when === 'function') {
      return rule.when.call(this);
    }

    return !!rule.when;
  }
  renderRule(rule, index) {
    const requirements = rule.requirements.call(this)
      .filter(this.whenFilter)
      .map(requirement => {
        const thresholds = requirement.check.call(this);
        const performance = performanceForThresholds(thresholds);
        return {
          requirement,
          thresholds,
          performance,
        };
      });

    const requirementPerformances = requirements.map(requirement => requirement.performance);
    // const lowest = requirementPerformances.reduce((lowest, performance) => Math.min(lowest, performance), Infinity);
    // const total = requirementPerformances.reduce((total, performance) => total + performance, 0);
    // const average = total / requirementPerformances.length;
    // Lowest would be too punishing for small mistakes, if you want to have a single value tank the rule consider making it its own rule.
    // Average would mark things as OK when one thing was OK and 3 things were "average", I think this is wrong and it should mark the rule as average. Median achieves this.
    const rulePerformance = calculateRulePerformance(requirementPerformances, rule.performanceMethod);


    return (
      <Expandable
        key={index}
        header={(
          <div className="flex" style={{ fontSize: '1.4em' }}>
            <div className="flex-sub content-middle" style={{ paddingRight: 22 }}>
              <div>{/* this div ensures vertical alignment */}
                {rulePerformance > 0.666 ? <TickIcon style={{ color: 'green' }} /> : <CrossIcon style={{ color: 'red' }} />}
              </div>
            </div>
            <div className="flex-main">
              {rule.name}
            </div>
            <div className="flex-sub content-middle" style={{ width: 100 }}>
              <div className="performance-bar-container">
                <div
                  className={`performance-bar small`}
                  style={{ width: `${rulePerformance * 100}%`, transition: 'background-color 800ms', backgroundColor: colorForPerformance(rulePerformance) }}
                />
              </div>
            </div>
            <div className="flex-sub content-middle" style={{ paddingLeft: 22 }}>
              <div className="chevron">{/* this div ensures vertical alignment */}
                <ChevronIcon />
              </div>
            </div>
          </div>
        )}
      >
        {rule.description && (
          <div className="row" style={{ marginBottom: 10 }}>
            <div className="col-md-12 text-muted">
              <div className="flex">
                <div className="flex-sub content-middle" style={{ fontSize: '3.5em', lineHeight: 1, marginRight: 20 }}>
                  <div>{/* this div ensures vertical alignment */}
                    <InformationIcon />
                  </div>
                </div>
                <div className="flex-main">
                  {rule.description}
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="row">
          {requirements.map(({ requirement, thresholds, performance }) => (
            <div key={requirement.name} className="col-md-6">
              <div className="flex">
                <div className="flex-main">
                  {requirement.name}
                </div>
                <div className="flex-sub text-muted" style={{ margin: '0 15px' }}>
                  {thresholds.prefix} {formatThresholdsActual(thresholds)} {thresholds.suffix}
                </div>
                <div className="flex-sub content-middle" style={{ width: 50 }}>
                  <div className="performance-bar-container">
                    <div
                      className={`performance-bar small`}
                      style={{ width: `${performance * 100}%`, transition: 'background-color 800ms', backgroundColor: colorForPerformance(performance) }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Expandable>
    );
  }

  render({ footer }) {
    return (
      <Wrapper>
        {this.rules.length === 0 && (
          <div className="item-divider" style={{ padding: '10px 22px' }}>
            Sorry, the checklist for this spec has not been implemented yet.
          </div>
        )}
        {this.rules
          .filter(this.whenFilter)
          .map(this.renderRule)}
        {footer && (
          <div style={{ padding: '10px 22px' }}>
            {footer}
          </div>
        )}
      </Wrapper>
    );
  }
}

export default Checklist;
