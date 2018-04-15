import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import ItemDamageDone from 'Main/ItemDamageDone';
import HIT_TYPES from 'Parser/Core/HIT_TYPES';
import { formatPercentage } from 'common/format';

import { CRIT_MULTIPLIER, ECHOES } from '../../Constants.js';

class EchoesOfTheGreatSundering extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  echoesProcsCounter = 0;
  unbuffedBaseDamageSum = 0;
  buffedBaseDamageSum = 0;
  buffedEarthquakeDamage = 0;

  unbuffedTickCounter = 0;
  buffedTickCounter = 0;
  buffedCastCounter = 0;

  state = 0;  //0=guaranteed not buffed; 1=guaranteed buffed; 2=not too sure(use heuristic)
  endtime = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasShoulder(ITEMS.ECHOES_OF_THE_GREAT_SUNDERING.id);
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.ECHOES_OF_THE_GREAT_SUNDERING_BUFF.id) {
      this.echoesProcsCounter += 1;
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.EARTHQUAKE.id)
      return;

    if (this.combatants.selected.hasBuff(SPELLS.ECHOES_OF_THE_GREAT_SUNDERING_BUFF.id, event.timestamp)) {
      this.buffedCastCounter++;
      this.endtime = event.timestamp + ECHOES.PROC_DURATION + ECHOES.LAG_TOLERANCE;
      this.state = 1;
    }
    else {
      if (event.timestamp < this.endtime) {
        this.state = 2;
      }
    }
  }

  on_byPlayer_damage(event) {
    if (event.timestamp > this.endtime)
      this.state = 0;

    const spellId = event.ability.guid;
    if (spellId !== SPELLS.EARTHQUAKE_DAMAGE.id)
      return;

    const critMultiplier = (event.hitType === HIT_TYPES.CRIT) ? CRIT_MULTIPLIER : 1;
    const baseDamage = event.amount / critMultiplier;

    switch (this.state) {
      case 0:
        this.unbuffedBaseDamageSum += baseDamage;
        this.unbuffedTickCounter++;
        break;
      case  1:
        this.buffedEarthquakeDamage += event.amount;
        this.buffedBaseDamageSum += baseDamage;
        this.buffedTickCounter++;
        break;
      case 2:
        if (this.buffedBaseDamageSum !== 0 && this.buffedTickCounter > 0) {
          const averageBuffedBaseDamage = this.buffedBaseDamageSum / this.buffedTickCounter;
          if (Math.abs(baseDamage / averageBuffedBaseDamage) < ECHOES.TRESHOLD_PERCENTAGE) {
            this.buffedEarthquakeDamage += event.amount;
            this.buffedBaseDamageSum += baseDamage;
            this.buffedTickCounter++;
            console.log(this.buffedBaseDamageSum);
            return;
          }
        }
        if (this.unbuffedBaseDamageSum !== 0 && this.unbuffedTickCounter > 0) {
          const averageUnbuffedBaseDamage = this.unbuffedBaseDamageSum / this.unbuffedTickCounter;
          if (Math.abs(baseDamage / averageUnbuffedBaseDamage) < ECHOES.TRESHOLD_PERCENTAGE) {
            this.unbuffedEarthquakeDamage += event.amount;
            this.unbuffedBaseDamageSum += baseDamage;
            this.unbuffedTickCounter++;
            console.log(this.unbuffedBaseDamageSum);
            return;
          }
        }
        break;
      default:
        break;
    }
  }

  item() {
    return {
      item: ITEMS.ECHOES_OF_THE_GREAT_SUNDERING,
      result: (
        <dfn data-tip={`Your utiliziation of Echoes of the Great Sundering :<ul><li> Buffed Earthquakes: ${this.buffedCastCounter}.</li><li>Total procs: ${this.echoesProcsCounter} procs</li></ul>`}>
          Earthquake procs used: {formatPercentage(this.buffedCastCounter / this.echoesProcsCounter)}%<br />
          <ItemDamageDone amount={this.buffedEarthquakeDamage} />
        </dfn>
      ),
    };
  }
}

export default EchoesOfTheGreatSundering;
