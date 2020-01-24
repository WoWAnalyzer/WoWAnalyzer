import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';

const debug = false;
const SEARING_TOUCH_HEALTH_THRESHOLD = .30;
const SEARING_TOUCH_DAMAGE_MODIFIER = 1.50;

class SearingTouch extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };
  protected abilityTracker!: AbilityTracker;
  lastCastEvent?: CastEvent;

  badCasts = 0;
  totalCasts = 0;
  healthPercent = 1;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SEARING_TOUCH_TALENT.id);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.FIREBALL), this.onCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell([SPELLS.FIREBALL,SPELLS.SCORCH]), this.onDamage);
  }

  onCast(event: CastEvent) {
    this.lastCastEvent = event;
  }

  //When the target is under 30% health, check to see if the player cast Fireball. If they do, count it as a mistake.
  onDamage(event: DamageEvent) {
    if (event.hitPoints && event.maxHitPoints && event.hitPoints > 0) {
      this.healthPercent = event.hitPoints / event.maxHitPoints;
    }
    if (this.healthPercent > SEARING_TOUCH_HEALTH_THRESHOLD) {
      return;
    }
    this.totalCasts += 1;
    if (this.lastCastEvent && event.ability.guid === SPELLS.FIREBALL.id) {
      this.badCasts += 1;
      this.lastCastEvent.meta = this.lastCastEvent.meta || {};
      this.lastCastEvent.meta.isInefficientCast = true;
      this.lastCastEvent.meta.inefficientCastReason = `This Fireball was cast while the target was under ${formatPercentage(SEARING_TOUCH_HEALTH_THRESHOLD)}% health. While talented into Searing Touch, ensure that you are casting Scorch instead of Fireball while the target is under 30% health since Scorch does ${formatPercentage(SEARING_TOUCH_DAMAGE_MODIFIER)}% additional damage.`;
      debug && this.log("Cast Fireball under 30% Health");
    }
  }

  get scorchUtil() {
    return 1 - (this.badCasts / this.totalCasts);
  }

  get suggestionThreshold() {
    return {
      actual: this.scorchUtil,
      isLessThan: {
        minor: 0.95,
        average: 0.85,
        major: 0.70,
      },
      style: 'percentage',
    };
  }

  suggestions(when: any) {
		when(this.suggestionThreshold)
			.addSuggestion((suggest: any, actual: any, recommended: any) => {
				return suggest(<>You cast <SpellLink id={SPELLS.FIREBALL.id} /> instead of <SpellLink id={SPELLS.SCORCH.id} /> while the target was under 30% health {this.badCasts} times. When using <SpellLink id={SPELLS.SEARING_TOUCH_TALENT.id} /> always use Scorch instead of Fireball when the target is under 30% health since Scorch does 150% damage and is guaranteed to crit.</>)
					.icon(SPELLS.SEARING_TOUCH_TALENT.icon)
					.actual(`${formatPercentage(this.scorchUtil)}% Utilization`)
					.recommended(`${formatPercentage(recommended)} is recommended`);
			});
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={'TALENTS'}
        tooltip={(
          <>
            When the target is under 30% health, you should cast Scorch as your filler ability instead of Fireball so that you can take advantage of the damage buff that gets applied to Scorch. You cast Fireball instead of Scorch {this.badCasts} times.
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.SEARING_TOUCH_TALENT}>
          <>
            {formatPercentage(this.scorchUtil,0)}% <small>Buff Utilization</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SearingTouch;
