import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatNumber } from 'common/format';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent, ApplyBuffEvent } from 'parser/core/Events';
import HIT_TYPES from 'game/HIT_TYPES';
import EnemyInstances, { encodeTargetString } from 'parser/shared/modules/EnemyInstances';

const debug = false;

const PROC_WINDOW_MS = 200;

const HOT_STREAK_CONTRIBUTORS = [
  SPELLS.FIREBALL.id,
  SPELLS.PYROBLAST.id,
  SPELLS.FIRE_BLAST.id,
  SPELLS.SCORCH.id,
  SPELLS.PHOENIX_FLAMES_TALENT.id,
];

class HotStreakWastedCrits extends Analyzer {
  static dependencies = {
    enemies: EnemyInstances,
  };
  protected enemies!: EnemyInstances;

  hasPyromaniac: boolean;
  lastCastEvent?: CastEvent;

  wastedCrits = 0;
  hasPyromaniacProc = false;
  pyromaniacProc = false;
  hotStreakRemoved = 0;

  constructor(options: any) {
    super(options);
    this.hasPyromaniac = this.selectedCombatant.hasTalent(SPELLS.PYROMANIAC_TALENT.id);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(HOT_STREAK_CONTRIBUTORS), this._onCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(HOT_STREAK_CONTRIBUTORS), this._onDamage);
    this.addEventListener(Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.HOT_STREAK), this.checkForPyromaniacProc);

  }

  //When a spell that contributes towards Hot Streak is cast, get the event info to use for excluding the cleaves from Phoenix Flames on the damage event.
  //If a Hot Streak Contributor was cast then Pyromaniac didnt proc, so set it to false (Pyromaniac procs when Hot Streak is used, so if something was cast, then it didnt proc)
  _onCast(event: CastEvent) {
    this.lastCastEvent = event;
    this.hasPyromaniacProc = false;
  }

  //When a spell that contributes towards Hot Streak crits the target while Hot Streak is active, count it as a wasted crit.
  //Excludes the cleave from Phoenix Flames (the cleave doesnt contribute towards Hot Streak) and excludes crits immediately after Pyromaniac procs, cause the player cant do anything to prevent that.
  _onDamage(event: DamageEvent) {
    if (!this.lastCastEvent) {
      return;
    }
    const spellId = event.ability.guid;
    const castTarget = encodeTargetString(this.lastCastEvent.targetID, event.targetInstance);
    const damageTarget = encodeTargetString(event.targetID, event.targetInstance);
    if (event.hitType !== HIT_TYPES.CRIT || !this.selectedCombatant.hasBuff(SPELLS.HOT_STREAK.id,undefined,-50) || (spellId === SPELLS.PHOENIX_FLAMES_TALENT.id && castTarget !== damageTarget)) {
      return;
    }

    if (this.hasPyromaniacProc) {
      debug && this.log("Wasted Crit Ignored");
    } else {
      this.wastedCrits += 1;
      this.lastCastEvent.meta = this.lastCastEvent.meta || {};
      this.lastCastEvent.meta.isInefficientCast = true;
      this.lastCastEvent.meta.inefficientCastReason = "This cast crit while you already had Hot Streak and could have contributed towards your next Heating Up or Hot Streak. To avoid this, make sure you use your Hot Streak procs as soon as possible.";
      debug && this.log("Wasted Crit");
    }
  }

  //Pyromaniac doesnt trigger an event, so we need to check to see if the player immediately got a new Hot Streak immediately after using a Hot Streak
  checkForPyromaniacProc(event: ApplyBuffEvent) {
    if (this.hasPyromaniac && event.timestamp - this.hotStreakRemoved < PROC_WINDOW_MS) {
      this.hasPyromaniacProc = true;
    }
  }

  get wastedCritsPerMinute() {
    return this.wastedCrits / (this.owner.fightDuration / 60000);
  }

  get wastedCritsThresholds() {
    return {
      actual: this.wastedCritsPerMinute,
      isGreaterThan: {
        minor: 0,
        average: 1,
        major: 3,
      },
      style: 'number',
    };
  }

  suggestions(when: any) {
      when(this.wastedCritsThresholds)
        .addSuggestion((suggest: any, actual: any, recommended: any) => {
          return suggest(<>You crit with {formatNumber(this.wastedCrits)} ({formatNumber(this.wastedCritsPerMinute)} Per Minute) direct damage abilities while <SpellLink id={SPELLS.HOT_STREAK.id} /> was active. This is a waste since those crits could have contibuted towards your next Hot Streak. Try to use your procs as soon as possible to avoid this.</>)
            .icon(SPELLS.HOT_STREAK.icon)
            .actual(`${formatNumber(this.wastedCrits)} crits wasted`)
            .recommended(`${formatNumber(recommended)} is recommended`);
      });
  }
}

export default HotStreakWastedCrits;
