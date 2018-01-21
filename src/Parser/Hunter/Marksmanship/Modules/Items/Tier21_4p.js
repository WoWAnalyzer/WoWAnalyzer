import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import ItemDamageDone from 'Main/ItemDamageDone';

/**
 * Marked Shot has a 50% chance to fire at up to 3 additional targets hit by Marked Shot an additional time.
 */
class Tier21_4p extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  markedShotHitTargets = [];
  tierProcs = 0;
  damage = 0;
  casts = 0;
  hits = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasBuff(SPELLS.HUNTER_MM_T21_4P_BONUS.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.MARKED_SHOT.id) {
      return;
    }
    //empties the array to scan for new targets
    this.markedShotHitTargets.splice(0, this.markedShotHitTargets.length);
    this.casts += 1;
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.MARKED_SHOT_DAMAGE.id) {
      return;
    }
    this.hits += 1;
    const targetEventIndex = this.markedShotHitTargets.findIndex(target => target.targetID === event.targetID && target.targetInstance === event.targetInstance);
    if (targetEventIndex !== -1) {
      this.tierProcs += 1;
      this.damage += event.amount + (event.absorbed || 0);
    } else {
      this.markedShotHitTargets.push({
        targetID: event.targetID,
        targetInstance: event.targetInstance,
      });
    }
  }

  item() {
    return {
      id: `spell-${SPELLS.HUNTER_MM_T21_4P_BONUS.id}`,
      icon: <SpellIcon id={SPELLS.HUNTER_MM_T21_4P_BONUS.id} />,
      title: <SpellLink id={SPELLS.HUNTER_MM_T21_4P_BONUS.id} />,
      result: (
        <dfn data-tip={`${this.tierProcs} procs from ${this.casts} casts (${(this.tierProcs / this.casts).toFixed(2)} procs per cast) <br/>
${formatPercentage(this.tierProcs / this.hits)}% of Marked Shot hits came from the set bonus. `}>
          <ItemDamageDone amount={this.damage} />
        </dfn>
      ),
    };
  }
}

export default Tier21_4p;
