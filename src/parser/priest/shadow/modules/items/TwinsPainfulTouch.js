import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

import Enemies from 'parser/core/modules/Enemies';
import Analyzer from 'parser/core/Analyzer';

import Voidform from '../spells/Voidform';

const LATENCY_BUFFER = 300;

function formatNumber(amount, decimals = 1) {
  return Math.round(amount * 10 * decimals) / (10 * decimals);
}

class TwinsPainfulTouch extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    voidform: Voidform,
  };

  totalApplied = 0;
  previousMindflayCast = null;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasFinger(ITEMS.THE_TWINS_PAINFUL_TOUCH.id);
  }

  on_byPlayer_applydebuff(event) {
    const spellID = event.ability.guid;
    if (spellID === SPELLS.MIND_FLAY.id && this.selectedCombatant.hasBuff(SPELLS.THE_TWINS_PAINFUL_TOUCH.id)) {
      this.previousMindflayCast = event.timestamp;
      return;
    }

    if (spellID === SPELLS.VAMPIRIC_TOUCH.id || spellID === SPELLS.SHADOW_WORD_PAIN.id) {
      // needs a latency buffer (and due to this, we cant check if combatant has the buff either)
      if (
        this.previousMindflayCast &&
        event.timestamp >= this.previousMindflayCast &&
        event.timestamp < (this.previousMindflayCast + LATENCY_BUFFER)
      ) {
        this.totalApplied += 1;
      }
    }
  }

  item() {
    const totalApplied = this.totalApplied || 0;

    return {
      item: ITEMS.THE_TWINS_PAINFUL_TOUCH,
      result: (
        <dfn data-tip={`The total amount of extra ${SPELLS.SHADOW_WORD_PAIN.name} and ${SPELLS.VAMPIRIC_TOUCH.name} applied by the legendary.`}>
          Applied {totalApplied} DOTs
          <br />{formatNumber(totalApplied / this.voidform.voidforms.length)} / Voidform
        </dfn>
      ),
    };
  }
}

export default TwinsPainfulTouch;
