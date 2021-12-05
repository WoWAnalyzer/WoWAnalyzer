import { t } from '@lingui/macro';
import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer, { Options } from 'parser/core/Analyzer';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import { SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/EventFilter';
import Events, { DamageEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import React from 'react';
import DonutChart from 'parser/ui/DonutChart';

import { ABILITIES_AFFECTED_BY_T28_4 } from '../../constants';

const MOD_T28_4 = 0.2;

class T28_4 extends Analyzer {

  castsPPWDP: number = 0;
  castsPPRSK: number = 0;
  castsPPBOK: number = 0;
  castsPPFOF: number = 0;
  castsPPSCK: number = 0;
  castsPPOTHER: number = 0;

  castsPP: number = 0;
  
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasBUFF(SPELLS.T28_PRIMORDIAL_POWER.id);
    if (this.active) {
      this.addEventListener(
        Events.damage
          .by(SELECTED_PLAYER | SELECTED_PLAYER_PET)
          .spell(ABILITIES_AFFECTED_BY_T28_4),
        this.onAffectedDamage,
      );
    }
    this.addEventListener(
    Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.T28_PRIMORDIAL_POWER.id),
    this.onPPBUFFS,
    );
  }
  totalDamage = 0;

  onAffectedDamage(event: DamageEvent) {
    const buffInfo = this.selectedCombatant.getBuff(SPELLS.T28_PRIMORDIAL_POWER.id);
    if (!buffInfo) {
      return;
    }
    const increase = calculateEffectiveDamage(event, mod);
    this.totalDamage += increase;
  }


  get dps() {
    return (this.totalDamage / this.owner.fightDuration) * 1000;
  }

  // yeppers

PPBUFFS(event: BuffEvent) {
  this.castsPP +=3
}

 if (this.selectedCombatant.hasBuff(SPELLS.T28_PRIMORDIAL_POWER.id)) {
      if (SPELLS.RISING_SUN_KICK.id === spellId) {
        this.castsPPRSK += 1;
      }
      if (SPELLS.WHIRLING_DRAGON_PUNCH.id === spellId) {
        this.castsPPWDP += 1;
      }
      if (SPELLS.FISTS_OF_FURY.id === spellId) {
        this.castsPPFOF += 1;
      }
      if (SPELLS.BLACKOUT_KICK.id === spellId) {
        this.castsPPBOK += 1;
      }
      if (SPELLS.SPINNING_CRANE_KICK.id === spellId) {
        this.castsPPSCK += 1;
      }
  }
  
castsPPOTHER = castsPP-(castsPPRSK+castsPPWDP+castsPPFOF+castsPPBOK+castsPPSCK


  renderCastRatioChart() {
    const items = [
      {
        color: '#00b159',
        label: 'Whirling Dragon Punch',
        spellId: SPELLS.WHIRLING_DRAGON_PUNCH.id,
        value: this.castsPPWDP,
      },
      {
        color: '#db00db',
        label: 'Blackout Kick',
        spellId: SPELLS.BLACKOUT_KICK.id,
        value: this.castsPPBOK,
      },
      {
        color: '#f37735',
        label: 'Spinning Crane Kick',
        spellId: SPELLS.SPINNING_CRANE_KICK.id,
        value: this.castsPPSCK,
      },
      {
        color: '#ffc425',
        label: 'Rising Sun Kick',
        spellId: SPELLS.RISING_SUN_KICK.id,
        value: this.castsPPRSK,
      },
      {
        color: '#4c90cf',
        label: 'Fists of Fury',
        spellId: SPELLS.FISTS_OF_FURY_CAST.id,
        value: this.castsPPFOF,
      },
      {
        color: '#000000',
        label: 'Other',
        spellId: SPELLS.TIGER_PALM.id,
        value: this.castsPPOTHER,
      },
    ];

    return <DonutChart items={items} />;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(11)}
        size="flexible"
        tooltip={
          <>
            Total damage increase: {formatNumber(this.totalDamage)}
            <br />
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.T28_PRIMORDIAL_POWER.id}>
          <img src="/img/sword.png" alt="Damage" className="icon" /> {formatNumber(this.dps)} DPS{' '}
          <small>
            {formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.totalDamage))} % of
            total
          </small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default T28_4;
