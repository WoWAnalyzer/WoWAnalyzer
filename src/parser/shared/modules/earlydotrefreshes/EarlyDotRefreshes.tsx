import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Spell from 'common/SPELLS/Spell';
import Enemies from 'parser/shared/modules/Enemies';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import { encodeTargetString } from 'parser/shared/modules/EnemyInstances';
import { formatDuration } from 'common/format';
import Events, { ApplyDebuffEvent, RefreshDebuffEvent, GlobalCooldownEvent, CastEvent } from 'parser/core/Events';

const BUFFER_MS = 100;
const PANDEMIC_WINDOW = 0.3;

export interface Dot {
  debuffId: number;
  castId: number;
  name: string;
  duration: number;
}

// example dot:
// {
//   name: "Stellar Flare", //name of the spell for display
//   debuffId: SPELLS.STELLAR_FLARE_TALENT.id, //id of the dot debuff
//   castId: SPELLS.STELLAR_FLARE_TALENT.id, //id of the dot cast
//   duration: 24000, //duration of the dot in ms
// },

// Abstract class for early dot refreshes
// See /parser/Druid/Balance/Modules/Features/EarlyDotRefreshes.js for an example implementation.
class EarlyDotRefreshes extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    abilityTracker: AbilityTracker,
  };
  protected enemies!: Enemies;
  protected abilityTracker!: AbilityTracker;

  static dots: Dot[] = [];
  targets: { [key: number]: any } = {};
  lastGCD?: GlobalCooldownEvent;
  lastCast?: CastEvent;
  lastCastGoodExtension = false;
  lastCastMinWaste = Number.MAX_SAFE_INTEGER;
  lastCastMaxEffect = 0;
  casts: { [key: number]: {
    badCasts: number;
    addedDuration: number;
    wastedDuration: number;
    } 
  } = {};

  constructor(options: Options) {
    super(options);
    const ctor = this.constructor as typeof EarlyDotRefreshes;
    ctor.dots.forEach(dot => {
      this.targets[dot.debuffId] = {};
      this.casts[dot.castId] = {
        badCasts: 0,
        addedDuration: 0,
        wastedDuration: 0,
      };
    });
    this.addEventListener(Events.refreshdebuff.by(SELECTED_PLAYER), this.onRefreshDebuff);
    this.addEventListener(Events.applydebuff.by(SELECTED_PLAYER), this.onApplyDebuff);
    this.addEventListener(Events.GlobalCooldown.by(SELECTED_PLAYER), this.onGCD);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
  }

  addBadCast(event: CastEvent, text: string) {
    if (!this.lastCast) {
      return;
    }

    this.casts[this.lastCast.ability.guid].badCasts += 1;
    this.casts[this.lastCast.ability.guid].wastedDuration += this.lastCastMinWaste;
    event.meta = event.meta || {};
    event.meta.isInefficientCast = true;
    event.meta.inefficientCastReason = text;
  }

  onRefreshDebuff(event: RefreshDebuffEvent) {
    const dot = this.getDot(event.ability.guid);
    if (!dot) {
      return;
    }
    const targetID = encodeTargetString(event.targetID, event.targetInstance);
    const extensionInfo = this.extendDot(dot.debuffId, Number(targetID), dot.duration, event.timestamp);
    if(this.lastCastGoodExtension){
      return;
    }
    this.lastCastGoodExtension = extensionInfo.wasted === 0;
    this.lastCastMinWaste = Math.min(this.lastCastMinWaste, extensionInfo.wasted);
    this.lastCastMaxEffect = Math.max(this.lastCastMaxEffect, extensionInfo.effective);
  }

  onApplyDebuff(event: ApplyDebuffEvent) {
    const dot = this.getDot(event.ability.guid);
    if (!dot) {
      return;
    }
    this.targets[dot.debuffId][encodeTargetString(event.targetID, event.targetInstance)] = event.timestamp + dot.duration;
    this.lastCastGoodExtension = true;
    this.lastCastMinWaste = 0;
    this.lastCastMaxEffect = dot.duration;
  }

  onGCD(event: GlobalCooldownEvent) {
    const dot = this.getDotByCast(event.ability.guid);
    if (!dot) {
      return;
    }
    this.lastGCD = event;
  }

  onCast(event: CastEvent) {
    this.checkLastCast(event);
    const dot = this.getDotByCast(event.ability.guid);
    if (!dot) {
      return;
    }
    this.lastCast = event;
    this.lastCastGoodExtension = false;
    this.lastCastMinWaste = Number.MAX_SAFE_INTEGER;
    this.lastCastMaxEffect = 0;
    this.afterLastCastSet(event);
  }

  afterLastCastSet(event: CastEvent) {
    //Extension to help capture state during the "LastCast".
  }

  // Determines whether the last cast should be checked or not.
  checkLastCast(event: CastEvent) {
    if (!this.lastGCD || !this.lastCast) {
      return;
    }
    // We wait roughly a GCD to check, to account for minor travel times.
    const timeSinceCast = event.timestamp - this.lastGCD.timestamp;
    if (!this.lastCastBuffer || timeSinceCast < this.lastCastBuffer){
      return;
    }
    this.casts[this.lastCast.ability.guid].addedDuration += this.lastCastMaxEffect;
    this.isLastCastBad(event);
    this.lastGCD = undefined;
    this.lastCast = undefined;
  }

  get lastCastBuffer() {
    return this.lastGCD && this.lastGCD.duration * 2 - BUFFER_MS;
  }

  // Checks the status of the last cast and marks it accordingly.
  isLastCastBad(event: CastEvent) {
    if (this.lastCastGoodExtension || !this.lastCast) {
      return; // Should not be marked as bad.
    }
    const dot = this.getDotByCast(this.lastCast.ability.guid);
    const text = dot && this.getLastBadCastText(event, dot);
    if (text && text !== '') {
      this.addBadCast(this.lastCast, text);
    }
  }

  // Get the suggestion for last bad cast. If empty, cast will be considered good.
  getLastBadCastText(event: CastEvent, dot: Dot) {
    return `${dot.name} was refreshed ${formatDuration(this.lastCastMinWaste/1000)} seconds before the pandemic window. It should be refreshed with at most ${formatDuration(PANDEMIC_WINDOW * dot.duration/1000)} left or part of the dot will be wasted.`;
  }

  //Returns the dot object
  getDot(spellId: number) {
    const ctor = this.constructor as typeof EarlyDotRefreshes;
    const dot = ctor.dots.find(element => element.debuffId === spellId);
    return dot;
  }

  //Returns the dot object
  getDotByCast(spellId: number) {
    const ctor = this.constructor as typeof EarlyDotRefreshes;
    const dot = ctor.dots.find(element => element.castId === spellId);
    return dot;
  }

  // Extends the dot and returns true if it was a good extension (no duration wasted) or false if it was a bad extension.
  extendDot(spellId: number, targetID: number, extension: number, timestamp: number) {
    const dot = this.getDot(spellId);
    if (!dot) {
      throw new Error(`The spellID ${spellId} is not in the list of dots to track`);
    }
    const remainingDuration = this.targets[dot.debuffId][targetID] - timestamp || 0;
    const newDuration = remainingDuration + extension;
    const maxDuration = (1 + PANDEMIC_WINDOW) * dot.duration;
    const lostDuration = newDuration - maxDuration;
    if (lostDuration <= 0) { //full extension
      this.targets[dot.debuffId][targetID] = timestamp + newDuration;
      return {wasted: 0, effective: extension};
    } // Else not full extension
    this.targets[dot.debuffId][targetID] = timestamp + maxDuration;
    return {wasted: lostDuration, effective: extension - lostDuration};
  }

  badCastsPercent(spellId: number) {
    const ability = this.abilityTracker.getAbility(spellId);
    return this.casts[spellId].badCasts / ability.casts || 0;
  }

  badCastsEffectivePercent(spellId: number) {
    if(!this.casts[spellId].addedDuration) {return 1;}
    return this.casts[spellId].addedDuration / (this.casts[spellId].addedDuration+this.casts[spellId].wastedDuration);
  }

  makeSuggestionThresholds(spell: Spell, minor: number, avg: number, major: number) {
    return {
      spell: spell,
      count: this.casts[spell.id].badCasts,
      wastedDuration: this.casts[spell.id].wastedDuration,
      actual: this.badCastsEffectivePercent(spell.id),
      isLessThan: {
        minor: minor,
        average: avg,
        major: major,
      },
      style: 'percentage',
    };
  }
}

export default EarlyDotRefreshes;
