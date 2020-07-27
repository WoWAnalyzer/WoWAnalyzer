import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent, RemoveBuffEvent, RemoveBuffStackEvent } from 'parser/core/Events';
import { FIRESTARTER_THRESHOLD, SEARING_TOUCH_THRESHOLD, HOT_STREAK_CONTRIBUTORS, PROC_BUFFER, COMBUSTION_BUFFER } from '../../constants';

const debug = false;

class HotStreakPreCasts extends Analyzer {
  hasPyroclasm: boolean;
  hasFirestarter: boolean;
  hasSearingTouch: boolean;

  lastCastTimestamp = 0;
  hotStreakRemoved = 0;
  pyroclasmProcRemoved = 0;
  castedBeforeHotStreak = 0;
  noCastBeforeHotStreak = 0;
  healthPercent = 1;
  castTimestamp = 0;
  combustionEnded = 0;

  constructor(options: any) {
    super(options);
    this.hasPyroclasm = this.selectedCombatant.hasTalent(SPELLS.PYROCLASM_TALENT.id);
    this.hasFirestarter = this.selectedCombatant.hasTalent(SPELLS.FIRESTARTER_TALENT.id);
    this.hasSearingTouch = this.selectedCombatant.hasTalent(SPELLS.SEARING_TOUCH_TALENT.id);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.FIREBALL), this.getCastTimestamp);
    if (this.hasFirestarter || this.hasSearingTouch) {this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(HOT_STREAK_CONTRIBUTORS), this.checkHealthPercent);}
    this.addEventListener(Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.HOT_STREAK), this.onHotStreakRemoved);
    this.addEventListener(Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.PYROCLASM_BUFF), (event: RemoveBuffEvent) => this.onPyroclasmRemoved(event));
    this.addEventListener(Events.removebuffstack.to(SELECTED_PLAYER).spell(SPELLS.PYROCLASM_BUFF), (event: RemoveBuffStackEvent) => this.onPyroclasmRemoved(event));
    this.addEventListener(Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.HOT_STREAK), this.checkForHotStreakPreCasts);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.COMBUSTION), this.onCombustionEnd);

  }

  //When the player casts Fireball, get the timestamp. This timestamp is used for determining if the spell was cast before using Hot Streak
  getCastTimestamp(event: CastEvent) {
    this.castTimestamp = event.timestamp;
  }

  //If the player has the Searing Touch or Firestarter talents, then we need to get the health percentage on damage events so we can know whether we are in the Firestarter or Searing Touch execute windows
  checkHealthPercent(event: DamageEvent) {
    if (event.hitPoints && event.maxHitPoints && event.hitPoints > 0) {
      this.healthPercent = event.hitPoints / event.maxHitPoints;
    }
  }

  onCombustionEnd(event: RemoveBuffEvent) {
    this.combustionEnded = event.timestamp;
  }

  //Get the timestamp that Hot Streak was removed. This is used for comparing the cast Timestamp to see if there was a hard cast immediately before Hot Streak was removed (and therefore they pre-casted before Hot Streak)
  onHotStreakRemoved(event: RemoveBuffEvent) {
    this.hotStreakRemoved = event.timestamp;
  }

  //Get the timestamp that Pyroclasm was removed. Because using Hot Streak involves casting Pyroblast, it isnt possible to tell if they hard casted Pyroblast immediately before using their Hot Streak Pyroblast.
  //So this is to check to see if the Pyroclasm proc was removed right before Hot Streak was removed.
  onPyroclasmRemoved(event: RemoveBuffEvent | RemoveBuffStackEvent) {
    this.pyroclasmProcRemoved = event.timestamp;
  }

  //Compares timestamps to determine if an ability was hard casted immediately before using Hot Streak.
  //If Combustion is active or they are in the Firestarter or Searing Touch execute windows, then this check is ignored.
  checkForHotStreakPreCasts(event: RemoveBuffEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.COMBUSTION.id) || event.timestamp < this.combustionEnded + COMBUSTION_BUFFER || (this.hasFirestarter && this.healthPercent > FIRESTARTER_THRESHOLD) || (this.hasSearingTouch && this.healthPercent < SEARING_TOUCH_THRESHOLD)) {
      debug && this.log('Pre Cast Ignored');
      return;
    }

    if (this.hotStreakRemoved - PROC_BUFFER < this.castTimestamp || this.hotStreakRemoved - PROC_BUFFER < this.pyroclasmProcRemoved) {
      this.castedBeforeHotStreak += 1;
    } else {
      this.noCastBeforeHotStreak += 1;
      debug && this.log("No hard cast before Hot Streak");
    }
  }

  get castBeforeHotStreakUtil() {
    return 1 - (this.noCastBeforeHotStreak / (this.castedBeforeHotStreak + this.noCastBeforeHotStreak));
  }

  get castBeforeHotStreakThresholds() {
    return {
      actual: this.castBeforeHotStreakUtil,
      isLessThan: {
        minor: .85,
        average: .75,
        major:.65,
      },
      style: 'percentage',
    };
  }

  suggestions(when: any) {
      when(this.castBeforeHotStreakThresholds)
        .addSuggestion((suggest: any, actual: any, recommended: any) => {
          return suggest(<>When <SpellLink id={SPELLS.COMBUSTION.id} /> is not active{this.hasFirestarter ? ' and the target is below 90% health' : ''} {this.hasSearingTouch ? ' and the target is over 30% health' : ''}, <SpellLink id={SPELLS.HOT_STREAK.id} /> procs should be used immediately after casting <SpellLink id={SPELLS.FIREBALL.id} /> {this.hasPyroclasm ? <> or after using a <SpellLink id={SPELLS.PYROCLASM_TALENT.id} /> proc </> : ''}. This way, if one of the two abilities crit you will gain a new <SpellLink id={SPELLS.HEATING_UP.id} /> proc, and if both crit you will get a new <SpellLink id={SPELLS.HOT_STREAK.id} /> proc. You failed to do this {this.noCastBeforeHotStreak} times. If you have a <SpellLink id={SPELLS.HOT_STREAK.id} /> proc and need to move, you can hold the proc and cast <SpellLink id={SPELLS.SCORCH.id} /> once or twice until you are able to stop and cast <SpellLink id={SPELLS.FIREBALL.id} /> or you can use your procs while you move.</>)
            .icon(SPELLS.HOT_STREAK.icon)
            .actual(`${formatPercentage(this.castBeforeHotStreakUtil)}% Utilization`)
            .recommended(`${formatPercentage(recommended)}% is recommended`);
      });
  }
}

export default HotStreakPreCasts;
