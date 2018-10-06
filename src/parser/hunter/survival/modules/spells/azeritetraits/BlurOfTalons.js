import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import SPELLS from 'common/SPELLS';
import { calculateAzeriteEffects } from 'common/stats';
import { formatDuration, formatNumber, formatPercentage } from 'common/format';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import ExpandableStatisticBox from 'interface/others/ExpandableStatisticBox';
import SpellIcon from 'common/SpellIcon';

const blurOfTalonsStats = traits => Object.values(traits).reduce((obj, rank) => {
  const [agility] = calculateAzeriteEffects(SPELLS.BLUR_OF_TALONS.id, rank);
  obj.agility += agility;
  obj.agility *= 1.65; //Hotfix from 26th September
  return obj;
}, {
  agility: 0,
});

export const STAT_TRACKER = {
  agility: combatant => blurOfTalonsStats(combatant.traitsBySpellId[SPELLS.BLUR_OF_TALONS.id]).agility,
};

//TODO implement speed when split scaling is possible

/**
 * During Coordinated Assault, Mongoose Bite or Raptor Strike increases your Agility by X and your Speed by X for 6 sec. Stacks up to 5 times.
 *
 * Example: https://www.warcraftlogs.com/reports/X7JRkvr1DbP9VGpW#fight=1&type=damage-done&source=18
 */

const MAX_BLUR_STACKS = 5;

class BlurOfTalons extends Analyzer {

  agility = 0;
  blurOfTalonStacks = [];
  lastBlurStack = 0;
  lastBlurUpdate = this.owner.fight.start_time;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.BLUR_OF_TALONS.id);
    if (!this.active) {
      return;
    }
    const { agility } = blurOfTalonsStats(this.selectedCombatant.traitsBySpellId[SPELLS.BLUR_OF_TALONS.id]);
    this.agility = agility;
    this.blurOfTalonStacks = Array.from({ length: MAX_BLUR_STACKS + 1 }, x => []);
  }

  handleStacks(event, stack = null) {
    if (event.type === 'removebuff' || isNaN(event.stack)) { //NaN check if player is dead during on_finish
      event.stack = 0;
    }
    if (event.type === 'applybuff') {
      event.stack = 1;
    }
    if (stack) {
      event.stack = stack;
    }
    this.blurOfTalonStacks[this.lastBlurStack].push(event.timestamp - this.lastBlurUpdate);
    this.lastBlurUpdate = event.timestamp;
    this.lastBlurStack = event.stack;
  }

  get blurOfTalonsTimesByStacks() {
    return this.blurOfTalonStacks;
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.BLUR_OF_TALONS_BUFF.id) {
      return;
    }
    this.handleStacks(event);
  }

  on_byPlayer_applybuffstack(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.BLUR_OF_TALONS_BUFF.id) {
      return;
    }
    this.handleStacks(event);
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.BLUR_OF_TALONS_BUFF.id) {
      return;
    }
    this.handleStacks(event);
  }

  on_finished(event) {
    this.handleStacks(event, this.lastBlurStack);
  }

  uptime() {
    return (this.selectedCombatant.getBuffUptime(SPELLS.BLUR_OF_TALONS_BUFF.id) / 1000).toFixed(1);
  }

  avgAgility() {
    const avgAgi = this.blurOfTalonStacks.reduce((sum, innerArray, outerArrayIndex) => {
      return sum + innerArray.reduce((sum, arrVal) => sum + ((arrVal * outerArrayIndex * this.agility) / this.owner.fightDuration), 0);
    }, 0);
    return avgAgi;
  }

  statistic() {
    return (
      <ExpandableStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        category={STATISTIC_CATEGORY.AZERITE_POWERS}
        icon={<SpellIcon id={SPELLS.BLUR_OF_TALONS.id} />}
        label="Blur of Talons"
        value={`${formatNumber(this.avgAgility())} average Agility`}
        tooltip={`Blur of Talons was up for a total of ${this.uptime()} seconds`}
      >
        <table className="table table-condensed">
          <thead>
            <tr>
              <th>Stacks</th>
              <th>Time (m:s)</th>
              <th>Time (%)</th>
            </tr>
          </thead>
          <tbody>
            {Object.values(this.blurOfTalonsTimesByStacks).map((e, i) => (
              <tr key={i}>
                <th>{i}</th>
                <td>{formatDuration(e.reduce((a, b) => a + b, 0) / 1000)}</td>
                <td>{formatPercentage(e.reduce((a, b) => a + b, 0) / this.owner.fightDuration)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ExpandableStatisticBox>
    );
  }
}

export default BlurOfTalons;
