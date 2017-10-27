import React from 'react';
import { formatPercentage } from 'common/format';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import HealingDone from 'Parser/Core/Modules/HealingDone';

const MAX_SWIFTMEND_REDUCTION = 0.4;

const debug = false;

class T20_2Set extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    healingDone: HealingDone,
  };

  healing = 0;
  swiftmendReduced = 0;
  swiftmends = 0;
  swiftmendCooldown = 30;
  freeSwiftmends = 0;
  swiftmendHealing = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasBuff(SPELLS.RESTO_DRUID_T20_2SET_BONUS_BUFF.id);

    if (this.combatants.selected.hasTalent(SPELLS.PROSPERITY_TALENT.id)) {
      this.swiftmendCooldown = 27;
    }
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    const amount = event.amount + (event.absorbed || 0);

    if (spellId === SPELLS.SWIFTMEND.id) {
      const hpPercentage = (event.hitPoints - event.amount) / event.maxHitPoints;
      const cooldownReduction = (MAX_SWIFTMEND_REDUCTION - (hpPercentage * MAX_SWIFTMEND_REDUCTION));
      this.swiftmendReduced += this.swiftmendCooldown * cooldownReduction;
      this.swiftmends += 1;
      //this.freeSwiftmends = this.swiftmendReduced / this.swiftmendCooldown;
      this.swiftmendHealing += amount;
    }
    //this.swiftmendThroughput = (this.healing / this.swiftmends) * this.freeSwiftmends + this.swiftmendHealing / this.swiftmends;
  }

  on_finished() {
    if (debug) {
      console.log(`Swiftmends cast: ${this.swiftmends}`);
      console.log(`2P swiftmend reduction: ${this.swiftmendReduced.toFixed(1)}s`);
      console.log(`Avg reduction per swiftmend: ${(this.swiftmendReduced / this.swiftmends).toFixed(1)}s`);
    }
  }

  item() {
    const avgCooldownReduction = (this.swiftmendReduced / this.swiftmends) || 0;
    const freeSwiftmends = this.swiftmendReduced / this.swiftmendCooldown;
    const avgSwiftmendHealing = (this.swiftmendHealing / this.swiftmends) || 0;
    const throughput = avgSwiftmendHealing * freeSwiftmends;
    const throughputPercent = this.owner.getPercentageOfTotalHealingDone(throughput);

    return {
      id: `spell-${SPELLS.RESTO_DRUID_T20_2SET_BONUS_BUFF.id}`,
      icon: <SpellIcon id={SPELLS.RESTO_DRUID_T20_2SET_BONUS_BUFF.id} />,
      title: <SpellLink id={SPELLS.RESTO_DRUID_T20_2SET_BONUS_BUFF.id} />,
      result: (
        <dfn data-tip={`This gained you <b>${Math.floor(freeSwiftmends)} to ${Math.ceil(freeSwiftmends)} extra Swiftmends</b> over the course of the fight.<br><br>If you kept Swiftmend on CD and used all the extra casts this bonus allowed you, we multiply by your average Swiftmend healing to get total throughput of <b>${formatPercentage(throughputPercent)}%</b>. This is an idealized number, your actual benefit was probably less.`}>
          Reduced {avgCooldownReduction.toFixed(1)}s per cast / {this.swiftmendReduced.toFixed(1)}s total
        </dfn>
      ),
    };
  }

}

export default T20_2Set;
