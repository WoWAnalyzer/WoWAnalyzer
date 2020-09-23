import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, DamageEvent } from 'parser/core/Events';
import SUGGESTION_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import { FIRESTARTER_THRESHOLD, HOT_STREAK_CONTRIBUTORS } from '../../constants';

const debug = false;

class CombustionFirestarter extends Analyzer {

  combustionCast = false;
  combustionDuringFirestarter = false;
  healthPercent = 1;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.FIRESTARTER_TALENT.id);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.COMBUSTION), this.onCombustion);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(HOT_STREAK_CONTRIBUTORS), this.onDamage);
  }

  //Checks to see if a new Combustion was cast. This variable is marked false once a damage event is triggered since we only want the first damage event in the Combustion (to get the health percentage)
  onCombustion(event: ApplyBuffEvent) {
    this.combustionCast = true;
  }

  //The Combustion Cast/Apply Buff event uses the Players Health/Max Health instead of the target, so we need to check the first direct damage event during combustion to get the target's health. If above 90% then Combustion was cast during Firestarter, which is a waste.
  onDamage(event: DamageEvent) {
    const hasCombustion = this.selectedCombatant.hasBuff(SPELLS.COMBUSTION.id);
    if (!hasCombustion || !this.combustionCast) {
      return;
    }

    this.combustionCast = false;
    if (event.hitPoints && event.maxHitPoints && event.hitPoints > 0) {
      this.healthPercent = event.hitPoints / event.maxHitPoints;
    }
    if (this.healthPercent > FIRESTARTER_THRESHOLD) {
      this.combustionDuringFirestarter = true;
      debug && this.log("Combustion Used During Firestarter");
    }
  }

  get SuggestionThresholds() {
    return {
      actual: this.combustionDuringFirestarter,
      isEqual: true,
      style: 'boolean',
    };
  }

  suggestions(when: any) {
    when(this.SuggestionThresholds)
      .addSuggestion((suggest: any) => {
        return suggest(<>You used <SpellLink id={SPELLS.COMBUSTION.id} /> while <SpellLink id={SPELLS.FIRESTARTER_TALENT.id} /> was active (While the boss was at 90% health or higher). Since Firestarter makes your spells a guaranteed crit anyway, you should wait until the boss is at 89% to use your Combustion.</>)
          .icon(SPELLS.COMBUSTION.icon)
          .staticImportance(SUGGESTION_IMPORTANCE.MAJOR);
      });
  }
}
export default CombustionFirestarter;
