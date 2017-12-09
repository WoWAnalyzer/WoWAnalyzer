import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';

export class Rule {
  name = null;
  requirements = null;
  when = null;
  constructor({ name, requirements, when }) {
    this.name = name;
    this.requirements = requirements;
    this.when = when;
  }
}
export class Requirement {
  name = null;
  check = null;
  when = null;
  constructor({ name, check, when }) {
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

  render() {
    return (
      <div className="panel">
        <div className="panel-heading">
          <h2>Checklist</h2>
        </div>
        <div className="panel-body">
          {this.constructor.rules.map(rule => {
            return (
              <div>
                {rule.name}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

export default Checklist;
