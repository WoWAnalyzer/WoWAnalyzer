import React from 'react';

import SPELLS from 'common/SPELLS';
import UptimeIcon from 'interface/icons/Uptime';
import Enemies from 'parser/shared/modules/Enemies';
import { formatPercentage, formatThousands } from 'common/format';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import { SpellLink } from 'interface';

const LASHING_FLAMES_BONUS = 1;

/**
 * Lava Lash now increases the damage of Flame Shock on its target by 100% for 12 sec.
 *
 * Example Log:
 *
 */
class LashingFlames extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  protected buffedFlameShockDmg: number = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(SPELLS.LASHING_FLAMES_TALENT.id);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER)
        .spell(SPELLS.FLAME_SHOCK),
      this.onFlameShockDamage,
    );
  }

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.LASHING_FLAMES_DEBUFF.id) / this.owner.fightDuration;
  }

  get uptimeThreshold() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.99,
        average: 0.95,
        major: 0.85,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  onFlameShockDamage(event: DamageEvent) {
    const enemy = this.enemies.getEntity(event);

    if (!enemy || !enemy.hasBuff(SPELLS.LASHING_FLAMES_DEBUFF.id, event.timestamp)) {
      return;
    }

    this.buffedFlameShockDmg += calculateEffectiveDamage(event, LASHING_FLAMES_BONUS);
  }

  suggestions(when: When) {
    when(this.uptimeThreshold).addSuggestion((suggest, actual, recommended) => suggest(
      (
        <>
          Your <SpellLink id={SPELLS.LASHING_FLAMES_TALENT.id} /> uptime can be improved.
          As <SpellLink id={SPELLS.LASHING_FLAMES_DEBUFF.id} /> increases the damage of <SpellLink id={SPELLS.FLAME_SHOCK.id} /> on its target,{` `}
          try to maintain 100% uptime for maximum damage increase.
          To achieve this, you can strike the target with <SpellLink id={SPELLS.LAVA_LASH.id} />{` `}
          when <SpellLink id={SPELLS.LASHING_FLAMES_DEBUFF.id} /> is about to expire.
        </>
      ),
      )
        .icon(SPELLS.LASHING_FLAMES_TALENT.icon)
        .actual(<><SpellLink id={SPELLS.LASHING_FLAMES_DEBUFF.id} /> was active for {formatPercentage(actual)}% of the fight</>)
        .recommended(`recommended: ${formatPercentage(recommended)}%`),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={(
          <>
            Lashing Flames contributed {formatThousands(this.buffedFlameShockDmg)} total Flame Shock damage ({formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.buffedFlameShockDmg))} %).<br />
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.LASHING_FLAMES_TALENT}>
          <>
            <><UptimeIcon /> {formatPercentage(this.uptime)}% <small>uptime</small></>
            <br />
            <ItemDamageDone amount={this.buffedFlameShockDmg} /><br />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default LashingFlames;
