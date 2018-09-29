import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/index';
import SpellIcon from 'common/SpellIcon';
import { formatNumber } from "common/format";
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';

const MINIMUM_ABSORB_THRESHOLD = 0.05;

class WillOfTheNecropolis extends Analyzer {
  totalWotnAbsorbed = 0;
  currentWotnAbsorbed = 0;
  activated = 0;
  spellDamageId = 0;
  goodAbsorbCount = 0;
  nextEvent = false;


  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.WILL_OF_THE_NECROPOLIS_TALENT.id);
  }

  on_byPlayer_absorbed(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.WILL_OF_THE_NECROPOLIS_TALENT.id ) {
      return;
    }
    this.totalWotnAbsorbed += event.amount;
    this.currentWotnAbsorbed = event.amount;
    this.activated += 1;
    this.spellDamageId = event.extraAbility.guid;
    this.nextEvent = true;
  }

  on_toPlayer_damage(event) {
    const playerHealth = event.maxHitPoints;
    const absorbToHealthPercent = this.currentWotnAbsorbed / playerHealth;
    const spellId = event.ability.guid;
    if (spellId !== this.spellDamageId || this.nextEvent === false) {
      return;
    }
    this.nextEvent = false;
    this.playerHealth = event.maxHitPoints;
    if(absorbToHealthPercent > MINIMUM_ABSORB_THRESHOLD){
      this.goodAbsorbCount += 1;
    }
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.WILL_OF_THE_NECROPOLIS_TALENT.id} />}
        value={`${this.owner.formatItemHealingDone(this.totalWotnAbsorbed)}`}
        label="Will Of The Necropolis"
        tooltip={`<strong>Total Damage Absorbed: </strong> ${formatNumber(this.totalWotnAbsorbed)} </br>
                  <strong>Activated: </strong> ${this.activated}</br>
                  <strong>Absorbed 5% Max Health or more count: </strong> ${this.goodAbsorbCount}  `}

      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(5);

}

export default WillOfTheNecropolis;
