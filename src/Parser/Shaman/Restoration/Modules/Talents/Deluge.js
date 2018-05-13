import React from 'react';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';

import Abilities from '../Abilities';
import {_isPlayerInsideHealingRain} from '../../Normalizers/DelugeNormalizer';

const DELUGE_HEALING_INCREASE = 0.20;

class Deluge extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    abilities: Abilities,
  };
  healing = 0;
  healingRainIndex = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.DELUGE_TALENT.id);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (spellId !== SPELLS.CHAIN_HEAL.id) {
      return;
    }

    const healingRainDuration = this.abilities.getExpectedCooldownDuration(SPELLS.HEALING_RAIN_CAST.id); // healing rain lasts longer than the duration, check for it
    if ((event.timestamp <= this.healingRainTimestamp + healingRainDuration) || (!this.healingRainTimestamp && event.timestamp <= this.owner.fight.start_time + healingRainDuration)) {
      if(_isPlayerInsideHealingRain(event, this.healingRainIndex)){
        this.healing += calculateEffectiveHealing(event, DELUGE_HEALING_INCREASE);
        return; // return so it doesn't double up with riptide
      }
    }

    const combatant = this.combatants.players[event.targetID];
    if (!combatant) {
      return;
    }

    const hasBuff = combatant.hasBuff(SPELLS.RIPTIDE.id, event.timestamp);
    if (!hasBuff) {
      return;
    }

    this.healing += calculateEffectiveHealing(event, DELUGE_HEALING_INCREASE);
  }

  on_byPlayer_begincast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.HEALING_RAIN_CAST.id) {
      return;
    }

    if(!event.isCancelled) {
      this.healingRainIndex += 1;
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if (spellId !== SPELLS.HEALING_RAIN_CAST.id) {
      return;
    }

    this.healingRainTimestamp = event.timestamp;
  }

  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.DELUGE_TALENT.id} />
        </div>
        <div className="flex-sub text-right">
          {formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing))} %
        </div>
      </div>
    );
  }

}

export default Deluge;
