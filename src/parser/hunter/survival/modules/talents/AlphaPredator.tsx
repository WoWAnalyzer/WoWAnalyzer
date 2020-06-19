import React from 'react';

import Analyzer, { SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import ItemDamageDone from 'interface/ItemDamageDone';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import { ALPHA_DAMAGE_KC_MODIFIER } from 'parser/hunter/survival/constants';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Events, { DamageEvent } from 'parser/core/Events';

/**
 * Kill Command now has 2 charges, and deals 30% increased damage.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/ayK6THQGAB4Y8h9N#fight=15&type=summary&source=1415&translate=true
 */

class AlphaPredator extends Analyzer {

  damage = 0;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.ALPHA_PREDATOR_TALENT.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET).spell(SPELLS.KILL_COMMAND_DAMAGE_SV), this.onPetDamage);
  }

  onPetDamage(event: DamageEvent) {
    this.damage += calculateEffectiveDamage(event, ALPHA_DAMAGE_KC_MODIFIER);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(1)}
        size="flexible"
        tooltip={(
          <>
            This statistic shows the damage gained from the increased Kill Command damage. It does not reflect the potential damage gain from having 2 charges of Kill Command or from the focus gain from Kill Command overall.
          </>
        )}
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={SPELLS.ALPHA_PREDATOR_TALENT}>
          <>
            <ItemDamageDone amount={this.damage} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default AlphaPredator;
