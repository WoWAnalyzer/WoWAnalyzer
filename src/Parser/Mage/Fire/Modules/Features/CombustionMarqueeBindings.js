import React from 'react';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SpellLink from 'common/SpellLink';
import ItemLink from 'common/ItemLink';
import Combatants from 'Parser/Core/Modules/Combatants';
import { formatMilliseconds, formatPercentage } from 'common/format';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import Analyzer from 'Parser/Core/Analyzer';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';

const debug = true;

class CombustionMarqueeBindings extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    spellUsable: SpellUsable,
    abilityTracker: AbilityTracker,
  };

  buffUsedDuringCombustion = false;
  combustionDuration = 0;
  combustionCastTimestamp = 0;
  pyroblastCastTimestamp = 0;
  expectedPyroblastCasts = 0;
  actualPyroblastCasts = 0;

  //Check for Marquee Bindings Item, and calculate the duration of Combustion
  //Accounts for the extra 2 seconds from Tier 21 2 Set, and 1 Second per point of Pre Ignited
  on_initialized() {
    this.active = this.combatants.selected.hasWrists(ITEMS.MARQUEE_BINDINGS_OF_THE_SUN_KING.id);
    const hasTierBonus = this.combatants.selected.hasBuff(SPELLS.FIRE_MAGE_T21_2SET_BONUS_BUFF.id);
    const preIgnitedCount = this.combatants.selected.traitsBySpellId[SPELLS.PRE_IGNITED_TRAIT.id];
    if (hasTierBonus) {
      this.combustionDuration = (10 + 2 + preIgnitedCount) * 1000;
    } else {
      this.combustionDuration = (10 + preIgnitedCount) * 1000;
    }
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
    if (spellId !== SPELLS.KAELTHAS_ULTIMATE_ABILITY.id && spellId !== SPELLS.COMBUSTION.id) {
      return;
    }
    if (spellId === SPELLS.COMBUSTION.id) {
      this.combustionCastTimestamp = event.timestamp;
      //If the player had a Bracer Proc when Combustion was cast, then its expected for them to cast it during Combustion.
      if (this.combatants.selected.hasBuff(SPELLS.KAELTHAS_ULTIMATE_ABILITY.id)) {
        this.expectedPyroblastCasts += 1;
        debug && console.log("Pyroblast Expected During Combustion @ " + formatMilliseconds(event.timestamp - this.owner.fight.start_time));
      }
    } else {
      //If the player gets a Bracer Proc, and there is more than 5 seconds left on the duration of Combustion, then its expected for them to cast it during Combustion.
      if (this.combustionEndTime - event.timestamp > 5000) {
        this.expectedPyroblastCasts += 1;
        debug && console.log("Pyroblast Expected During Combustion @ " + formatMilliseconds(event.timestamp - this.owner.fight.start_time));
      }
    }
  }

  //Check to see if the player used their Bracer Proc during Combustion
  on_toPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.KAELTHAS_ULTIMATE_ABILITY.id) {
      return;
    }
    if (event.timestamp - 50 < this.pyroblastCastTimestamp && this.combatants.selected.hasBuff(SPELLS.COMBUSTION.id)) {
      this.actualPyroblastCasts += 1;
      this.buffUsedDuringCombustion = true;
      debug && console.log("Pyroblast Hard Cast During Combustion @ " + formatMilliseconds(event.timestamp - this.owner.fight.start_time));
    }
  }

  on_finished() {
    debug && console.log('Combustion Duration MS: ' + this.combustionDuration);
    debug && console.log('Expected Pyroblasts: ' + this.expectedPyroblastCasts);
    debug && console.log('Actual Pyroblasts: ' + this.actualPyroblastCasts);
  }

  get bracerBuffUtil() {
    return (this.actualPyroblastCasts / this.expectedPyroblastCasts) || 0;
  }

  get combustionEndTime() {
    return this.combustionCastTimestamp + this.combustionDuration;
  }

  get bracerUtilThresholds() {
    return {
      actual: this.bracerBuffUtil,
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
      when(this.bracerUtilThresholds)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<React.Fragment>During <SpellLink id={SPELLS.COMBUSTION.id} /> you had enough time to use {this.expectedPyroblastCasts} procs from your <ItemLink id={ITEMS.MARQUEE_BINDINGS_OF_THE_SUN_KING.id} />, but you only used {this.actualPyroblastCasts} of them. If there is more than 5 seconds of Combustion left, you should use your proc so that your hard casted <SpellLink id={SPELLS.PYROBLAST.id} /> will do 300% damage and be guaranteed to crit.</React.Fragment>)
            .icon(ITEMS.MARQUEE_BINDINGS_OF_THE_SUN_KING.icon)
            .actual(`${formatPercentage(this.bracerBuffUtil)}% Utilization`)
            .recommended(`${formatPercentage(recommended)} is recommended`);
        });
    }
  }
}
export default CombustionMarqueeBindings;
