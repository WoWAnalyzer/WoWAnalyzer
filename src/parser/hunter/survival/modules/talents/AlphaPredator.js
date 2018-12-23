import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import ItemDamageDone from 'interface/others/ItemDamageDone';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import { ALPHA_DAMAGE_KC_MODIFIER } from 'parser/hunter/survival/constants';

/**
 * Kill Command now has 2 charges, and deals 30% increased damage.
 *
 * Example log: https://www.warcraftlogs.com/reports/yNwk89Rt1HprGdXJ#fight=2&type=damage-done
 */

class AlphaPredator extends Analyzer {

  damage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.ALPHA_PREDATOR_TALENT.id);
  }

  on_byPlayerPet_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.KILL_COMMAND_DAMAGE_SV.id) {
      return;
    }
    this.damage += calculateEffectiveDamage(event, ALPHA_DAMAGE_KC_MODIFIER);
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.ALPHA_PREDATOR_TALENT.id}
        value={<ItemDamageDone amount={this.damage} />}
        tooltip="This statistic shows the damage gained from the increased Kill Command damage. It does not reflect the potential damage gain from having 2 charges of Kill Command or from the focus gain from Kill Command overall."
      />
    );
  }

}

export default AlphaPredator;
