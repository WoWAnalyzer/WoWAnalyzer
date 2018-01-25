import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Wrapper from 'common/Wrapper';
import { formatMilliseconds } from 'common/format';
import Combatants from 'Parser/Core/Modules/Combatants';
import Analyzer from 'Parser/Core/Analyzer';
import SUGGESTION_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';

const DAMAGE_SPELLS = [
  SPELLS.FIREBALL.id,
  SPELLS.PYROBLAST.id,
  SPELLS.SCORCH.id,
  SPELLS.FIRE_BLAST.id,
  SPELLS.PHOENIXS_FLAMES,
];

const debug = false;

class CombustionFirestarter extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  combustionCasted = false;
  combustionDuringFirestarter = false;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.FIRESTARTER_TALENT.id);
  }

  on_toPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.COMBUSTION.id) {
      return;
    }
    this.combustionCasted = true;
  }

  //The Combustion Cast/Apply Buff event uses the Players Health/Max Health instead of the target, so we need to check the first direct damage event during combustion to get the target's health. If above 90% then Combustion was cast during Firestarter, which is a waste.
  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (!DAMAGE_SPELLS.includes(spellId) || !this.combatants.selected.hasBuff(SPELLS.COMBUSTION.id) || !this.combustionCasted) {
      return;
    }
    this.combustionCasted = false;
    const healthPercent = event.hitPoints / event.maxHitPoints;
    if (healthPercent > .90) {
      this.combustionDuringFirestarter = true;
      debug && console.log("Combustion Used During Firestarter @ " + formatMilliseconds(event.timestamp - this.owner.fight.start_time));
    }
  }

  get SuggestionThresholds() {
    return {
      actual: this.combustionDuringFirestarter,
      isEqual: true,
      style: 'boolean',
    };
  }

  suggestions(when) {
    when(this.SuggestionThresholds)
      .addSuggestion((suggest) => {
        return suggest(<Wrapper>You used <SpellLink id={SPELLS.COMBUSTION.id}/> while <SpellLink id={SPELLS.FIRESTARTER_TALENT.id}/> was active (While the boss was at 90% health or higher). Since Firestarter makes your spells a guaranteed crit anyway, you should wait until the boss is at 89% to use your Combustion.</Wrapper>)
          .icon(SPELLS.COMBUSTION.icon)
          .staticImportance(SUGGESTION_IMPORTANCE.MAJOR);
      });
  }
}
export default CombustionFirestarter;
