import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';

import HealingDone from 'Parser/Core/Modules/HealingDone';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';
import ItemHealingDone from 'Interface/Others/ItemHealingDone';

const HEAL_INCREASE = 2;

const debug = false;

class T20_4Set extends Analyzer {
  static dependencies = {
    healingDone: HealingDone,
  };

  healing = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasBuff(SPELLS.RESTO_DRUID_T20_4SET_BONUS_BUFF.id);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.EFFLORESCENCE_HEAL.id && this.selectedCombatant.hasBuff(SPELLS.BLOSSOMING_EFFLORESCENCE.id)) {
        this.healing += calculateEffectiveHealing(event, HEAL_INCREASE);
    }
  }

  on_finished() {
    if (debug) {
      console.log(`4P Uptime: ${((this.selectedCombatant.getBuffUptime(SPELLS.BLOSSOMING_EFFLORESCENCE.id) / this.owner.fightDuration) * 100).toFixed(2)}%`);
      console.log(`4P Healing: ${this.healing}`);
    }
  }

  item() {
    const uptime = this.selectedCombatant.getBuffUptime(SPELLS.BLOSSOMING_EFFLORESCENCE.id) / this.owner.fightDuration;

    return {
      id: `spell-${SPELLS.RESTO_DRUID_T20_4SET_BONUS_BUFF.id}`,
      icon: <SpellIcon id={SPELLS.RESTO_DRUID_T20_4SET_BONUS_BUFF.id} />,
      title: <SpellLink id={SPELLS.RESTO_DRUID_T20_4SET_BONUS_BUFF.id} icon={false} />,
      result: (
        <dfn data-tip={`Blossoming Efflorescence uptime: <b>${formatPercentage(uptime)}%</b>`}>
          <ItemHealingDone amount={this.healing} />
        </dfn>
      ),
    };
  }

}

export default T20_4Set;
