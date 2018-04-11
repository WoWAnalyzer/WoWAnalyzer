import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';

import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import {HOTS_AFFECTED_BY_ESSENCE_OF_GHANIR} from '../../Constants';

const ETERNAL_RESTORATION_INCREASE = 1;
const EOG_BASE_DURATION = 8;
/**
 * Eternal Restoration (Artifact Trait)
 * Increases the duration of Essence of G'Hanir by 1 sec
 */
class EternalRestoration extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  rank = 0;
  healing = 0;
  lastEoGApplied = null;
  eogDuration = 0;

  on_initialized() {
    this.rank = this.combatants.selected.traitsBySpellId[SPELLS.ETERNAL_RESTORATION.id];
    this.active = this.rank > 0;
    this.eogDuration = ((this.rank * ETERNAL_RESTORATION_INCREASE)+EOG_BASE_DURATION)*1000;
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    // We are interested in the healing done on the last second of EoG
    if(this.lastEoGApplied != null
      && (this.lastEoGApplied + this.eogDuration - 1000) <= event.timestamp
      && this.combatants.selected.hasBuff(SPELLS.ESSENCE_OF_GHANIR.id)
      && HOTS_AFFECTED_BY_ESSENCE_OF_GHANIR.includes(spellId)) {
      if(!event.tick) {
        return;
      }
        this.healing += (event.amount + (event.absorbed || 0))/2;
    }
  }

  on_byPlayer_cast(event) {
    if (SPELLS.ESSENCE_OF_GHANIR.id !== event.ability.guid) {
      return;
    }
    this.lastEoGApplied = event.timestamp;
  }

  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.ETERNAL_RESTORATION.id} />
        </div>
        <div className="flex-sub text-right">
          {formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing))} %
        </div>
      </div>
    );
  }
}

export default EternalRestoration;
