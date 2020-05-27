import React from 'react';
import { Trans } from '@lingui/macro';

import SPELLS from 'common/SPELLS/index';
import { formatPercentage } from 'common/format';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import SpellLink from 'common/SpellLink';
import Events, { DamageEvent } from 'parser/core/Events';
import DeathTracker from 'parser/shared/modules/DeathTracker';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import ItemDamageDone from 'interface/ItemDamageDone';

/**
 * Surround yourself with a shield of lightning for 1 hour.
 *
 * Melee attackers have a chance to suffer (3.6% of Attack power)
 * Nature damage, and add a charge to your shield.
 * When you Stormstrike, it gains 2 charges.
 *
 * At 20 charges, the shield overcharges, causing you to deal an additional
 * (6% of Attack power) Nature damage with each attack for 10 sec.
 *
 * Example Log: https://www.warcraftlogs.com/reports/Qwr8AWzHx6XJfy4p#fight=4&type=auras&ability=192106
 */
class LightningShield extends Analyzer {
  static dependencies = {
    deathTracker: DeathTracker,
  };

  protected deathTracker!: DeathTracker;

  protected damageGained: number = 0;
  protected overchargeCount: number = 0;

  constructor(options: any) {
    super(options);

    if(!this.selectedCombatant.hasTalent(SPELLS.LIGHTNING_SHIELD_TALENT.id)) {
      this.active = false;
      return;
    }

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER)
        .spell(SPELLS.LIGHTNING_SHIELD),
      this.onLightningShieldDamage,
    );
  }

  onLightningShieldDamage(event: DamageEvent) {
    this.damageGained += event.amount + (event.absorbed || 0);
  }

  get getLightningShieldUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.LIGHTNING_SHIELD_TALENT.id) / (this.owner.fightDuration - this.deathTracker.totalTimeDead);
  }

  get lightningShieldUptimeThreshold() {
    return {
      actual: this.getLightningShieldUptime,
      isLessThan: {
        minor: 1,
        average: 0.98,
        major: 0.95,
      },
      style: 'percentage',
    };
  }

  suggestions(when: any) {
    when(this.lightningShieldUptimeThreshold)
      .addSuggestion((suggest: any, actual: any, recommended: any) => {
        return suggest(
          <Trans>
            Your <SpellLink id={SPELLS.LIGHTNING_SHIELD_TALENT.id} /> uptime can be improved.
            You can benefit from the full passive damage increase by casting it before combat.
            {this.deathTracker.totalTimeDead ? <>Your time spent death has already been deducted from the required uptime.</> : ''}
          </Trans>,
        )
          .icon(SPELLS.LIGHTNING_SHIELD_TALENT.icon)
          .actual(<Trans>{formatPercentage(actual)}% uptime</Trans>,
          )
          .recommended(<Trans>{formatPercentage(recommended)}% is recommended.</Trans>);
      });
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE()}
        size="small"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={SPELLS.LIGHTNING_SHIELD_TALENT} >
          <>
            <ItemDamageDone amount={this.damageGained} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default LightningShield;
