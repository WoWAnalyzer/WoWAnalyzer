import React from 'react';
import { formatPercentage } from 'common/format';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { SpellIcon } from 'interface';
import BoringValueText from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';

import GuardianOfElune from './GuardianOfElune';

class FrenziedRegenGoEProcs extends Analyzer {
  static dependencies = {
    guardianOfElune: GuardianOfElune,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.GUARDIAN_OF_ELUNE_TALENT.id);
  }

  statistic() {
    const nonGoEFRegen = this.guardianOfElune.nonGoEFRegen;
    const GoEFRegen = this.guardianOfElune.GoEFRegen;
    if ((nonGoEFRegen + GoEFRegen) === 0) {
      return null;
    }
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(8)}
        size="flexible"
        tooltip={<>You cast <strong>{nonGoEFRegen + GoEFRegen}</strong> total {SPELLS.FRENZIED_REGENERATION.name} and <strong>{GoEFRegen}</strong> were buffed by 20%.</>}
      > 
        <BoringValueText label={<><SpellIcon id={SPELLS.FRENZIED_REGENERATION.id} /> Unbuffed Frenzied Regen </>} >           
              {`${formatPercentage(nonGoEFRegen / (nonGoEFRegen + GoEFRegen))}%`}          
        </BoringValueText>
      </Statistic>
    );
  }
}

export default FrenziedRegenGoEProcs;
