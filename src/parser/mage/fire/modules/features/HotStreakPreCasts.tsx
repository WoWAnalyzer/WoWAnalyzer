import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import Events, { DamageEvent, RemoveBuffEvent, RemoveBuffStackEvent } from 'parser/core/Events';
import EventHistory from 'parser/shared/modules/EventHistory';
import { COMBUSTION_END_BUFFER, FIRESTARTER_THRESHOLD, SEARING_TOUCH_THRESHOLD, FIRE_DIRECT_DAMAGE_SPELLS } from 'parser/mage/shared/constants';
import { Trans } from '@lingui/macro';

const PROC_BUFFER = 200;

const debug = false;

class HotStreakPreCasts extends Analyzer {
  static dependencies = {
    eventHistory: EventHistory,
  }
  protected eventHistory!: EventHistory;

  hasPyroclasm: boolean;
  hasFirestarter: boolean;
  hasSearingTouch: boolean;
  hasFirestorm: boolean;
  pyroclasmProcRemoved = 0;
  castedBeforeHotStreak = 0;
  noCastBeforeHotStreak = 0;
  healthPercent = 1;
  combustionEnded = 0;

  constructor(options: Options) {
    super(options);
    this.hasPyroclasm = this.selectedCombatant.hasTalent(SPELLS.PYROCLASM_TALENT.id);
    this.hasFirestarter = this.selectedCombatant.hasTalent(SPELLS.FIRESTARTER_TALENT.id);
    this.hasSearingTouch = this.selectedCombatant.hasTalent(SPELLS.SEARING_TOUCH_TALENT.id);
    this.hasFirestorm = this.selectedCombatant.hasLegendaryByBonusID(SPELLS.FIRESTORM.bonusID);
    if (this.hasFirestarter || this.hasSearingTouch) {this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(FIRE_DIRECT_DAMAGE_SPELLS), this.checkHealthPercent);}
    this.addEventListener(Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.PYROCLASM_BUFF), this.onPyroclasmRemoved);
    this.addEventListener(Events.removebuffstack.to(SELECTED_PLAYER).spell(SPELLS.PYROCLASM_BUFF), this.onPyroclasmRemoved);
    this.addEventListener(Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.HOT_STREAK), this.checkForHotStreakPreCasts);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.COMBUSTION), this.onCombustionEnd);

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

  //Get the timestamp that Pyroclasm was removed. Because using Hot Streak involves casting Pyroblast, it isnt possible to tell if they hard casted Pyroblast immediately before using their Hot Streak Pyroblast.
  //So this is to check to see if the Pyroclasm proc was removed right before Hot Streak was removed.
  onPyroclasmRemoved(event: RemoveBuffEvent | RemoveBuffStackEvent) {
    this.pyroclasmProcRemoved = event.timestamp;
  }

  //Compares timestamps to determine if an ability was hard casted immediately before using Hot Streak.
  //If Combustion is active or they are in the Firestarter or Searing Touch execute windows, then this check is ignored.
  checkForHotStreakPreCasts(event: RemoveBuffEvent) {
    const combustionActive = this.selectedCombatant.hasBuff(SPELLS.COMBUSTION.id);
    const firestarterActive = this.hasFirestarter && this.healthPercent > FIRESTARTER_THRESHOLD;
    const searingTouchActive = this.hasSearingTouch && this.healthPercent < SEARING_TOUCH_THRESHOLD;
    const firestormActive = this.hasFirestorm && this.selectedCombatant.hasBuff(SPELLS.FIRESTORM_BUFF.id);
    if (combustionActive || firestarterActive || searingTouchActive || firestormActive || event.timestamp < this.combustionEnded + COMBUSTION_END_BUFFER) {
      debug && this.log('Pre Cast Ignored');
      return;
    }

    const lastFireballCast = this.eventHistory.last(1, PROC_BUFFER, Events.cast.by(SELECTED_PLAYER).spell(SPELLS.FIREBALL));
    if (lastFireballCast.length > 0 || event.timestamp - PROC_BUFFER < this.pyroclasmProcRemoved) {
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
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
      when(this.castBeforeHotStreakThresholds)
        .addSuggestion((suggest, actual, recommended) => suggest(<>When <SpellLink id={SPELLS.COMBUSTION.id} /> is not active{this.hasFirestarter ? ' and the target is below 90% health' : ''} {this.hasSearingTouch ? ' and the target is over 30% health' : ''}, <SpellLink id={SPELLS.HOT_STREAK.id} /> procs should be used immediately after casting <SpellLink id={SPELLS.FIREBALL.id} /> {this.hasPyroclasm ? <> or after using a <SpellLink id={SPELLS.PYROCLASM_TALENT.id} /> proc </> : ''}. This way, if one of the two abilities crit you will gain a new <SpellLink id={SPELLS.HEATING_UP.id} /> proc, and if both crit you will get a new <SpellLink id={SPELLS.HOT_STREAK.id} /> proc. You failed to do this {this.noCastBeforeHotStreak} times. If you have a <SpellLink id={SPELLS.HOT_STREAK.id} /> proc and need to move, you can hold the proc and cast <SpellLink id={SPELLS.SCORCH.id} /> once or twice until you are able to stop and cast <SpellLink id={SPELLS.FIREBALL.id} /> or you can use your procs while you move.</>)
            .icon(SPELLS.HOT_STREAK.icon)
            .actual(<Trans id="mage.fire.suggestions.hostStreak.precasts.utilization">{formatPercentage(this.castBeforeHotStreakUtil)}% Utilization</Trans>)
            .recommended(`${formatPercentage(recommended)}% is recommended`));
  }
}

export default HotStreakPreCasts;
