import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatNumber } from 'common/format';
import { TooltipElement } from 'common/Tooltip';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import calculateEffectiveHealing from 'parser/core/calculateEffectiveHealing';
import Combatants from 'parser/shared/modules/Combatants';

import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';

const UNAFFECTED_SPELLS = [
  SPELLS.ENVELOPING_MIST.id,
];

class EnvelopingMists extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  healingIncrease = 0;
  evmHealingIncrease = 0;
  gustsHealing = 0;
  lastCastTarget = null;
  numberToCount = 0;

  constructor(...args) {
    super(...args);
    this.evmHealingIncrease = this.selectedCombatant.hasTalent(SPELLS.MIST_WRAP_TALENT.id) ? .4 : .3;
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.ENVELOPING_MIST), this.castEnvelopingMist);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.handleEnvelopingMist);
  }

  castEnvelopingMist(event) {
    this.numberToCount += 1;
    this.lastCastTarget = event.targetID;
  
  }

  handleEnvelopingMist(event) {
    const targetId = event.targetID;
    const spellId = event.ability.guid;
    
    if (UNAFFECTED_SPELLS.includes(spellId)) {
      return;
    }

    if ((spellId === SPELLS.GUSTS_OF_MISTS.id) && (this.lastCastTarget === targetId) && this.numberToCount >0) {
      this.gustProc += 1;
      this.gustsHealing += (event.amount || 0) + (event.absorbed || 0);
      this.numberToCount -= 1;
    }
    
    if (this.combatants.players[targetId]) {
      if (this.combatants.players[targetId].hasBuff(SPELLS.ENVELOPING_MIST.id, event.timestamp, 0, 0) === true) {
        this.healingIncrease += calculateEffectiveHealing(event, this.evmHealingIncrease);
      }
    }
  }
 

  statistic() {
    return (
      <StatisticBox
        postion={STATISTIC_ORDER.OPTIONAL(50)}
        icon={<SpellIcon id={SPELLS.ENVELOPING_MIST.id} />}
        value={`${formatNumber(this.healingIncrease)}`}
        label={(
          <TooltipElement content="This is the effective healing contributed by the Enveloping Mist buff.">
            Healing Contributed
          </TooltipElement>
        )}
      />
    );
  }
}

export default EnvelopingMists;
