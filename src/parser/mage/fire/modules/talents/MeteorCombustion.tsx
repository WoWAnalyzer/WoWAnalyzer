import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent, ApplyBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import EnemyInstances from 'parser/shared/modules/EnemyInstances';

class MeteorCombustion extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    enemies: EnemyInstances,
  };
  protected abilityTracker!: AbilityTracker;
  protected enemies!: EnemyInstances;

  hasMeteor: boolean;

  lastRuneCast = 0
  badMeteor = 0
  meteorCast = false;
  meteorDuringCombustion = false;
  meteorInCombustion = 0;
  combustionActive = false;

  constructor(options: any) {
    super(options);
    this.hasMeteor = this.selectedCombatant.hasTalent(SPELLS.METEOR_TALENT.id);
    this.active = this.hasMeteor ? true : false;

    if (!this.active) {
      return;
    }

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.METEOR_DAMAGE), this.onMeteorDamage);
    this.addEventListener(Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.COMBUSTION), this.onCombustionStart);
    this.addEventListener(Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.COMBUSTION), this.onCombustionEnd);
  }

  onMeteorDamage(event: DamageEvent) {
    if (this.combustionActive) {
      this.meteorCast = true;
    }
  }

  onCombustionStart(event: ApplyBuffEvent) {
    this.combustionActive = true;
  }

  onCombustionEnd(event: RemoveBuffEvent) {
    if (this.meteorCast) {
      this.meteorInCombustion += 1;
    }
    this.combustionActive = false;
    this.meteorDuringCombustion = false;
  }

  get totalMeteorCasts() {
    return this.abilityTracker.getAbility(SPELLS.METEOR_TALENT.id).casts;
  }

  get totalCombustionCasts() {
    return this.abilityTracker.getAbility(SPELLS.COMBUSTION.id).casts;
  }

  get combustionWithoutMeteor() {
    return this.totalCombustionCasts - this.meteorInCombustion;
  }

  get combustionUtilization() {
    return 1 - (this.combustionWithoutMeteor / this.totalCombustionCasts);
  }

  get meteorMaxCasts() {
    return Math.round(this.owner.fightDuration / 60000 - 0.3);
  }

  get meteorCastEfficiency() {
    console.log(Math.round(this.owner.fightDuration / 60000 - 0.25));
    return this.totalMeteorCasts / this.meteorMaxCasts;
  }

  get meteorCombustionSuggestionThresholds() {
    return {
      actual: this.combustionUtilization,
      isLessThan: {
        minor: 1,
        average: 1,
        major: 1,
      },
      style: 'percentage',
    };
  }

  suggestions(when: any) {
    when(this.meteorCombustionSuggestionThresholds)
			.addSuggestion((suggest: any, actual: any, recommended: any) => {
				return suggest(<>You failed to cast <SpellLink id={SPELLS.METEOR_TALENT.id} /> during <SpellLink id={SPELLS.COMBUSTION.id} /> {this.combustionWithoutMeteor} times. In order to make the most of Combustion and <SpellLink id={SPELLS.IGNITE.id} />, you should always cast Meteor during Combustion. If Meteor will not come off cooldown before Combustion is available, then you should hold Meteor for Combustion.</>)
					.icon(SPELLS.METEOR_TALENT.icon)
					.actual(`${formatPercentage(this.combustionUtilization)}% Utilization`)
					.recommended(`<${formatPercentage(recommended)}% is recommended`);
			});
	}
}

export default MeteorCombustion;
