import React from 'react';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import ItemDamageDone from 'interface/ItemDamageDone';
import UptimeIcon from 'interface/icons/Uptime';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import { formatPercentage } from 'common/format';
import HIT_TYPES from 'game/HIT_TYPES';

const DAMAGE_BONUS_PER_STACK = 0.02;

class ControlledDestruction extends Analyzer {

  conduitRank: number = 0;

  bonusDamage = 0;

  constructor(props: Options) {
    super(props);
    this.active = this.selectedCombatant.hasLegendaryByBonusID(SPELLS.FEVERED_INCANTATION.bonusID);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
  }

  onDamage(event: DamageEvent) {
    if (event.hitType !== HIT_TYPES.CRIT) {
      return;
    }
    const buff = this.selectedCombatant.getBuff(SPELLS.FEVERED_INCANTATION_BUFF.id);
    if (buff && buff.stacks) {
      this.bonusDamage += calculateEffectiveDamage(event, DAMAGE_BONUS_PER_STACK * buff.stacks);
    }
  }

  get buffUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.FEVERED_INCANTATION_BUFF.id) / this.owner.fightDuration;
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.ITEMS}
        size="flexible"
      >
        <BoringSpellValueText spell={SPELLS.FEVERED_INCANTATION}>
          <ItemDamageDone amount={this.bonusDamage} /><br />
          <UptimeIcon /> {formatPercentage(this.buffUptime)}% <small>Buff uptime</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ControlledDestruction;
