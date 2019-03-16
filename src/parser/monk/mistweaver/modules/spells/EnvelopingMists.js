import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatNumber } from 'common/format';
import { TooltipElement } from 'common/Tooltip';

import Analyzer from 'parser/core/Analyzer';
import calculateEffectiveHealing from 'parser/core/calculateEffectiveHealing';
import Combatants from 'parser/shared/modules/Combatants';

import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';

const debug = false;

const UNAFFECTED_SPELLS = [
  SPELLS.CRANE_HEAL.id,
  SPELLS.ENVELOPING_MIST.id,
];

class EnvelopingMists extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  constructor(...args) {
    super(...args);
    if (this.selectedCombatant.hasTalent(SPELLS.MIST_WRAP_TALENT.id)) {
      this.EVM_HEALING_INCREASE=.4;
    }
  }

  EVM_HEALING_INCREASE = 0.3;//check for mistwrap
  healingIncrease = 0;
  gustsHealing = 0;
  lastCastTarget = null;
  countForGusts = false;
  numberToCount = 0;

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if (SPELLS.ENVELOPING_MIST.id !== spellId) {//bail early if not the right spell
      return;
    }
    if (this.combatants.players[event.targetID]) {
      if (this.combatants.players[event.targetID].hasBuff(SPELLS.ESSENCE_FONT_BUFF.id, event.timestamp, 0, 0) === true) {
        this.numberToCount++;
      }
    }
    this.numberToCount++;
    this.lastCastTarget = event.targetID;
  }

  on_byPlayer_heal(event) {
    const targetId = event.targetID;
    const spellId = event.ability.guid;

    if (UNAFFECTED_SPELLS.includes(spellId)) {
      debug && console.log('Exiting');
      return;
    }

    if ((spellId === SPELLS.GUSTS_OF_MISTS.id) && (this.lastCastTarget === event.targetID) && this.numberToCount >0) {
      this.gustProc += 1;
      this.gustsHealing += (event.amount || 0) + (event.absorbed || 0);
      this.numberToCount--;
    }

    if (this.combatants.players[targetId]) {
      if (this.combatants.players[targetId].hasBuff(SPELLS.ENVELOPING_MIST.id, event.timestamp, 0, 0) === true) {
        this.healingIncrease += calculateEffectiveHealing(event, this.EVM_HEALING_INCREASE);
        debug && console.log('Event Details for Healing Increase: ' + event.ability.name);
      }
    }
  }

  on_fightend() {
    if (debug) {
      console.log(`EvM Healing Contribution: ${this.healingIncrease}`);
      console.log(`EnM Boost`, this.EVM_HEALING_INCREASE);
      console.log("gusts env healing: ", this.gustsHealing);
    }
  }

  statistic() {
    return (
      <StatisticBox
        postion={STATISTIC_ORDER.OPTIONAL(50)}
        icon={<SpellIcon id={SPELLS.ENVELOPING_MIST.id} />}
        value={`${formatNumber(this.healingIncrease)}`}
        label={(
          <TooltipElement content="This is the effective healing contributed by the Eveloping Mists buff.">
            Healing Contributed
          </TooltipElement>
        )}
      />
    );
  }
}

export default EnvelopingMists;
