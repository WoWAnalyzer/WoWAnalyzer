import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';

import HealingDone from 'Parser/Core/Modules/HealingDone';

const MAX_SWIFTMEND_REDUCTION = 0.4;

const debug = false;

class T20_2Set extends Module {
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
    // TODO make this account for how often you ACTUALLY use swiftmend, as the 'throughput' number is very idealized

    return {
      id: `spell-${SPELLS.RESTO_DRUID_T20_2SET_BONUS_BUFF.id}`,
      icon: <SpellIcon id={SPELLS.RESTO_DRUID_T20_2SET_BONUS_BUFF.id} />,
      title: <SpellLink id={SPELLS.RESTO_DRUID_T20_2SET_BONUS_BUFF.id} />,
      result: (
        <dfn data-tip={`This number assumes you used all the extra Swiftmend casts this bonus allowed you, and multiplies by your Swiftmend's average healing. If you weren't good about using Swiftmend on cooldown, the actual benefit to you will be lower than listed.<br>
        <ul>
          <li>Gained ${Math.floor(freeSwiftmends)} possible extra Swiftmend casts</li>
          <li>Refunded an average of ${Math.round(avgCooldownReduction)}s cooldown per Swiftmend cast</li>
        <ul>
        `}>
          {this.owner.formatItemHealingDone(throughput)}
        </dfn>
      ),
    };
  }

}

export default T20_2Set;
