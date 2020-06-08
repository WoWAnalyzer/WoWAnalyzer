import React from 'react';
import { Trans } from '@lingui/macro';

import SPELLS from 'common/SPELLS/index';
import { formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';
import { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import Events, { DamageEvent } from 'parser/core/Events';
import ItemDamageDone from 'interface/ItemDamageDone';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import UptimeIcon from 'interface/icons/Uptime';
import EarlyBuffRefreshes from 'parser/shared/modules/earlybuffrefreshes/EarlyBuffRefreshes';
import uptimeSuggestion from 'parser/shared/modules/earlybuffrefreshes/EarlyBuffRefreshesUptimeSuggestion';
import countSuggestion from 'parser/shared/modules/earlybuffrefreshes/EarlyBuffRefreshesCountSuggestion';
import { FROSTBRAND_BUFF_DURATION_MS } from '../../constants';

/**
 * Frostbrand now also enhances your weapon's damage,
 * causing each of your weapon attacks to also deal
 * (3.159% of Attack power)% Frost damage.
 *
 * Example Log: https://www.warcraftlogs.com/reports/t347bkRxBDTjYF2v#fight=3&type=damage-done&ability=-196834
 */
class Hailstorm extends EarlyBuffRefreshes {
  public spell = SPELLS.FROSTBRAND;
  public buff = SPELLS.FROSTBRAND;
  protected duration = FROSTBRAND_BUFF_DURATION_MS;

  protected damageGained: number = 0;

  constructor(options: any) {
    super(options);

    if (!this.selectedCombatant.hasTalent(SPELLS.HAILSTORM_TALENT.id)) {
      this.active = false;
      return;
    }

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell([SPELLS.FROSTBRAND, SPELLS.HAILSTORM_ATTACK]), this.onDamage);
  }

  onDamage(event: DamageEvent) {
    this.damageGained += event.amount + (event.absorbed || 0);
  }

  get frostbrandUptimeThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.95,
        average: 0.95,
        major: 0.85,
      },
      style: 'percentage',
    };
  }

  get frostbrandEarlyRefreshThreshold() {
    return {
      actual: this.earlyRefreshes,
      isGreaterThan: {
        minor: 0,
        average: 3,
        major: 5,
      },
      style: 'number',
    };
  }

  suggestions(when: any) {
    uptimeSuggestion(when, this.frostbrandUptimeThresholds, this);
    countSuggestion(when, this.frostbrandEarlyRefreshThreshold, this);
  }

  statistic() {
    return (
      <Statistic
        category="TALENTS"
        position={STATISTIC_ORDER.CORE(1)}
        size="flexible"
      >
        <BoringSpellValueText spell={SPELLS.FROSTBRAND}>
          <>
            <ItemDamageDone amount={this.damageGained} /><br />
            <UptimeIcon /> {formatPercentage(this.uptime, 2)}% <small>buff uptime</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Hailstorm;
