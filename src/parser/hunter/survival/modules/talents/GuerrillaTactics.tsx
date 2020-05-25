import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import { AFFECTED_BY_GUERRILLA_TACTICS, GUERRILLA_TACTICS_INIT_HIT_MODIFIER } from 'parser/hunter/survival/constants';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import ItemDamageDone from 'interface/ItemDamageDone';
import React from 'react';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';

/**
 * Wildfire Bomb now has 2 charges, and the initial explosion deals 100% increased damage.
 *
 * Example log: https://www.warcraftlogs.com/reports/WBkTFfP6G4VcxjLz/#fight=1&source=8
 */
class GuerrillaTactics extends Analyzer {

  damage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.GUERRILLA_TACTICS_TALENT.id);
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (!AFFECTED_BY_GUERRILLA_TACTICS.includes(spellId)) {
      return;
    }
    this.damage += calculateEffectiveDamage(event, GUERRILLA_TACTICS_INIT_HIT_MODIFIER);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(2)}
        size="flexible"
        category={'TALENTS'}
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
