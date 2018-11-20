import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import HIT_TYPES from 'game/HIT_TYPES';
import StatTracker from 'parser/shared/modules/StatTracker';
import SpellLink from 'common/SpellLink';
import { formatDuration, formatPercentage } from 'common/format';
import React from 'react';
import StatisticBox from 'interface/others/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';

const MAX_FURIOUS_SLASH_STACKS = 3;

class FuriousSlash extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  furiousSlashStacks = [];
  lastFuriousSlashStack = 0;
  lastFuriousSlashUpdate = this.owner.fight.start_time;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.FURIOUS_SLASH_TALENT.id);
    this.furiousSlashStacks = Array.from({ length: MAX_FURIOUS_SLASH_STACKS + 1 }, x => []);
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.FURIOUS_SLASH_TALENT.id || event.hit_type === HIT_TYPES.DODGE) {
      return;
    }
    let stack = null;
    if (!this.lastFuriousSlashStack) {
      stack = 1;
    } else {
      if (this.lastFuriousSlashStack < MAX_FURIOUS_SLASH_STACKS) {
        stack = this.lastFuriousSlashStack + 1;
      } else {
        stack = MAX_FURIOUS_SLASH_STACKS;
      }
    }
    this.furiousSlashStacks[this.lastFuriousSlashStack].push(event.timestamp - this.lastFuriousSlashUpdate);
    this.lastFuriousSlashUpdate = event.timestamp;
    this.lastFuriousSlashStack = stack;
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.FURIOUS_SLASH_TALENT_BUFF.id) {
      return;
    }

    this.furiousSlashStacks[this.lastFuriousSlashStack].push(event.timestamp - this.lastFuriousSlashUpdate);
    this.lastFuriousSlashUpdate = event.timestamp;
    this.lastFuriousSlashStack = 0;
  }

  get furiousSlashTimesByStack() {
    return this.furiousSlashStacks.furiousSlashTimesByStacks;
  }

  get maxStackUptime() {
    const stacks = Object.values(this.furiousSlashTimesByStack).map((e, i) => e.reduce((a, b) => a + b, 0));
    return stacks[stacks.length - 1];
    //find the highest stack count possible, and return the uptime at that amount of stacks
  }

  get uptimeSuggestionThresholds() {
    return {
      actual: (this.maxStackUptime / this.owner.fightDuration),
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.85,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.uptimeSuggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(<>Your <SpellLink id={SPELLS.FURIOUS_SLASH_TALENT.id} /> uptime can be improved. Try to keep the Furious Slash buff at maximum stacks.</>)
        .icon(SPELLS.FURIOUS_SLASH_TALENT.icon)
        .actual(`${formatPercentage(actual)}% Furious Slash Uptime At Maximum Stacks`)
        .recommended(`>${formatPercentage(recommended)} is recommended`);
    });
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(59)}
        icon={<SpellIcon id={SPELLS.FURIOUS_SLASH_TALENT.id} />}
        value={`${formatPercentage(this.maxStackUptime / this.owner.fightDuration)}%`}
        label="Furious Slash Max Stack Buff Uptime">
        <table className="table table-condensed">
          <thead>
            <tr>
              <th>Stacks</th>
              <th>Time (s)</th>
              <th>Time (%)</th>
            </tr>
          </thead>
          <tbody>
            {Object.values(this.furiousSlashTimesByStack).map((e, i) => (
              <tr key={i}>
                <th>{i}</th>
                <td>{formatDuration(e.reduce((a, b) => a + b, 0) / 1000)}</td>
                <td>{formatPercentage(e.reduce((a, b) => a + b, 0) / this.owner.fightDuration)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </StatisticBox>
    );
  }
}

export default FuriousSlash;
