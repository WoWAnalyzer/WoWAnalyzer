import React from 'react';

import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import { formatNumber } from 'common/format';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';

class EchoOfTheElementals extends Analyzer {
  procs = 0;
  damageGained = 0;
  relevantData=null;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.LAVA_SHOCK.id);
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.EARTH_SHOCK.id) {
      return;
    }
    const buff = this.selectedCombatant.getBuff(SPELLS.LAVA_SHOCK_BUFF.id);
    if (buff === undefined) {
      return;
    }
    this.damageGained+= buff.stacks*this.selectedCombatant.traitsBySpellId[SPELLS.LAVA_SHOCK.id];
    this.procs+=1;
  }


  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.LAVA_SHOCK.id}
        value={(
          <>
            {formatNumber(this.damageGained)} Damage Done <br />
            {formatNumber(this.procs)} procs
          </>
        )}
        tooltip={`Lava Shock did <b>${this.damageGained}</b> damage after <b>${formatNumber(this.procs)}</b> procs.`}
      />
    );
  }
}

export default EchoOfTheElementals;
