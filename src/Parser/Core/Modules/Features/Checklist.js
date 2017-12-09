import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';

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
      name: spell.name,
      check: () => {
        const castEfficiency = this.castEfficiency.getAbility(spell.id);
        return castEfficiency.efficiency / castEfficiency.recommendedEfficiency;
      },
      ...others,
    });
  }
}

class Checklist extends Analyzer {
  static rules = [
  ];

  ruleFilter(rule) {
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
    return (
      <div key={rule.name}>
        {rule.name}
      </div>
    );
  }

  render() {
    return (
      <div className="panel">
        <div className="panel-heading">
          <h2>Checklist</h2>
        </div>
        <div className="panel-body">
          {this.constructor.rules
            .filter(this.ruleFilter)
            .map(this.renderRule)}
        </div>
      </div>
    );
  }
}

export default Checklist;
