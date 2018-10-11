import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import ItemLink from 'common/ItemLink';
import { formatPercentage } from 'common/format';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Analyzer from 'parser/core/Analyzer';
import SpellUsable from 'parser/shared/modules/SpellUsable';

const debug = false;
const COMBUSTION_DURATION = 10000;

class CombustionPyroclasm extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    abilityTracker: AbilityTracker,
  };

  buffUsedDuringCombustion = false;
  combustionCastTimestamp = 0;
  pyroblastCastTimestamp = 0;
  expectedPyroblastCasts = 0;
  actualPyroblastCasts = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.PYROCLASM_TALENT.id);
  }

  //Get the time stamp for Pyroblast to be used elsewhere
  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.PYROBLAST.id) {
      return;
    }
    this.pyroblastCastTimestamp = event.timestamp;
  }

  on_toPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.PYROCLASM_BUFF.id && spellId !== SPELLS.COMBUSTION.id) {
      return;
    }
    if (spellId === SPELLS.COMBUSTION.id) {
      this.combustionCastTimestamp = event.timestamp;
      //If the player had a Bracer Proc when Combustion was cast, then its expected for them to cast it during Combustion.
      if (this.selectedCombatant.hasBuff(SPELLS.PYROCLASM_BUFF.id)) {
        this.expectedPyroblastCasts += 1;
        debug && this.log("Pyroblast Expected During Combustion");
      }
    } else {
      //If the player gets a Bracer Proc, and there is more than 5 seconds left on the duration of Combustion, then its expected for them to cast it during Combustion.
      if (this.combustionEndTime - event.timestamp > 5000) {
        this.expectedPyroblastCasts += 1;
        debug && this.log("Pyroblast Expected During Combustion");
      }
    }
  }

  //Check to see if the player used their Bracer Proc during Combustion
  on_toPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.PYROCLASM_BUFF.id) {
      return;
    }
    if (event.timestamp - 50 < this.pyroblastCastTimestamp && this.selectedCombatant.hasBuff(SPELLS.COMBUSTION.id)) {
      this.actualPyroblastCasts += 1;
      this.buffUsedDuringCombustion = true;
      debug && this.log("Pyroblast Hard Cast During Combustion");
    }
  }

  on_finished() {
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
          return suggest(<>During <SpellLink id={SPELLS.COMBUSTION.id} /> you had enough time to use {this.expectedPyroblastCasts} procs from your <ItemLink id={SPELLS.PYROCLASM_TALENT.id} />, but you only used {this.actualPyroblastCasts} of them. If there is more than 5 seconds of Combustion left, you should use your proc so that your hard casted <SpellLink id={SPELLS.PYROBLAST.id} /> will do 225% damage and be guaranteed to crit.</>)
            .icon(SPELLS.PYROCLASM_TALENT.icon)
            .actual(`${formatPercentage(this.pyroclasmBuffUtil)}% Utilization`)
            .recommended(`${formatPercentage(recommended)} is recommended`);
        });
    }
  }
}
export default CombustionPyroclasm;
