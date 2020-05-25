import React from 'react';
import SPELLS from 'common/SPELLS/index';
import { formatPercentage } from 'common/format';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';

import SpellLink from 'common/SpellLink';
import Events, { DamageEvent } from 'parser/core/Events';
import { Trans } from '@lingui/macro';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import ItemDamageDone from 'interface/ItemDamageDone';

class LightningShield extends Analyzer {
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
   * Example Log:
   */

  protected damage = 0;
  protected overchargeCount = 0;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.LIGHTNING_SHIELD_TALENT.id);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER)
        .spell(SPELLS.LIGHTNING_SHIELD),
      this.onDamage,
    );

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER)
        .spell(SPELLS.LIGHTNING_SHIELD_TALENT),
      this.onApplyBuff,
    );
  }

  onDamage(event: DamageEvent) {
    this.damage += event.amount + (event.absorbed || 0);
  }

  onApplyBuff() {
    this.overchargeCount += 1;
  }

  get damagePercent() {
    return this.owner.getPercentageOfTotalDamageDone(this.damage);
  }

  get damagePerSecond() {
    return this.damage / (this.owner.fightDuration / 1000);
  }


  get getLightningShieldUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.LIGHTNING_SHIELD_TALENT.id) / this.owner.fightDuration;
  }

  get suggestionThresholds() {
    return {
      actual: this.getLightningShieldUptime,
      isLessThan: {
        major: 1,
      },
      style: 'percentage',
    };
  }

  suggestions(when: any) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest: any, actual: any) => {
        return suggest(
          <Trans>
            You should fully utilize your <SpellLink id={SPELLS.LIGHTNING_SHIELD_TALENT.id} /> by using it before combat.
          </Trans>,
        )
          .icon(SPELLS.LIGHTNING_SHIELD_TALENT.icon)
          .actual(
            <Trans>
              You kept up <SpellLink id={SPELLS.LIGHTNING_SHIELD_TALENT.id} /> for ${formatPercentage(actual)}% of the fight.</Trans>,
          )
          .recommended(<>It is possible to keep up <SpellLink id={SPELLS.LIGHTNING_SHIELD_TALENT.id} /> for 100% of the fight by casting it pre-combat.</>);
      });
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="small"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText
          spell={SPELLS.LIGHTNING_SHIELD_TALENT}
        >
          <>
            <ItemDamageDone amount={this.damage} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default LightningShield;
