import React from 'react';
import SPELLS from 'common/SPELLS';
import { formatPercentage, formatThousands } from 'common/format';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';

const REDUCTION_BONUS = 0.1;

// Example Log: https://www.warcraftlogs.com/reports/tBFv8P9R3kdDgHKJ#fight=1&type=damage-done
class Warpaint extends Analyzer {

  damageMitigated: number = 0;
  damageTaken: number = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(SPELLS.WARPAINT_TALENT.id);

    if(!this.active){
      return;
    }

    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.onPlayerDamageTaken);
  }

  onPlayerDamageTaken(event: DamageEvent) {
    const eventDamageTaken = ((event.amount || 0) + (event.absorbed || 0));
    if (this.selectedCombatant.hasBuff(SPELLS.ENRAGE.id)) {
      const preMitigatedDamage = eventDamageTaken / (1 - REDUCTION_BONUS);
      this.damageMitigated += preMitigatedDamage * REDUCTION_BONUS;
    }

    this.damageTaken += eventDamageTaken;
  }

  get damageMitigatedPercent() {
    if(this.damageTaken === 0) {
      return 0;
    }

    return this.damageMitigated / this.damageTaken;
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={<>Warpaint mitigated a total of <strong>{formatThousands(this.damageMitigated)}</strong> damage.</>}
      >
        <BoringSpellValueText spell={SPELLS.WARPAINT_TALENT}>
          <>
            {formatPercentage(this.damageMitigatedPercent)}% <small>damage mitigated</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Warpaint;
