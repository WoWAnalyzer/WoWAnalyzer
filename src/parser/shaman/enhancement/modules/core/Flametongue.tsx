import React from 'react';
import { Trans } from '@lingui/macro';

import { formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import ItemDamageDone from 'interface/ItemDamageDone';
import UptimeIcon from 'interface/icons/Uptime';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import { FLAMETONGUE_BUFF_REFRESH_THRESHOLD } from '../../constants';

/**
 * Scorches your target, dealing (14.742% of Attack power) Fire damage,
 * and enhances your weapons with fire for 16 sec, causing each weapon attack
 * to deal up to (0 * Attack power) Fire damage.
 *
 * Warcraft Log: https://www.warcraftlogs.com/reports/Yq7wP2WTX1DLjVd9#fight=3&type=damage-done&ability=193796
 */
class Flametongue extends Analyzer {
  protected damageGained: number = 0;

  constructor(options: any) {
    super(options);

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell([SPELLS.FLAMETONGUE, SPELLS.FLAMETONGUE_ATTACK]), this.onDamage);
  }

  onDamage(event: DamageEvent) {
    this.damageGained += event.amount + (event.absorbed || 0);
  }

  get flametongueUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.FLAMETONGUE_BUFF.id) / this.owner.fightDuration;
  }

  get flametongueUptimeThreshold() {
    return {
      actual: this.flametongueUptime,
      isLessThan: {
        minor: 0.95,
        average: 0.95,
        major: 0.9,
      },
      style: 'percentage',
    };
  }

  suggestions(when: any) {
    when(this.flametongueUptimeThreshold)
      .addSuggestion(
        (suggest: any, actual: any, recommended: any) => {
          return suggest(<Trans>Maintain <SpellLink id={SPELLS.FLAMETONGUE.id} /> as long as possible. You can refresh this as early as {FLAMETONGUE_BUFF_REFRESH_THRESHOLD} seconds remaining on the buff.</Trans>)
            .icon(SPELLS.FLAMETONGUE.icon)
            .actual(<Trans>{formatPercentage(actual)}% uptime</Trans>)
            .recommended(<Trans>{formatPercentage(recommended, 0)}% is recommended</Trans>);
        },
      );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(3)}
        size="flexible"
      >
        <BoringSpellValueText spell={SPELLS.FLAMETONGUE}>
          <>
            <ItemDamageDone amount={this.damageGained} /><br />
            <UptimeIcon /> {formatPercentage(this.flametongueUptime, 2)}% <small>buff uptime</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Flametongue;
