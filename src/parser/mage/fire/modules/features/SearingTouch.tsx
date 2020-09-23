import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent, RemoveBuffEvent } from 'parser/core/Events';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import { SEARING_TOUCH_THRESHOLD, SEARING_TOUCH_DAMAGE_MODIFIER, COMBUSTION_BUFFER } from '../../constants';

const debug = false;

class SearingTouch extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };
  protected abilityTracker!: AbilityTracker;
  lastCastEvent?: CastEvent;

  fireballExecuteCasts = 0;
  totalNonExecuteCasts = 0;
  totalExecuteCasts = 0;
  healthPercent = 1;
  nonExecuteScorchCasts = 0;
  combustionEnded = 0;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SEARING_TOUCH_TALENT.id);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell([SPELLS.FIREBALL,SPELLS.SCORCH]), this.onCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell([SPELLS.FIREBALL,SPELLS.SCORCH,SPELLS.PYROBLAST,SPELLS.FIRE_BLAST]), this.onDamage);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.COMBUSTION), this.onCombustionEnd);
  }

  onCast(event: CastEvent) {
    this.lastCastEvent = event;
  }

  onCombustionEnd(event: RemoveBuffEvent) {
    this.combustionEnded = event.timestamp;
  }

  //When the target is under 30% health, check to see if the player cast Fireball. If they do, count it as a mistake.
  onDamage(event: DamageEvent) {
    const spellId = event.ability.guid;
    if (event.hitPoints && event.maxHitPoints && (event.hitPoints > 0)) {
      this.healthPercent = event.hitPoints / event.maxHitPoints;
      this.healthPercent < SEARING_TOUCH_THRESHOLD ? this.totalExecuteCasts += 1 : this.totalNonExecuteCasts += 1;
    }

    if (spellId === SPELLS.SCORCH.id && this.healthPercent > SEARING_TOUCH_THRESHOLD && !this.selectedCombatant.hasBuff(SPELLS.COMBUSTION.id) && event.timestamp > this.combustionEnded + COMBUSTION_BUFFER) {
      this.nonExecuteScorchCasts += 1;
    } else if (spellId === SPELLS.FIREBALL.id && this.healthPercent < SEARING_TOUCH_THRESHOLD) {
      this.fireballExecuteCasts += 1;
      if (this.lastCastEvent) {
        this.lastCastEvent.meta = this.lastCastEvent.meta || {};
        this.lastCastEvent.meta.isInefficientCast = true;
        this.lastCastEvent.meta.inefficientCastReason = `This Fireball was cast while the target was under ${formatPercentage(SEARING_TOUCH_THRESHOLD)}% health. While talented into Searing Touch, ensure that you are casting Scorch instead of Fireball while the target is under 30% health since Scorch does ${formatPercentage(SEARING_TOUCH_DAMAGE_MODIFIER)}% additional damage.`;
        debug && this.log("Cast Fireball under 30% Health");
      }
    }
  }

  get executeUtil() {
    return 1 - (this.fireballExecuteCasts / this.totalExecuteCasts);
  }

  get nonExecuteUtil() {
    return 1 - (this.nonExecuteScorchCasts / this.totalNonExecuteCasts);
  }

  get executeSuggestionThreshold() {
    return {
      actual: this.executeUtil,
      isLessThan: {
        minor: 0.95,
        average: 0.85,
        major: 0.70,
      },
      style: 'percentage',
    };
  }

  get nonExecuteSuggestionThreshold() {
    return {
      actual: this.nonExecuteUtil,
      isLessThan: {
        minor: 0.90,
        average: 0.85,
        major: 0.80,
      },
      style: 'percentage',
    };
  }

  suggestions(when: any) {
		when(this.executeSuggestionThreshold)
			.addSuggestion((suggest: any, actual: any, recommended: any) => {
				return suggest(<>You cast <SpellLink id={SPELLS.FIREBALL.id} /> instead of <SpellLink id={SPELLS.SCORCH.id} /> while the target was under 30% health {this.fireballExecuteCasts} times. When using <SpellLink id={SPELLS.SEARING_TOUCH_TALENT.id} /> always use Scorch instead of Fireball when the target is under 30% health since Scorch does 150% damage and is guaranteed to crit.</>)
					.icon(SPELLS.SEARING_TOUCH_TALENT.icon)
					.actual(`${formatPercentage(this.executeUtil)}% Utilization`)
					.recommended(`${formatPercentage(recommended)} is recommended`);
      });
    when(this.nonExecuteSuggestionThreshold)
			.addSuggestion((suggest: any, actual: any, recommended: any) => {
				return suggest(<>You cast <SpellLink id={SPELLS.SCORCH.id} /> while the target was over 30% health {this.nonExecuteScorchCasts} times. While this is acceptable when you need to move, you should aim to minimize this by limiting your movement and using spells like <SpellLink id={SPELLS.BLINK.id} /> (or <SpellLink id={SPELLS.SHIMMER_TALENT.id} />) when possible or by using your instant abilities and procs.</>)
					.icon(SPELLS.SEARING_TOUCH_TALENT.icon)
					.actual(`${formatPercentage(this.nonExecuteUtil)}% Utilization`)
					.recommended(`${formatPercentage(recommended)} is recommended`);
			});
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={(
          <>
            When the target is under 30% health, you should cast Scorch as your filler ability instead of Fireball so that you can take advantage of the damage buff that gets applied to Scorch. You cast Fireball instead of Scorch {this.fireballExecuteCasts} times.
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.SEARING_TOUCH_TALENT}>
          <>
            {formatPercentage(this.executeUtil,0)}% <small>Execute Utilization</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SearingTouch;
