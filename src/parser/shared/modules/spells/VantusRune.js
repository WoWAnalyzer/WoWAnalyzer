import React from 'react';

import { formatNumber } from 'common/format';

import Statistic from 'interface/statistics/Statistic';
import { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import BoringItemValueText from 'interface/statistics/components/BoringItemValueText';

import ITEMS from 'common/ITEMS/index';

import Analyzer from 'parser/core/Analyzer';
import HealingDone from 'parser/shared/modules/throughput/HealingDone';
import DamageDone from 'parser/shared/modules/throughput/DamageDone';
import DamageTaken from 'parser/shared/modules/throughput/DamageTaken';
import StatTracker from 'parser/shared/modules/StatTracker';

// https://www.wowhead.com/uncategorized-spells/name:Vantus+Rune:?filter=29:21;42:2;0:80100
const VANTUS_RUNE_VERSATILITY = 277;
const VERSATILITY_PER_PERCENT_THROUGHPUT = 85 * 100;
const VERSATILITY_PER_PERCENT_DAMAGE_REDUCTION = VERSATILITY_PER_PERCENT_THROUGHPUT * 2;
const VANTUS_RUNE_PERCENTAGE_THROUGHPUT = VANTUS_RUNE_VERSATILITY / VERSATILITY_PER_PERCENT_THROUGHPUT;
const VANTUS_RUNE_PERCENTAGE_DAMAGE_REDUCTION = VANTUS_RUNE_VERSATILITY / VERSATILITY_PER_PERCENT_DAMAGE_REDUCTION;

const runes = [
  ITEMS.VANTUS_RUNE_ULDIR,
  ITEMS.VANTUS_RUNE_BATTLE_OF_DAZARALOR,
  ITEMS.VANTUS_RUNE_CRUCIBLE_OF_STORMS,
  ITEMS.VANTUS_RUNE_ETERNAL_PALACE,
  ITEMS.VANTUS_RUNE_NYALOTHA,
];

/**
 * @property {HealingDone} healingDone
 * @property {DamageDone} damageDone
 * @property {DamageTaken} damageTaken
 */
class VantusRune extends Analyzer {
  static dependencies = {
    healingDone: HealingDone,
    damageDone: DamageDone,
    damageTaken: DamageTaken,
    statTracker: StatTracker,
  };

  activeRune = null;
  constructor(...args) {
    super(...args);
    const boss = this.owner.boss;

    /** @var {number|null} */
    const vantusRuneBuffId = boss ? boss.fight.vantusRuneBuffId : null;
    if (vantusRuneBuffId) {
      const match = this.selectedCombatant.getBuff(vantusRuneBuffId);
      if (match !== undefined) {
        this.activeRune = match;
      }
    }
    this.active = this.activeRune !== null;
    if(this.active){
      const that = this;
      runes.forEach(function(rune){
        if(that.activeRune.ability.abilityIcon === rune.icon){
          that.masterRune = rune;
        }
      });
      // StatTracker ignores the buff because its active on pull, but the stats aren't actually in the pull stats
      this.statTracker.forceChangeStats({versatility: VANTUS_RUNE_VERSATILITY}, vantusRuneBuffId, true);
    }
    if(this.masterRune === null) {//default to the icon to current tier
      this.masterRune = runes[runes.length - 1];
    }
  }

  statistic() {
    const fightDuration = this.owner.fightDuration;

    const damageDone = this.damageDone.total.effective - (this.damageDone.total.effective / (1 + VANTUS_RUNE_PERCENTAGE_THROUGHPUT));
    const healingDone = this.healingDone.total.effective - (this.healingDone.total.effective / (1 + VANTUS_RUNE_PERCENTAGE_THROUGHPUT));
    const damageReduced = (this.damageTaken.total.effective / (1 - VANTUS_RUNE_PERCENTAGE_DAMAGE_REDUCTION)) - this.damageTaken.total.effective;

    return (
      <Statistic
        position={STATISTIC_ORDER.UNIMPORTANT()}
        size="flexible"
      >
        <BoringItemValueText item={this.masterRune}>
        <img
          src="/img/sword.png"
          alt="Damage"
          className="icon"
        /> 
        {` ${formatNumber(damageDone / fightDuration * 1000)} DPS`}
        <br />
        <img
          src="/img/healing.png"
          alt="Healing"
          className="icon"
        /> 
        {` ${formatNumber(healingDone / fightDuration * 1000)} HPS`}
        <br />
        <img
          src="/img/shield.png"
          alt="Damage Taken"
          className="icon"
        /> 
        {` ${formatNumber(damageReduced / fightDuration * 1000)} DRPS`}
        </BoringItemValueText>
      </Statistic>

    );
  }
}

export default VantusRune;
