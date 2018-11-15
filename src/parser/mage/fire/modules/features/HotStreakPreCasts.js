import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';

const debug = true;

const PROC_WINDOW_MS = 200;
const FIRESTARTER_HEALTH_THRESHOLD = 0.90;
const SEARING_TOUCH_HEALTH_THRESHOLD = 0.30;

const HOT_STREAK_CONTRIBUTORS = [
  SPELLS.FIREBALL,
  SPELLS.PYROBLAST,
  SPELLS.FIRE_BLAST,
  SPELLS.SCORCH,
  SPELLS.PHOENIX_FLAMES_TALENT,
];

class HotStreakPreCasts extends Analyzer {

  lastCastTimestamp = 0;
  hotStreakRemoved = 0;
  pyroclasmProcRemoved = 0;
  castedBeforeHotStreak = 0;
  noCastBeforeHotStreak = 0;
  currentHealth = 0;
  maxHealth = 0;

  constructor(...args) {
    super(...args);
    this.hasPyroclasm = this.selectedCombatant.hasTalent(SPELLS.PYROCLASM_TALENT.id);
    this.hasFirestarter = this.selectedCombatant.hasTalent(SPELLS.FIRESTARTER_TALENT.id);
    this.hasSearingTouch = this.selectedCombatant.hasTalent(SPELLS.SEARING_TOUCH_TALENT.id);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.FIREBALL), this.getCastTimestamp);
    if (this.hasFirestarter || this.hasSearingTouch) {HOT_STREAK_CONTRIBUTORS.map(spell => this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(spell), this.checkHealthPercent));}
    this.addEventListener(Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.HOT_STREAK), this.onHotStreakRemoved);
    this.addEventListener(Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.PYROCLASM_BUFF), this.onPyroclasmRemoved);
    this.addEventListener(Events.removebuffstack.to(SELECTED_PLAYER).spell(SPELLS.PYROCLASM_BUFF), this.onPyroclasmRemoved);
    this.addEventListener(Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.HOT_STREAK), this.checkForHotStreakPreCasts);

  }

  //When the player casts Fireball, get the timestamp. This timestamp is used for determining if the spell was cast before using Hot Streak
  getCastTimestamp(event) {
    this.castTimestamp = event.timestamp;
  }

  //If the player has the Searing Touch or Firestarter talents, then we need to get the health percentage on damage events so we can know whether we are in the Firestarter or Searing Touch execute windows
  checkHealthPercent(event) {
    this.currentHealth = event.hitPoints;
    this.maxHealth = event.maxHitPoints;
  }

  //Get the timestamp that Hot Streak was removed. This is used for comparing the cast Timestamp to see if there was a hard cast immediately before Hot Streak was removed (and therefore they pre-casted before Hot Streak)
  onHotStreakRemoved(event) {
    this.hotStreakRemoved = event.timestamp;
  }

  //Get the timestamp that Pyroclasm was removed. Because using Hot Streak involves casting Pyroblast, it isnt possible to tell if they hard casted Pyroblast immediately before using their Hot Streak Pyroblast.
  //So this is to check to see if the Pyroclasm proc was removed right before Hot Streak was removed.
  onPyroclasmRemoved(event) {
    this.pyroclasmProcRemoved = event.timestamp;
  }

  //Compares timestamps to determine if an ability was hard casted immediately before using Hot Streak.
  //If Combustion is active or they are in the Firestarter or Searing Touch execute windows, then this check is ignored.
  checkForHotStreakPreCasts(event) {
    if (this.selectedCombatant.hasBuff(SPELLS.COMBUSTION.id) || (this.hasFirestarter && this.currentHealth / this.maxHealth > FIRESTARTER_HEALTH_THRESHOLD) || (this.hasSearingTouch && this.currentHealth / this.maxHealth < SEARING_TOUCH_HEALTH_THRESHOLD)) {
      debug && this.log("Pre Cast Ignored");
      return;
    }

    if (this.hotStreakRemoved - PROC_WINDOW_MS < this.castTimestamp || this.hotStreakRemoved - PROC_WINDOW_MS < this.pyroclasmProcRemoved) {
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
        minor: .95,
        average: .85,
        major:.75,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
      when(this.castBeforeHotStreakThresholds)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<>In situations where you are not able to guarantee a crit (<SpellLink id={SPELLS.COMBUSTION.id} />, <SpellLink id={SPELLS.FIRESTARTER_TALENT.id} />, and <SpellLink id={SPELLS.SEARING_TOUCH_TALENT.id} />), you didn't pre-cast <SpellLink id={SPELLS.FIREBALL.id} /> {this.hasPyroclasm ? 'or use a Pyroclasm Proc' : ''} {this.noCastBeforeHotStreak} times. Pre-casting when you can't guarantee a crit helps you get more <SpellLink id={SPELLS.HEATING_UP.id} /> and <SpellLink id={SPELLS.HOT_STREAK.id} /> procs, so you should do this whenenver possible.</>)
            .icon(SPELLS.HOT_STREAK.icon)
            .actual(`${formatPercentage(this.castBeforeHotStreakUtil)}% Utilization`)
            .recommended(`${formatPercentage(recommended)}% is recommended`);
      });
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(15)}
        icon={<SpellIcon id={SPELLS.HOT_STREAK.id} />}
        value={`${formatPercentage(this.castBeforeHotStreakUtil, 0)} %`}
        label="Hot Streak pre-casts"
        tooltip={`By pre-casting Fireball (or hard casting Pyroblast to use a Pyroclasm proc), you are increasing the chances of getting another Heating Up or Hot Streak since if both the pre-cast and the instant Pyroblast crit, then you will instantly get a new Hot Streak, or if one of them procs then you will have a new Heating Up proc that you can convert to Hot Streak with a guaranteed crit ability like Fire Blast or Phoenix Flames. Therefore you should always do this, except in the below circumstances where you can guarantee a crit.        <ul>
          <li>Combustion is active</li>
          <li>You have Firestarter and the target is above 90% health</li>
          <li>You have Searing Touch and the target is below 30% health</li>
        </ul>`}
      />
    );
  }
}

export default HotStreakPreCasts;
