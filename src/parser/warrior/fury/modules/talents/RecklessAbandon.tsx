import React from 'react';
import SPELLS from 'common/SPELLS';
import { formatPercentage, formatNumber } from 'common/format';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { EnergizeEvent, DamageEvent } from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';

const BASE_RECKLESSNESS_DURATION = 10 * 1000; // 10 seconds;

// Example log: https://www.warcraftlogs.com/reports/q3gKvAx6TCaMLyFb#fight=22&type=damage-done&source=28
class RecklessAbandon extends Analyzer {
  damage: number = 0;
  instantRageGained: number = 0;
  rageGained: number = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(SPELLS.RECKLESS_ABANDON_TALENT.id);

    if (!this.active) {
      return;
    }

    this.addEventListener(Events.energize.by(SELECTED_PLAYER).spell(SPELLS.RECKLESSNESS), this.onRecklessAbandonEnergize);
    this.addEventListener(Events.energize.by(SELECTED_PLAYER).to(SELECTED_PLAYER), this.onPlayerEnergize);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onPlayerDamage);
  }

  hasLast4SecondsOfRecklessness(event: EnergizeEvent | DamageEvent) {
    const reck = this.selectedCombatant.getBuff(SPELLS.RECKLESSNESS.id);
    return reck && ((event.timestamp - reck.start) > BASE_RECKLESSNESS_DURATION);
  }

  onRecklessAbandonEnergize(event: EnergizeEvent) {
    this.instantRageGained += event.resourceChange;
  }

  onPlayerEnergize(event: EnergizeEvent) {
    if (this.hasLast4SecondsOfRecklessness(event)) {
      this.rageGained += event.resourceChange / 2;
    }
  }

  onPlayerDamage(event: DamageEvent) {
    if (this.hasLast4SecondsOfRecklessness(event)) {
      this.damage += event.amount + (event.absorbed || 0);
    }
  }

  get damagePercent() {
    return this.owner.getPercentageOfTotalDamageDone(this.damage);
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={(
            <>
              In the 4 additional seconds of Recklessness caused by Reckless Abandon:<br />
              Additional rage generated: <strong>{this.rageGained}</strong><br />
              Damage dealt: <strong>{formatNumber(this.damage)} ({formatPercentage(this.damagePercent)}%)</strong>
            </>
          )}
      >
        <BoringSpellValueText spell={SPELLS.RECKLESS_ABANDON_TALENT}>
          <>
            {formatNumber(this.instantRageGained)} instant rage
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default RecklessAbandon;
