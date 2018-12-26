import React from 'react';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import Analyzer from 'parser/core/Analyzer';
import { encodeTargetString } from 'parser/shared/modules/EnemyInstances';
import SpellLink from 'common/SpellLink';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import { RAPTOR_MONGOOSE_VARIANTS } from 'parser/hunter/survival/constants';

const EXTENSION_PER_CAST = 1500;
const MS_BUFFER = 100;
const BOP_ABILITIES = [
  SPELLS.CARVE.id,
  SPELLS.BUTCHERY_TALENT.id,
  ...RAPTOR_MONGOOSE_VARIANTS,
];

/** Bird of Prey
 * Attacking your pet's target with Mongoose Bite, Raptor Strike, Butchery or Carve extends the duration of Coordinated Assault by  1.5 sec.
 *
 * Example log: https://www.warcraftlogs.com/reports/pNJbYdLrMW2ynKGa#fight=3&type=damage-done&source=16&translate=true
 */

class BirdOfPrey extends Analyzer {

  petTarget = null;
  playerTarget = null;
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
  get birdPercentEffectiveness() {
    return {
      actual: this.percentExtension,
      isLessThan: {
        minor: 0.95,
        average: 0.85,
        major: 0.75,
      },
      style: 'percent',
    };
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

  suggestions(when) {
    when(this.birdPercentEffectiveness).addSuggestion((suggest, actual, recommended) => {
      return suggest(<>When talented into <SpellLink id={SPELLS.BIRDS_OF_PREY_TALENT.id} />, it's important to cast <SpellLink id={SPELLS.RAPTOR_STRIKE.id} />, <SpellLink id={SPELLS.MONGOOSE_BITE_TALENT.id} />, <SpellLink id={SPELLS.CARVE.id} /> or <SpellLink id={SPELLS.BUTCHERY_TALENT.id} /> on the same target as your pet is attacking.</>)
        .icon(SPELLS.BIRDS_OF_PREY_TALENT.icon)
        .actual(`${formatPercentage(actual)}% of abilities extending CA were used on your pets target`)
        .recommended(`${formatPercentage(recommended)}% is recommended`);
    });
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.BIRDS_OF_PREY_TALENT.id}
        position={STATISTIC_ORDER.CORE(17)}
        value={`extended CA by ${this.timeExtendedInSeconds}s`}
        tooltip={`<ul><li>You extended Coordinated Assault by ${this.timeExtendedInSeconds} seconds.</li><li>You lost out on ${this.extensionTimeLostInSeconds} seconds of Coordinated Assault by attacking a different target than your pet.</li></ul>`}
      />
    );
  }
}

export default BirdOfPrey;
