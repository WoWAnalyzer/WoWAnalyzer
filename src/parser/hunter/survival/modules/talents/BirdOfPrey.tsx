import React from 'react';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import Analyzer, { SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import { encodeTargetString } from 'parser/shared/modules/EnemyInstances';
import SpellLink from 'common/SpellLink';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import { RAPTOR_MONGOOSE_VARIANTS } from 'parser/hunter/survival/constants';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Events, { DamageEvent } from 'parser/core/Events';

const EXTENSION_PER_CAST = 1500;
const MS_BUFFER = 100;

/** Bird of Prey
 * Attacking your pet's target with Mongoose Bite, Raptor Strike, Butchery or Carve extends the duration of Coordinated Assault by  1.5 sec.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/6GjD12YkQCnJqPTz#fight=25&type=summary&source=19&translate=true
 */

class BirdOfPrey extends Analyzer {

  petTarget: string = '';
  playerTarget: string = '';
  coordinatedAssaultExtended = 0;
  wastedExtension = 0;
  timestampAoE = 0;
  targetsHitAoE: boolean[] = [];
  aoeChecked = false;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.BIRDS_OF_PREY_TALENT.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET), this.onPetDamage);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell([...RAPTOR_MONGOOSE_VARIANTS, SPELLS.CARVE, SPELLS.BUTCHERY_TALENT]), this.onPlayerDamage);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell([SPELLS.CARVE, SPELLS.BUTCHERY_TALENT]), this.onAoECast);
    this.addEventListener(Events.fightend, this.aoeCheck);
  }

  onAoECast() {
    this.aoeChecked = false;
  }

  onPetDamage(event: DamageEvent) {
    this.petTarget = encodeTargetString(event.targetID, event.targetInstance);
  }

  onPlayerDamage(event: DamageEvent) {
    if (!this.aoeChecked && this.timestampAoE > 0 && event.timestamp > this.timestampAoE + MS_BUFFER) {
      this.aoeCheck();
    }
    if (!this.selectedCombatant.hasBuff(SPELLS.COORDINATED_ASSAULT.id)) {
      return;
    }
    const spellId = event.ability.guid;
    this.playerTarget = encodeTargetString(event.targetID, event.targetInstance);
    if (spellId === SPELLS.CARVE.id || spellId === SPELLS.BUTCHERY_TALENT.id) {
      this.targetsHitAoE.push(this.playerTarget === this.petTarget);
      this.timestampAoE = event.timestamp;
    } else {
      if (this.playerTarget === this.petTarget) {
        this.coordinatedAssaultExtended += EXTENSION_PER_CAST;
      } else {
        this.wastedExtension += EXTENSION_PER_CAST;
      }
    }
  }

  aoeCheck() {
    if (this.targetsHitAoE.includes(true)) {
      this.coordinatedAssaultExtended += EXTENSION_PER_CAST;
    } else {
      this.wastedExtension += EXTENSION_PER_CAST;
    }
    this.targetsHitAoE = [];
    this.aoeChecked = true;
  }

  get birdPercentEffectiveness() {
    return {
      actual: this.percentExtension,
      isLessThan: {
        minor: 0.95,
        average: 0.85,
        major: 0.75,
      },
      style: 'percentage',
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

  suggestions(when: any) {
    when(this.birdPercentEffectiveness).addSuggestion((suggest: any, actual: any, recommended: any) => {
      return suggest(<>When talented into <SpellLink id={SPELLS.BIRDS_OF_PREY_TALENT.id} />, it's important to cast <SpellLink id={SPELLS.RAPTOR_STRIKE.id} />, <SpellLink id={SPELLS.MONGOOSE_BITE_TALENT.id} />, <SpellLink id={SPELLS.CARVE.id} /> or <SpellLink id={SPELLS.BUTCHERY_TALENT.id} /> on the same target as your pet is attacking.</>)
        .icon(SPELLS.BIRDS_OF_PREY_TALENT.icon)
        .actual(`${formatPercentage(actual)}% of abilities extending CA were used on your pets target`)
        .recommended(`${formatPercentage(recommended)}% is recommended`);
    });
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(1)}
        size="flexible"
        tooltip={(
          <>
            <ul>
              <li>You extended Coordinated Assault by {this.timeExtendedInSeconds} seconds.</li>
              <li>You lost out on {this.extensionTimeLostInSeconds} seconds of Coordinated Assault by attacking a different target than your pet.</li>
            </ul>
          </>
        )}
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={SPELLS.BIRDS_OF_PREY_TALENT}>
          <>
            <small>Extended CA by</small> {this.timeExtendedInSeconds}s
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default BirdOfPrey;
