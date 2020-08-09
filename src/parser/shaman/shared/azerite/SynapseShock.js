import React from 'react';

import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { formatDuration, formatNumber, formatPercentage } from 'common/format';
import { calculateAzeriteEffects } from 'common/stats';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import Events, { EventType } from 'parser/core/Events';
import { currentStacks } from 'parser/shared/modules/helpers/Stacks';

const MAX_STACKS = 5;

const synapseShockStats = traits => Object.values(traits).reduce((obj, rank) => {
  const [intellect] = calculateAzeriteEffects(SPELLS.SYNAPSE_SHOCK.id, rank);
  obj.intellect += intellect;
  return obj;
}, {
  intellect: 0,
});
export const STAT_TRACKER = {
  intellect: combatant => synapseShockStats(combatant.traitsBySpellId[SPELLS.SYNAPSE_SHOCK.id]).intellect,
};

/*Lightning Bolt and Chain Lightning increase your Intellect by 19 per target hit for 15 sec,
  stacking up to 5 times.
*/

class SynapseShock extends Analyzer {
  intellect = 0;
  synShockStacks = [];
  lastStacks = 0;
  lastUpdate = this.owner.fight.start_time;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.SYNAPSE_SHOCK.id);
    this.synShockStacks = Array.from({ length: MAX_STACKS + 1 }, x => [0]);

    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.SYNAPSE_SHOCK_BUFF), this.handleStacks);
    this.addEventListener(Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.SYNAPSE_SHOCK_BUFF), this.handleStacks);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.SYNAPSE_SHOCK_BUFF), this.handleStacks);
    this.addEventListener(Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.SYNAPSE_SHOCK_BUFF), this.handleStacks);
    this.addEventListener(Events.fightend, this.handleStacks);
  }

  handleStacks(event) {
    this.synShockStacks[this.lastStacks].push(event.timestamp - this.lastUpdate);
    if (event.type === EventType.FightEnd) {
      return;
    }
    this.lastUpdate = event.timestamp;
    this.lastStacks = currentStacks(event);
  }

  get avgIntellect() {
    let avgStacks = 0;
    this.synShockStacks.forEach((elem, index) => {
      avgStacks += elem.reduce((a, b) => a + b) / this.owner.fightDuration * index;
    });
    return avgStacks * synapseShockStats(this.selectedCombatant.traitsBySpellId[SPELLS.SYNAPSE_SHOCK.id]).intellect;
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.SYNAPSE_SHOCK_BUFF.id}
        value={`${formatNumber(this.avgIntellect)} Average Intellect`}
        tooltip={<>Synapse Shock granted an average of <strong>{formatNumber(this.avgIntellect)}</strong> Intellect throughout the fight.</>}
      >
        <table className="table table-condensed">
          <thead>
            <tr>
              <th>Int-Bonus</th>
              <th>Time (s)</th>
              <th>Time (%)</th>
            </tr>
          </thead>
          <tbody>
            {this.synShockStacks.map((e, i) => (
              <tr key={i}>
                <th>{(i * synapseShockStats(this.selectedCombatant.traitsBySpellId[SPELLS.SYNAPSE_SHOCK.id]).intellect).toFixed(0)} int</th>
                <td>{formatDuration(e.reduce((a, b) => a + b, 0) / 1000)}</td>
                <td>{formatPercentage(e.reduce((a, b) => a + b, 0) / this.owner.fightDuration)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TraitStatisticBox>
    );
  }
}

export default SynapseShock;
