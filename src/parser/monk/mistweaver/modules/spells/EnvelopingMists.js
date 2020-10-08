import React from 'react';

import SPELLS from 'common/SPELLS';
import { formatNumber } from 'common/format';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import calculateEffectiveHealing from 'parser/core/calculateEffectiveHealing';
import Combatants from 'parser/shared/modules/Combatants';

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
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.GUSTS_OF_MISTS), this.masteryEnvelopingMist);
  }

  castEnvelopingMist(event) {
    this.numberToCount += 1;
    this.lastCastTarget = event.targetID;
  }

  masteryEnvelopingMist(event) {
    const targetId = event.targetID;

    if ((this.lastCastTarget === targetId) && this.numberToCount > 0) {
      this.gustProc += 1;
      this.gustsHealing += (event.amount || 0) + (event.absorbed || 0);
      this.numberToCount -= 1;
    }
  }

  handleEnvelopingMist(event) {
    const targetId = event.targetID;
    const spellId = event.ability.guid;
    
    if (UNAFFECTED_SPELLS.includes(spellId)) {
      return;
    }
    
    if (this.combatants.players[targetId]) {
      if (this.combatants.players[targetId].hasBuff(SPELLS.ENVELOPING_MIST.id, event.timestamp, 0, 0, SELECTED_PLAYER.id) === true) {
        this.healingIncrease += calculateEffectiveHealing(event, this.evmHealingIncrease);
      }
    }
  }

  statistic() {
    return (
      <Statistic
          size="flexible"
          category={STATISTIC_CATEGORY.GENERAL}
          tooltip={<>This is the effective healing contributed by the Enveloping Mist buff.</>}
        >
          <BoringSpellValueText spell={SPELLS.ENVELOPING_MIST}>
            <>
              {formatNumber(this.healingIncrease)} <small>healing contributed by the buff</small>
            </>
          </BoringSpellValueText>
        </Statistic>
    );
  }
}

export default EnvelopingMists;
