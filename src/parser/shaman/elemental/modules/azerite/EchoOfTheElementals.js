import React from 'react';

import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import { formatNumber } from 'common/format';
import TALENTS from 'common/SPELLS/talents/shaman';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';



class EchoOfTheElementals extends Analyzer {
  procs = 0;
  damageGained = 0;
  relevantData=null;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.ECHO_OF_THE_ELEMENTALS.id);
    this.relevantData=this.selectedCombatant.hasTalent(TALENTS.STORM_ELEMENTAL_TALENT.id)?this.elementalData.StormElemental:this.elementalData.StormElemental;
  }

  elementalData = {
    FireElemental: {
      summon: SPELLS.EMBER_ELEMENTAL_SUMMON.id,
      damageSpells: [
        SPELLS.EMBER_BLAST.id,
      ],
    },
    StormElemental: {
      summon: SPELLS.SPARK_ELEMENTAL_SUMMON.id,
      damageSpells: [
        SPELLS.SHOCKING_BLAST.id,
      ],
    },
  };

  on_byPlayer_summon(event) {
    const spellId = event.ability.guid;
    if (spellId !== this.relevantData.summon) {
      return;
    }

    this.procs += 1;
  }

  on_byPlayerPet_damage(event) {
    const spellId = event.ability.guid;
    if (!this.relevantData.damageSpells.includes(spellId)) {
      return;
    }
    this.damageGained+=event.amount;
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.ECHO_OF_THE_ELEMENTALS.id}
        value={(<>{formatNumber(this.damageGained)} damage</>)}
        tooltip={`Echo Of The Elemental did ${this.damageGained} with ${this.procs} summons`}
      />
    );
  }
}

export default EchoOfTheElementals;
