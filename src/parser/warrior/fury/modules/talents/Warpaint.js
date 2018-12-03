import React from 'react';
import SPELLS from 'common/SPELLS';
import { formatPercentage, formatThousands } from 'common/format';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import Analyzer from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';

const REDUCTION_BONUS = 0.1;

class Warpaint extends Analyzer {

  damageMitigated = 0;
  damageTaken = 0;

  constructor(...args) {
    super(...args);

    this.active = this.selectedCombatant.hasTalent(SPELLS.WARPAINT_TALENT.id);

    if(!this.active){
      return;
    }

    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.onPlayerDamageTaken);
  }

  onPlayerDamageTaken(event) {
    if (this.selectedCombatant.hasBuff(SPELLS.ENRAGE.id)) {
      const preMitigatedDefensiveStance = (event.amount + event.absorbed) / (1 - REDUCTION_BONUS);
      this.damageMitigated += preMitigatedDefensiveStance * REDUCTION_BONUS;
    }

    this.damageTaken += event.amount + event.absorbed;
  }

  get damageMitigatedPercent() {
    if(this.damageTaken === 0) {
      return 0;
    }

    return this.damageMitigated / this.damageTaken;
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.WARPAINT_TALENT.id}
        value={`${formatPercentage(this.damageMitigatedPercent)}% damage mitigated`}
        label="Warpaint"
        tooltip={`Warpaint mitigated a total of <b>${formatThousands(this.damageMitigated)}</b> damage.`}
      />
    );
  }
}

export default Warpaint;