import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import Events, { DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import React from 'react';

import { ABILITIES_AFFECTED_BY_POISON_DAMAGE_INCREASES } from '../../constants';

const DAMAGE_BONUS = 0.3;

class MasterPoisoner extends Analyzer {
  bonusDmg = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.MASTER_POISONER_TALENT.id);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(ABILITIES_AFFECTED_BY_POISON_DAMAGE_INCREASES),
      this.addBonusDamage,
    );
  }

  addBonusDamage(event: DamageEvent) {
    this.bonusDmg += calculateEffectiveDamage(event, DAMAGE_BONUS);
  }

  statistic() {
    return (
      <Statistic size="flexible" category={STATISTIC_CATEGORY.TALENTS}>
        <BoringSpellValueText spell={SPELLS.MASTER_POISONER_TALENT}>
          <ItemDamageDone amount={this.bonusDmg} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default MasterPoisoner;
