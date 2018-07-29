import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import { encodeTargetString } from 'Parser/Core/Modules/EnemyInstances';
import STATISTIC_ORDER from 'Interface/Others/STATISTIC_ORDER';
import React from 'react';
import SpellIcon from 'common/SpellIcon';
import StatisticBox from 'Interface/Others/StatisticBox';

const BOP_ABILITIES = [
  SPELLS.RAPTOR_STRIKE.id,
  SPELLS.RAPTOR_STRIKE_AOTE.id,
  SPELLS.MONGOOSE_BITE_TALENT_AOTE.id,
  SPELLS.MONGOOSE_BITE_TALENT.id,
  SPELLS.CARVE.id,
  SPELLS.BUTCHERY_TALENT.id,
];

const EXTENSION_PER_CAST = 1500;
const MS_BUFFER = 100;

/**
 * Attacking your pet's target with Raptor Strike, Mongoose Bite,
 * Carve or Butchery extends the duration of Coordinated Assault by
 * 1.5 sec.
 */

class BirdsOfPrey extends Analyzer {

  petTarget;
  playerTarget;
  coordinatedAssaultExtended = 0;
  wastedExtension = 0;
  timestampAoE = 0;
  targetsHitAoE = [];

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.BIRDS_OF_PREY_TALENT.id);
  }

  on_byPlayerPet_damage(event) {
    this.petTarget = encodeTargetString(event.targetID, event.targetInstance);
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (!BOP_ABILITIES.includes(spellId) || !this.selectedCombatant.hasBuff(SPELLS.COORDINATED_ASSAULT.id)) {
      return;
    }
    this.playerTarget = encodeTargetString(event.targetID, event.targetInstance);
    if (spellId === SPELLS.CARVE.id || spellId === SPELLS.BUTCHERY_TALENT.id) {
      if (this.timestampAoE !== 0 && event.timestamp > this.timestampAoE + MS_BUFFER) {
        if (!this.targetsHitAoE.includes(this.petTarget)) {
          this.wastedExtension += EXTENSION_PER_CAST;
        } else {
          this.coordinatedAssaultExtended += EXTENSION_PER_CAST;
        }
        this.targetsHitAoE = [];
        this.timestampAoE = event.timestamp;
      }
      this.targetsHitAoE.push(this.playerTarget);
      return;
    }
    if (this.playerTarget !== this.petTarget) {
      this.wastedExtension += EXTENSION_PER_CAST;
      return;
    }
    this.coordinatedAssaultExtended += EXTENSION_PER_CAST;
  }

  get timeExtendedInSeconds() {
    return this.coordinatedAssaultExtended / 1000;
  }

  get extensionTimeLostInSeconds() {
    return this.wastedExtension / 1000;
  }

  get percentExtension() {
    return this.coordinatedAssaultExtended / (this.coordinatedAssaultExtended + this.wastedExtension);
  }

  get percentEffectiveness() {
    return {
      actual: this.percentExtension,
      isLessThan: {

      },
    }
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.BIRDS_OF_PREY_TALENT.id} />}
        value={`${this.timeExtendedInSeconds}/${this.extensionTimeLostInSeconds + this.timeExtendedInSeconds}s`}
        label="Coordinated Assault extension"
        tooltip={`You missed out on ${this.extensionTimeLostInSeconds}s of Coordinated Assault extension by attacking another target than your pet whilst you had Coordinated Assault up.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(11);

}

export default BirdsOfPrey;
