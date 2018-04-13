import React from 'react';

import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';

const UNDULATION_HEALING_INCREASE = 0.5;
const BUFFER_MS = 300;

class Undulation extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  healing = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.UNDULATION_TALENT.id);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.HEALING_WAVE.id || spellId === SPELLS.HEALING_SURGE_RESTORATION.id) {
      const hasUndulation = this.combatants.selected.hasBuff(SPELLS.UNDULATION_BUFF.id, event.timestamp, BUFFER_MS, BUFFER_MS);

      if (hasUndulation) {
        this.healing += calculateEffectiveHealing(event, UNDULATION_HEALING_INCREASE);
      }
    } else if (spellId === SPELLS.DOWNPOUR.id) {
      const hasUndulation = this.combatants.selected.hasBuff(SPELLS.UNDULATION_BUFF.id, event.timestamp, BUFFER_MS, BUFFER_MS);

      if (hasUndulation) {
        this.healing += calculateEffectiveHealing(event, UNDULATION_HEALING_INCREASE);
      }
    }
  }

  on_feed_heal(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.HEALING_WAVE.id || spellId === SPELLS.HEALING_SURGE_RESTORATION.id) {
      const hasUndulation = this.combatants.selected.hasBuff(SPELLS.UNDULATION_BUFF.id, event.timestamp, BUFFER_MS, BUFFER_MS);

      if (hasUndulation) {
        this.healing += event.feed * UNDULATION_HEALING_INCREASE;
      }
    } else if (spellId === SPELLS.DOWNPOUR.id) {
      const hasUndulation = this.combatants.selected.hasBuff(SPELLS.UNDULATION_BUFF.id, event.timestamp, BUFFER_MS, BUFFER_MS);

      if (hasUndulation) {
        this.healing += event.feed * UNDULATION_HEALING_INCREASE;
      }
    }
  }

  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.UNDULATION_TALENT.id} />
        </div>
        <div className="flex-sub text-right">
          {formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing))} %
        </div>
      </div>
    );
  }

}

export default Undulation;

