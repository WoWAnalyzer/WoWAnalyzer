import React from 'react';
import SPELLS from 'common/SPELLS';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import Statistic from 'parser/ui/Statistic';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';

import DarkShadow from './DarkShadow';
import DanceDamageTracker from '../../core/DanceDamageTracker';

class DarkShadowContribution extends DarkShadow {
  static dependencies = {
    ...DarkShadow.dependencies,
    danceDamageTracker: DanceDamageTracker,
  };

  protected danceDamageTracker!: DanceDamageTracker;

  get darkShadowDamageFactor() {
    return 0.25;
  }

  statistic() {
    const danceDamage = Object.keys(this.danceDamageTracker.abilities)
      .map(abilityId => this.danceDamageTracker.abilities.get(parseInt(abilityId))?.damageEffective || 0)
      .reduce((a, b) => a + b, 0) * this.darkShadowDamageFactor / (1 + this.darkShadowDamageFactor);

    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.GENERAL}
      >
        <BoringSpellValueText spell={SPELLS.DARK_SHADOW_TALENT}>
          <ItemDamageDone amount={danceDamage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default DarkShadowContribution;
