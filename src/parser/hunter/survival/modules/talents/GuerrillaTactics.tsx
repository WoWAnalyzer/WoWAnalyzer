import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import { AFFECTED_BY_GUERRILLA_TACTICS, GUERRILLA_TACTICS_INIT_HIT_MODIFIER } from 'parser/hunter/survival/constants';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import ItemDamageDone from 'interface/ItemDamageDone';
import React from 'react';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Events, { DamageEvent } from 'parser/core/Events';

/**
 * Wildfire Bomb now has 2 charges, and the initial explosion deals 100% increased damage.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/Kk4nL12CDJVQ6Yyf#fight=34&type=damage-done&source=799
 */
class GuerrillaTactics extends Analyzer {

  damage = 0;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.GUERRILLA_TACTICS_TALENT.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(AFFECTED_BY_GUERRILLA_TACTICS), this.onDamage);
  }

  onDamage(event: DamageEvent) {
    this.damage += calculateEffectiveDamage(event, GUERRILLA_TACTICS_INIT_HIT_MODIFIER);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(2)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={SPELLS.GUERRILLA_TACTICS_TALENT}>
          <>
            <ItemDamageDone amount={this.damage} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }

}

export default GuerrillaTactics;
