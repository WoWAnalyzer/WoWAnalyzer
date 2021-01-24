import React from 'react';
import Analyzer, { Options } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import Statistic from 'parser/ui/Statistic';
import BoringValueText from 'parser/ui/BoringValueText';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { SpellLink } from 'interface';

import RageTracker from '../core/RageTracker';

class WarMachine extends Analyzer {
  static dependencies = {
    rageTracker: RageTracker,
  };

  protected rageTracker!: RageTracker;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.WAR_MACHINE_TALENT_PROTECTION.id);
  }

  statistic() {
    const rageByAutoAttacks = this.rageTracker.getGeneratedBySpell(SPELLS.RAGE_AUTO_ATTACKS.id);
    const rageWastedByAutoAttacks = this.rageTracker.getWastedBySpell(SPELLS.RAGE_AUTO_ATTACKS.id);
    const rageFromWarMachine = (rageByAutoAttacks + rageWastedByAutoAttacks) / 3;
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringValueText label={<><SpellLink id={SPELLS.WAR_MACHINE_TALENT_PROTECTION.id} /> Extra Rage From Melees</>}>
          <>
            {rageFromWarMachine} <small>rage</small>
          </>
        </BoringValueText>
      </Statistic>
    );
  }
}

export default WarMachine;
