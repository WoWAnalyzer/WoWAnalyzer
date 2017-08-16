import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import Module from 'Parser/Core/Module';

import { formatNumber } from 'common/format';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

const debug = true;
const EVM_HEALING_INCREASE = .3;

const UNAFFECTED_SPELLS = [
    SPELLS.CRANE_HEAL.id,
  ];

class EnvelopingMists extends Module {
  healing = 0;

  on_byPlayer_heal(event) {
    const targetId = event.targetID;
    const spellId = event.ability.guid;

    if (UNAFFECTED_SPELLS.indexOf(spellId) !== -1) {
      debug && console.log('Exiting');
      return;
    }

    if(this.owner.combatants.players[targetId]) {
      if(this.owner.combatants.players[targetId].hasBuff(SPELLS.ENVELOPING_MISTS.id, event.timestamp, 0, 0) === true) {
        this.healing += calculateEffectiveHealing(event, EVM_HEALING_INCREASE);
      }
    }
  }

  on_finished() {
    if(debug) {
      console.log('EvM Healing Contribution: ' + this.healing);
    }
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.ENVELOPING_MISTS.id} />}
        value={`${formatNumber(this.healing)}`}
        label={(
          <dfn data-tip={`This is the effective healing contributed by the Eveloping Mists buff.`}>
            Healing Contributed
          </dfn>
        )}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL();
}

export default EnvelopingMists;
