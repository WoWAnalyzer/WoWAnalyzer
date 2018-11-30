import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatNumber } from 'common/format';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';

const debug = false;

class CombustionSpellUsage extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    abilityTracker: AbilityTracker,
  };

  badCastsStarted = 0;
  badCastsCompleted = 0;

  constructor(...args) {
    super(...args);
    this.hasBlasterMaster = this.selectedCombatant.hasTrait(SPELLS.BLASTER_MASTER.id);
    this.hasPhoenixFlames = this.selectedCombatant.hasTalent(SPELLS.PHOENIX_FLAMES_TALENT.id);
    this.addEventListener(Events.begincast.by(SELECTED_PLAYER).spell([SPELLS.FIREBALL,SPELLS.SCORCH]), this.checkChargeCounts);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell([SPELLS.FIREBALL,SPELLS.SCORCH]), this.checkChargeCounts);
  }

  //Check to see if the player cast (or started to cast) Fireball or Scorch during Combustion while they had Fire Blast or Phoenix Flames charges available.
  checkChargeCounts(event) {
    const hasCombustion = this.selectedCombatant.hasBuff(SPELLS.COMBUSTION.id);
    const fireBlastCharges = this.spellUsable.chargesAvailable(SPELLS.FIRE_BLAST.id);
    const phoenixFlamesCharges = (this.spellUsable.chargesAvailable(SPELLS.PHOENIX_FLAMES_TALENT.id) || 0);
    //If the player has the Blaster Master trait, it is acceptable to cast Scorch during Combustion
    if (!hasCombustion || (this.hasBlasterMaster && event.ability.guid === SPELLS.SCORCH.id) || (fireBlastCharges === 0 || phoenixFlamesCharges === 0)) {
      return;
    }

    if (event.type === "cast") {
      this.badCastsCompleted += 1;
      event.meta = this.lastCastEvent.meta || {};
      event.meta.isInefficientCast = true;
      event.meta.inefficientCastReason = `This spell was cast during Combustion while an instant cast ability like Fire Blast ${this.hasPhoenixFlames ? 'or Phoenix Flames' : '' } was available. Make sure you are using your instant abilities first before hard casting Fireball ${this.hasBlasterMaster ? 'or Scorch' : '' }. `;
      debug && this.log("Cast completed with instants available");
    }

    if (event.type === "begincast") {
      this.badCastsStarted += 1;
      debug && this.log("Cast started with instants available");
    }
  }

  get castsWithInstantsPerCombustion() {
    return this.badCastsStarted / this.abilityTracker.getAbility(SPELLS.COMBUSTION.id).casts;
  }

  get suggestionThresholds() {
    return {
      actual: this.castsWithInstantsPerCombustion,
      isGreaterThan: {
        minor: 0,
        average: 1,
        major: 2,
      },
      style: 'number',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<>You started to cast <SpellLink id={SPELLS.FIREBALL.id} /> {!this.hasBlasterMaster ? <> or <SpellLink id={SPELLS.SCORCH.id} /></> : '' } {this.badCastsStarted} times ({this.castsWithInstantsPerCombustion.toFixed(2)} per Combustion), and completed {this.badCastsCompleted} casts, while you had charges of <SpellLink id={SPELLS.FIRE_BLAST.id} /> {this.hasPhoenixFlames ? <> or <SpellLink id={SPELLS.PHOENIX_FLAMES_TALENT.id} /> </> : '' } available. Make sure you are using up all of your charges of Fire Blast {this.hasPhoenixFlames ? ' and Phoenix Flames' : '' } before using Fireball {!this.hasBlasterMaster ? 'or Scorch' : '' } during Combustion.</>)
          .icon(SPELLS.COMBUSTION.icon)
          .actual(`${this.castsWithInstantsPerCombustion.toFixed(2)} Casts Per Combustion`)
          .recommended(`${formatNumber(recommended)} is recommended`);
      });
  }
}
export default CombustionSpellUsage;
