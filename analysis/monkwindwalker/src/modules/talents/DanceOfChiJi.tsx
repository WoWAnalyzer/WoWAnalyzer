import { t } from '@lingui/macro';
import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer, { Options } from 'parser/core/Analyzer';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import { SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/EventFilter';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  CastEvent,
  DamageEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import React from 'react';

import { ABILITIES_AFFECTED_BY_DAMAGE_INCREASES } from '../../constants';

const DAMAGE_BOOST = 2

class DANCE_OF_CHI_JI extends Analyzer {
currentStacks: number = 0;

constructor( options: Options) {
    super(options);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.DANCE_OF_CHI_JI_BUFF),
      this.onApplyBuff,
    );
    this.addEventListener(
        Events.damage.by(SELECTED_PLAYER).spell(SPELLS.SPINNING_CRANE_KICK_DAMAGE),
        this.onDamage,
      );
}
    bonusDamage = 0;

  onApplyBuff(event: ApplyBuffEvent) {
    this.currentStacks = 1;
  }

  onDamage(event: DamageEvent) {
    const boostedDamage = calculateEffectiveDamage(event, DAMAGE_BOOST * this.currentStacks);
    this.bonusDamage += boostedDamage;
  }

  onRemoveBuff(event: RemoveBuffEvent) {
    this.currentStacks = 0;
  }

  get dps() {
    return (this.bonusDamage / this.owner.fightDuration) * 1000;
  }

 
  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(11)}
        size="flexible"
        tooltip={
          <>
            Total damage increase: {formatNumber(this.bonusDamage)}
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.DANCE_OF_CHI_JI_TALENT}>
          <img src="/img/sword.png" alt="Damage" className="icon" /> {formatNumber(this.dps)} DPS{' '}
          <small>
            {formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.bonusDamage))} % of
            total
          </small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
    
export default DANCE_OF_CHI_JI;
