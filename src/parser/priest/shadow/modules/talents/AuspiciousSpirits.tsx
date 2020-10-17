import React from 'react';

import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS/index';
import { formatNumber } from 'common/format';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import ItemDamageDone from 'interface/ItemDamageDone';

import { SPIRIT_DAMAGE_MULTIPLIER, SPIRIT_INSANITY_GENERATION } from '../../constants';

// Example log: /report/K3VAhbp9CtLwG81j/26-Heroic+Zul+-+Kill+(4:44)/6-Isentropy
class AuspiciousSpirits extends Analyzer {
  damage = 0;
  insanity = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.AUSPICIOUS_SPIRITS_TALENT.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.SHADOWY_APPARITION_DAMAGE), this.onApparitionDamage);
  }

  onApparitionDamage(event: DamageEvent) {
    this.damage += event.amount + (event.absorbed || 0);
    this.insanity += SPIRIT_INSANITY_GENERATION;
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={(
          <>
            {formatNumber(this.insanity)} Insanity generated.<br /><br />

            The damage displayed is the additional damage you gained from taking this talent.
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.AUSPICIOUS_SPIRITS_TALENT}>
          <>
            <ItemDamageDone amount={this.damage - (this.damage / SPIRIT_DAMAGE_MULTIPLIER)} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default AuspiciousSpirits;
