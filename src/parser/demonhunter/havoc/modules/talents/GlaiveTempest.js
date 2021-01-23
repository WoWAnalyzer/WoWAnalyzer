import React from 'react';
import SPELLS from 'common/SPELLS';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { formatThousands } from 'common/format';
import Events from 'parser/core/Events';

class GlaiveTempest extends Analyzer {

  damage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.GLAIVE_TEMPEST_TALENT.id);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.GLAIVE_TEMPEST_DAMAGE), this.onDamageEvent);
  }

  onDamageEvent(event) {
    this.damage += event.amount + (event.absorb || 0);
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={(
          <>
            {formatThousands(this.damage)} Total damage<br />
          </>
      )}
      >
        <BoringSpellValueText spell={SPELLS.GLAIVE_TEMPEST_TALENT}>
          <>
          {this.owner.formatItemDamageDone(this.damage)}
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default GlaiveTempest;
