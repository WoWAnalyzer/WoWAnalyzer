import { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';

import SPELLS from 'common/SPELLS';
import BaseHealerAzerite from './BaseHealerAzerite';

const HALF_HP = 0.5;

class SurgingTides extends BaseHealerAzerite {
  static TRAIT = SPELLS.SURGING_TIDES;
  static HEAL = SPELLS.SURGING_TIDES_ABSORB;

  potentialSurgingTideProcs = 0;
  currentAbsorbSize = 0;

  constructor(...args) {
    super(...args);
    this.disableStatistic = !this.hasTrait;

    this.addEventListener(Events.absorbed.by(SELECTED_PLAYER).spell(this.constructor.HEAL), this._processHealing);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(this.constructor.HEAL), this._onSurgingTidesApplication);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(this.constructor.HEAL), this._processOverheal);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.RIPTIDE), this._detectPotentialProcs);
  }

  _onSurgingTidesApplication(event) {
    this.currentAbsorbSize = event.absorb || 0;
  }

  _processOverheal(event) {
    let absorb = event.absorb || 0;
    const healPerTrait = this.azerite.map((trait) => (this.currentAbsorbSize) * trait.healingFactor);
    for (const [index, trait] of Object.entries(this.azerite)) {
      const overhealingValue = Math.min(healPerTrait[index], absorb);
      trait.overhealing += overhealingValue;
      absorb -= overhealingValue;
    }
  }

  _detectPotentialProcs(event) {
    if (event.tick) {
      return;
    }

    const currentHealth = Math.max(0, (event.hitPoints - event.amount) / event.maxHitPoints);
    if (currentHealth >= HALF_HP) {
      return;
    }
    this.potentialSurgingTideProcs += 1;
  }

  get surgingTideProcsPerMinute() {
    return (this.potentialSurgingTideProcs / (this.owner.fightDuration / 1000 / 60)).toFixed(2);
  }
}

export default SurgingTides;
