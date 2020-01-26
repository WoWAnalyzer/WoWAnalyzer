import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import ItemDamageDone from 'interface/ItemDamageDone';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText
  from 'interface/statistics/components/BoringSpellValueText';
import { DamageEvent } from '../../../../core/Events';

/**
 * Increases the damage of your pet's abilities by 30%.
 * Increases the effectiveness of your pet's Predator's Thirst, Endurance
 * Training, and Pathfinding passives by 50%.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/qZRdFv9Apg74wmMV#fight=3&type=damage-done
 */

const ASPECT_MULTIPLIER = 0.3;
const ABILITIES_NOT_AFFECTED: number[] = [
  SPELLS.MELEE.id,
  SPELLS.KILL_COMMAND_DAMAGE_BM.id,
  SPELLS.STOMP_DAMAGE.id,
];

class AspectOfTheBeast extends Analyzer {

  damage = 0;

  constructor(options: any) {
    super(options);
    this.active
      = this.selectedCombatant.hasTalent(SPELLS.ASPECT_OF_THE_BEAST_TALENT.id);
  }

  on_byPlayerPet_damage(event: DamageEvent) {
    const spellId = event.ability.guid;
    if (ABILITIES_NOT_AFFECTED.includes(spellId)) {
      return;
    }
    this.damage += calculateEffectiveDamage(event, ASPECT_MULTIPLIER);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={'TALENTS'}
      >
        <BoringSpellValueText spell={SPELLS.ASPECT_OF_THE_BEAST_TALENT}>
          <>
            <ItemDamageDone amount={this.damage} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default AspectOfTheBeast;
