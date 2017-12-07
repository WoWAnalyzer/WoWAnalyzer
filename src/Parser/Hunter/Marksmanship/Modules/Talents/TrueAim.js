import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS/index';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage, formatNumber } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import getDamageBonus from "Parser/Hunter/Shared/Modules/getDamageBonus";
import SpellLink from 'common/SpellLink';

const MAX_STACKS = 10;
const TRUE_AIM_MODIFIER = 0.02;

class TrueAim extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  //stack counters
  _currentStacks = 0;
  startOfMaxStacks = 0;
  timeAtMaxStacks = 0;

  //starts -1 because the stacks drop at end of combat, but that shouldn't count as a time where it dropped
  timesDropped = -1;
  totalTimesDropped = -1;

  //bonusDmg
  bonusDmg = 0;
  aimedBonusDmg = 0;
  arcaneBonusDmg = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.TRUE_AIM_TALENT.id);
  }

  on_byPlayer_applydebuffstack(event) {
    const debuffId = event.ability.guid;
    if (debuffId !== SPELLS.TRUE_AIM_DEBUFF.id) {
      return;
    }
    //I can't use on_byPlayer_applydebuff as it won't work in conjunction with on_byplayer_removedebuff
    //so we do it this way, and just make a check if _currentStacks is 0, in which case we set it to 1 to indicate it already has been applied.
    if (this._currentStacks === 0) {
      this._currentStacks = 1;
    }
    this._currentStacks += 1;
    if (this._currentStacks === MAX_STACKS) {
      this.startOfMaxStacks = event.timestamp;
    }
  }
  on_byPlayer_removedebuff(event) {
    const debuffId = event.ability.guid;
    if (debuffId !== SPELLS.TRUE_AIM_DEBUFF.id) {
      return;
    }
    if (this._currentStacks === MAX_STACKS) {
      this.timeAtMaxStacks += event.timestamp - this.startOfMaxStacks;
    }
    //ensures Trickshot cleaving doesn't count as multiple resets of stacks
    if (this._currentStacks >= 3) {
      this.timesDropped += 1;
    }
    this.totalTimesDropped += 1;
    this._currentStacks = 0;
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.AIMED_SHOT.id && spellId !== SPELLS.ARCANE_SHOT.id) {
      return;
    }
    if (spellId === SPELLS.AIMED_SHOT.id) {
      this.aimedBonusDmg += getDamageBonus(event, (TRUE_AIM_MODIFIER * this._currentStacks));
    }
    if (spellId === SPELLS.ARCANE_SHOT.id) {
      this.arcaneBonusDmg += getDamageBonus(event, (TRUE_AIM_MODIFIER * this._currentStacks));
    }
    this.bonusDmg += getDamageBonus(event, (TRUE_AIM_MODIFIER * this._currentStacks));
  }

  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.TRUE_AIM_TALENT.id}>
            <SpellIcon id={SPELLS.TRUE_AIM_TALENT.id} noLink /> True Aim
          </SpellLink>
        </div>
        <div className="flex-sub text-right">
          {(this.owner.formatItemDamageDone(this.bonusDmg))}
        </div>
      </div>
    );
  }

  statistic() {
    const percentTimeAtMaxTAStacks = formatPercentage(this.timeAtMaxStacks / this.owner.fightDuration);
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.TRUE_AIM_DEBUFF.id} />}
        value={`${percentTimeAtMaxTAStacks} %`}
        label="10 stack uptime"
        tooltip={`You reset True Aim when you had 3 or more stacks (to exclude trickshot cleaving resets): ${this.timesDropped} times over the course of the encounter. <br />Your total amount of resets (including with trickshot cleaving) was: ${this.totalTimesDropped}. <br/>
True Aim contributed with ${formatNumber(this.bonusDmg)} - ${this.owner.formatItemDamageDone(this.bonusDmg)}.
<ul>
<li> Aimed Shot contributed ${formatPercentage(this.aimedBonusDmg / this.bonusDmg)}%.</li>
<li>Arcane Shot contributed ${formatPercentage(this.arcaneBonusDmg / this.bonusDmg)}%.</li>
</ul>`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(11);
}

export default TrueAim;
