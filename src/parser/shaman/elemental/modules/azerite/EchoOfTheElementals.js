import React from 'react';

import SPELLS from 'common/SPELLS';
import Analyzer, {SELECTED_PLAYER, SELECTED_PLAYER_PET} from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import ItemDamageDone from 'interface/others/ItemDamageDone';

class EchoOfTheElementals extends Analyzer {
  procs = 0;
  damageGained = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.ECHO_OF_THE_ELEMENTALS.id);

    let summonSpell = SPELLS.EMBER_ELEMENTAL_SUMMON;
    let damageSpells = [SPELLS.EMBER_BLAST];
    if (this.selectedCombatant.hasTalent(SPELLS.STORM_ELEMENTAL_TALENT.id)) {
      summonSpell = SPELLS.SPARK_ELEMENTAL_SUMMON;
      damageSpells = [SPELLS.SHOCKING_BLAST];
    }
    this.addEventListener(Events.summon.by(SELECTED_PLAYER).spell(summonSpell), this.onSummon);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET).spell(damageSpells), this.onPetDamage);
  }

  onSummon(event) {
    this.procs += 1;
  }

  onPetDamage(event) {
    this.damageGained += event.amount;
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.ECHO_OF_THE_ELEMENTALS.id}
        value={<ItemDamageDone amount={this.damageGained} />}
        tooltip={`Echo Of The Elemental did ${this.damageGained} with ${this.procs} summons`}
      />
    );
  }
}

export default EchoOfTheElementals;
