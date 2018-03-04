import React from 'react';

import TickIcon from 'Icons/Tick';
import CrossIcon from 'Icons/Cross';
import ChevronIcon from 'Icons/Chevron';
import InformationIcon from 'Icons/Information';

import Analyzer from 'Parser/Core/Analyzer';
import Expandable from 'Main/Expandable';
import { formatNumber, formatPercentage, formatThousands } from 'common/format';
import Wrapper from 'common/Wrapper';

import performanceForThresholds from './performanceForThresholds';
import calculateMedian from './calculateMedian';

export { performanceForThresholds };
export { default as Rule } from './Rule';
export { default as Requirement } from './Requirement';

class Checklist extends Analyzer {
  rules = [];

  constructor(...args) {
    super(...args);
    this.whenFilter = this.whenFilter.bind(this);
    this.renderRule = this.renderRule.bind(this);
  }

  colorForPerformance(performance) {
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
  calculateRulePerformance(values, style = 'median') {
    // Lowest would generally be too punishing for small mistakes, if you want to have a single value tank the rule consider making it its own rule.
    // Average would mark things as OK when one thing was OK and 3 things were "average", I think this is wrong and it should mark the rule as average. Median achieves this.

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
  formatThresholdsActual(thresholds) {
    switch (thresholds.style) {
      case 'percentage':
        return `${formatPercentage(thresholds.actual)}%`;
      case 'number':
        return `${formatNumber(thresholds.actual)}`;
      case 'thousands':
        return `${formatThousands(thresholds.actual)}`;
      case 'decimal':
        return `${thresholds.actual.toFixed(2)}`;
      case 'boolean':
        return thresholds.actual ? 'Yes' : 'No';
      case 'seconds':
        return `${thresholds.actual.toFixed(2)}s`;
      default:
        throw new Error(`Unknown style: ${thresholds.style}`);
    }
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

    if (requirements.length === 0) {
      return null;
    }
    const requirementPerformances = requirements.map(requirement => requirement.performance);
    const rulePerformance = requirementPerformances.length > 0 ? this.calculateRulePerformance(requirementPerformances, rule.performanceMethod) : 1;

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
                  style={{ width: `${rulePerformance * 100}%`, transition: 'background-color 800ms', backgroundColor: this.colorForPerformance(rulePerformance) }}
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
          {requirements.map(({ requirement, thresholds, performance }, index) => {
            const displayedValue = <Wrapper>{thresholds.prefix} {this.formatThresholdsActual(thresholds)} {thresholds.max !== undefined && `/ ${thresholds.max}`} {thresholds.suffix}</Wrapper>;
            return (
              <div key={index} className="col-md-6">
                <div className="flex">
                  <div className="flex-main">
                    {requirement.tooltip ? <dfn data-tip={requirement.tooltip}>{requirement.name}</dfn> : requirement.name}
                  </div>
                  <div className="flex-sub content-middle text-muted" style={{ margin: '0 15px' }}>
                    {requirement.valueTooltip ? <dfn data-tip={requirement.valueTooltip}>{displayedValue}</dfn> : displayedValue}
                  </div>
                  <div className="flex-sub content-middle" style={{ width: 50 }}>
                    <div className="performance-bar-container">
                      <div
                        className={`performance-bar small`}
                        style={{ width: `${performance * 100}%`, transition: 'background-color 800ms', backgroundColor: this.colorForPerformance(performance) }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Expandable>
    );
  }

  render() {
    return (
      <Wrapper>
        {this.rules.length === 0 && (
          <div className="item-divider" style={{ padding: '10px 22px' }}>
            <div className="alert alert-danger">
              The checklist for this spec is not yet available as it hasn't been implemented yet. See <a href="https://github.com/WoWAnalyzer/WoWAnalyzer">GitHub</a> or join us on <a href="https://discord.gg/AxphPxU">Discord</a> if you're interested in contributing this.
            </div>
          </div>
        )}
        {this.rules
          .filter(this.whenFilter)
          .map(this.renderRule)}
      </Wrapper>
    );
  }
}

export default Checklist;
