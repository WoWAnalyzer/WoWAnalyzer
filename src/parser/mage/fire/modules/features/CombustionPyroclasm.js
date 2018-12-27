import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';

const debug = false;
const COMBUSTION_DURATION = 10000;
const EXPECTED_PYROCLASM_BUFFER = 4000;
const PYROCLASM_DAMAGE_MODIFIER = 225;

class CombustionPyroclasm extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    abilityTracker: AbilityTracker,
  };

  combustionCastEvent = null;
  pyroblastCastEvent = null;
  expectedPyroblastCasts = 0;
  actualPyroblastCasts = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.PYROCLASM_TALENT.id);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.PYROBLAST), this.onPyroblast);
    this.addEventListener(Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.COMBUSTION), this.onCombustion);
    this.addEventListener(Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.PYROCLASM_BUFF), this.onPyroclasmApplied);
    this.addEventListener(Events.applybuffstack.to(SELECTED_PLAYER).spell(SPELLS.PYROCLASM_BUFF), this.onPyroclasmApplied);
    this.addEventListener(Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.PYROCLASM_BUFF), this.onPyroclasmRemoved);
    this.addEventListener(Events.removebuffstack.to(SELECTED_PLAYER).spell(SPELLS.PYROCLASM_BUFF), this.onPyroclasmRemoved);
    this.addEventListener(Events.fightend, this.onFinished);
  }

  //Get the cast event for Pyroblast to be used elsewhere
  onPyroblast(event) {
    this.pyroblastCastEvent = event;
  }

  onCombustion(event) {
    const hasPyroclasm = this.selectedCombatant.hasBuff(SPELLS.PYROCLASM_BUFF.id);
    this.combustionCastEvent = event;
    if (hasPyroclasm) {
      this.expectedPyroblastCasts += 1;
      debug && this.log("Combustion started with Pyroclasm proc");
    }
  }

  //When the player gets a proc of Pyroclasm, check to see how much time is left on Combustion to see if they reasonably could have cast it in time.
  onPyroclasmApplied(event) {
    if (this.active.combustionEndTime - event.timestamp > EXPECTED_PYROCLASM_BUFFER) {
      this.expectedPyroblastCasts += 1;
      debug && this.log("Pyroblast Expected During Combustion");
    }
  }

  //Check top see if the player used their Pyroclasm Proc during Combustion
  onPyroclasmRemoved(event) {
    const hasCombustion = this.selectedCombatant(SPELLS.COMBUSTION.id);
    if (event.timestamp - 50 < this.pyroblastCastEvent.timestamp && hasCombustion) {
      this.actualPyroblastCasts += 1;
      debug && this.log("Pyroblast Hard Cast During Combustion");
    }
  }

  onFinished() {
    debug && console.log('Combustion Duration MS: ' + COMBUSTION_DURATION);
    debug && console.log('Expected Pyroblasts: ' + this.expectedPyroblastCasts);
    debug && console.log('Actual Pyroblasts: ' + this.actualPyroblastCasts);
  }

  get pyroclasmBuffUtil() {
    return (this.actualPyroblastCasts / this.expectedPyroblastCasts) || 0;
  }

  get combustionEndTime() {
    return this.combustionCastTimestamp + COMBUSTION_DURATION;
  }

  get pyrloclasmUtilThresholds() {
    return {
      actual: this.pyroclasmBuffUtil,
      isLessThan: {
        minor: 1,
        average: .80,
        major: .60,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    if (this.expectedPyroblastCasts > 0) {
      when(this.pyrloclasmUtilThresholds)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<>During <SpellLink id={SPELLS.COMBUSTION.id} /> you had enough time to use {this.expectedPyroblastCasts} procs from your <SpellLink id={SPELLS.PYROCLASM_TALENT.id} />, but you only used {this.actualPyroblastCasts} of them. If there is more than {EXPECTED_PYROCLASM_BUFFER / 1000} seconds of Combustion left, you should use your proc so that your hard casted <SpellLink id={SPELLS.PYROBLAST.id} /> will do {PYROCLASM_DAMAGE_MODIFIER}% damage and be guaranteed to crit.</>)
            .icon(SPELLS.PYROCLASM_TALENT.icon)
            .actual(`${formatPercentage(this.pyroclasmBuffUtil)}% Utilization`)
            .recommended(`${formatPercentage(recommended)} is recommended`);
        });
    }
  }
}
export default CombustionPyroclasm;
