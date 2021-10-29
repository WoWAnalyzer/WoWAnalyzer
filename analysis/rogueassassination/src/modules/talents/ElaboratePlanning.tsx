import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import Events, { DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import React from 'react';

import { ABILITIES_AFFECTED_BY_DAMAGE_INCREASES } from '../../constants';

const DAMAGE_BONUS = 0.1;

class ElaboratePlanning extends Analyzer {
  get percentUptime() {
    return (
      this.selectedCombatant.getBuffUptime(SPELLS.ELABORATE_PLANNING_BUFF.id) /
      this.owner.fightDuration
    );
  }

  bonusDmg = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.ELABORATE_PLANNING_TALENT.id);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(ABILITIES_AFFECTED_BY_DAMAGE_INCREASES),
      this.addBonusDamageIfBuffed,
    );
  }

  addBonusDamageIfBuffed(event: DamageEvent) {
    if (
      !this.selectedCombatant.hasBuff(SPELLS.ELABORATE_PLANNING_BUFF.id) &&
      !this.selectedCombatant.hasBuff(SPELLS.VANISH_BUFF.id)
    ) {
      return;
    }
    this.bonusDmg += calculateEffectiveDamage(event, DAMAGE_BONUS);
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={`${formatPercentage(this.percentUptime)} % uptime.`}
      >
        <BoringSpellValueText spellId={SPELLS.ELABORATE_PLANNING_TALENT.id}>
          <ItemDamageDone amount={this.bonusDmg} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ElaboratePlanning;
