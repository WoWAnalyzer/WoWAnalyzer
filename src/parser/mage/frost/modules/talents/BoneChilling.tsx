import React from 'react';
import SPELLS from 'common/SPELLS';
import Statistic from 'interface/statistics/Statistic';
import UptimeIcon from 'interface/icons/Uptime';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import Analyzer from 'parser/core/Analyzer';
import { SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/EventFilter';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';

import Events, { DamageEvent } from 'parser/core/Events';
import { formatNumber, formatPercentage } from 'common/format';
import { BONE_CHILLING_SPELLS, BONE_CHILLING_BONUS_PER_STACK } from '../../constants';

class BoneChilling extends Analyzer {

  totalDamage = 0;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.BONE_CHILLING_TALENT.id);
    if (this.active) {
      this.addEventListener(Events.damage.by(SELECTED_PLAYER | SELECTED_PLAYER_PET).spell(BONE_CHILLING_SPELLS), this.onAffectedDamage);
    }
  }

  onAffectedDamage(event: DamageEvent) {
    const buffInfo: any = this.selectedCombatant.getBuff(SPELLS.BONE_CHILLING_BUFF.id);
    if (!buffInfo) {
      return;
    }
    const mod = buffInfo.stacks * BONE_CHILLING_BONUS_PER_STACK;
    const increase = calculateEffectiveDamage(event, mod);
    this.totalDamage += increase;
  }

  get uptime() {
		return this.selectedCombatant.getBuffUptime(SPELLS.BONE_CHILLING_BUFF.id) / this.owner.fightDuration;
	}

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(90)}
        size="flexible"
        tooltip={`Total damage increase: ${formatNumber(this.totalDamage)}`}
      >
        <BoringSpellValueText spell={SPELLS.BONE_CHILLING_TALENT}>
          <UptimeIcon /> {formatPercentage(this.uptime)}% <small>Buff uptime</small><br />
          {this.owner.formatItemDamageDone(this.totalDamage)}
        </BoringSpellValueText>
      </Statistic>
    );
  }

}

export default BoneChilling;
