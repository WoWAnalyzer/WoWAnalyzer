import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/index';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import ItemManaGained from 'interface/others/ItemManaGained';

/**
 Casting a healing spell restores 12 mana over 8 sec. Stacks up to 2 times.
 
 Example Log: /report/qyzBLkQaXDJ7xdZN/5-Mythic+Taloc+-+Kill+(4:12)/23-포오서
 */
class EphemeralRecovery extends Analyzer {
  manaGained = 0;
  procs = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.EPHEMERAL_RECOVERY.id);
  }

  on_toPlayer_energize(event) {
    const spellId = event.ability.guid;

    if (spellId !== SPELLS.EPHEMERAL_RECOVERY_EFFECT.id) {
      return;
    }
    this.procs += 1;
    this.manaGained += event.resourceChange;
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.EPHEMERAL_RECOVERY.id}
        value={<ItemManaGained amount={this.manaGained} />}
        tooltip={`
          Total procs: ${this.procs}
        `}
      />
    );
  }
}

export default EphemeralRecovery;
