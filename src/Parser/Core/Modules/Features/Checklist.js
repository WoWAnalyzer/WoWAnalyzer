import React from 'react';

import TickIcon from 'Icons/Tick';
import CrossIcon from 'Icons/Cross';
import ChevronIcon from 'Icons/Chevron';

import Analyzer from 'Parser/Core/Analyzer';
import Expandable from 'Main/Expandable';
import SpellLink from 'common/SpellLink';

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
function performanceForThresholds(actual, minor, average, major) {
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
function colorForPerformance(performance) {
  let color = null;
  if (performance >= 1) {
    color = 'Hunter-bg';
  } else if (performance > 0.666) {
    color = 'Mage-bg';
  } else if (performance > 0.333) {
    color = 'Druid-bg';
  } else if (performance <= 0.333) {
    color = 'DeathKnight-bg';
  }
  return color;
}

export class Rule {
  name = null;
  requirements = null;
  when = null;
  constructor({ name, requirements, when = null }) {
    this.name = name;
    this.requirements = requirements;
    this.when = when;
  }
}

export class Requirement {
  name = null;
  check = null;
  when = null;
  constructor({ name, check, when = null }) {
    this.name = name;
    this.check = check;
    this.when = when;
  }
}

export class GenericCastEfficiencyRequirement extends Requirement {
  constructor({ spell, ...others }) {
    super({
      name: <SpellLink id={spell.id} icon />,
      check: function () {
        const { efficiency, recommendedEfficiency: minor, averageIssueEfficiency: average, majorIssueEfficiency: major } = this.castEfficiency.getCastEfficiencyForSpellId(spell.id);
        return performanceForThresholds(efficiency, minor, average, major);
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
  renderRule(rule) {
    let lowest = null;
    const requirements = rule.requirements.call(this)
      .filter(this.whenFilter)
      .map(requirement => {
        const performance = requirement.check.call(this);
        lowest = lowest === null ? performance : Math.min(lowest, performance);
        return (
          <div className="col-md-4">
            <div className="flex">
              <div className="flex-main">
                {requirement.name}
              </div>
              <div className="flex-sub content-middle" style={{ width: 50 }}>
                <div className="performance-bar-container">
                  <div
                    className={`performance-bar small ${colorForPerformance(performance)}`}
                    style={{ width: `${performance * 100}%`, transition: 'background-color 800ms' }}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      });

    return (
      <Expandable
        key={rule.name}
        header={(
          <div className="flex" style={{ fontSize: '1.4em' }}>
            <div className="flex-sub content-middle" style={{ paddingRight: '1rem' }}>
              <div>{/* this div ensures vertical alignment */}
                {lowest > 0.666 ? <TickIcon style={{ color: 'green' }} /> : <CrossIcon style={{ color: 'red' }} />}
              </div>
            </div>
            <div className="flex-main">
              {rule.name}
            </div>
            <div className="flex-sub content-middle" style={{ width: 100 }}>
              <div className="performance-bar-container">
                <div
                  className={`performance-bar small ${colorForPerformance(lowest)}`}
                  style={{ width: `${lowest * 100}%`, transition: 'background-color 800ms' }}
                />
              </div>
            </div>
            <div className="flex-sub content-middle" style={{ paddingLeft: '1rem' }}>
              <div className="chevron">{/* this div ensures vertical alignment */}
                <ChevronIcon />
              </div>
            </div>
          </div>
        )}
      >
        <div className="row">
          {requirements}
        </div>
      </Expandable>
    );
  }

  render() {
    return (
      <div className="panel">
        <div className="panel-heading">
          <h2>Checklist</h2>
        </div>
        <div className="panel-body" style={{ padding: 0 }}>
          {this.rules
            .filter(this.whenFilter)
            .map(this.renderRule)}
        </div>
      </div>
    );
  }
}

export default Checklist;
