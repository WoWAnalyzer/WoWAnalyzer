import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, CastEvent, EventType, RefreshBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Abilities from 'parser/core/modules/Abilities';
import EventEmitter from 'parser/core/modules/EventEmitter';
import { TRUESHOT_RAPID_FIRE_RECHARGE_INCREASE } from 'parser/hunter/marksmanship/constants';

/**
 * Shoot a stream of 10 shots at your target over 3 sec, dealing a total of [10 * (26% of Attack power)%] Physical damage.
 *
 */
const debug = false;

class RapidFire extends Analyzer {

  static dependencies = {
    spellUsable: SpellUsable,
    abilities: Abilities,
  };

  lastReductionTimestamp: number = 0;
  casts: number = 0;
  totalCooldown: number = 0;
  averageCooldown: number = 0;
  effectiveCDRFromTrueshot: number = 0;
  wastedCDRFromTrueshot: number = 0;

  protected spellUsable!: SpellUsable;
  protected abilities!: Abilities;

  constructor(options: any) {
    super(options);
    options.abilities.add({
      spell: SPELLS.RAPID_FIRE,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      cooldown: 20,
      gcd: {
        base: 1500,
      },
      castEfficiency: {
        suggestion: true,
        recommendedEfficiency: 0.95,
      },
    });
    this.addEventListener(EventEmitter.catchAll, this.onEvent);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.RAPID_FIRE), this.onCast);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.TRUESHOT), (event: ApplyBuffEvent) => this.onAffectingBuffChange(event));
    this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.TRUESHOT), (event: RefreshBuffEvent) => this.onAffectingBuffChange(event));
    this.addEventListener(Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.TRUESHOT), (event: RemoveBuffEvent) => this.onAffectingBuffChange(event));
  }

  onEvent(event: any) {
    if (!this.selectedCombatant.hasBuff(SPELLS.TRUESHOT.id)) {
      return;
    }
    if (!this.spellUsable.isOnCooldown(SPELLS.RAPID_FIRE.id)) {
      return;
    }
    if (this.lastReductionTimestamp === 0 || event.timestamp <= this.lastReductionTimestamp) {
      return;
    }
    /**
     * modRate is what the value is called in-game that defines how fast a cooldown recharges, so reusing that terminology here
     */
    let modRate = 1;
    if (this.selectedCombatant.hasBuff(SPELLS.TRUESHOT.id)) {
      modRate /= (1 + TRUESHOT_RAPID_FIRE_RECHARGE_INCREASE);
    }
    debug && console.log('modRate: ', modRate);
    const spellReductionSpeed = 1 / modRate;
    debug && console.log('modRate: ', modRate, ' & spellReductionSpeed: ', spellReductionSpeed);
    this.reduceRapidFireCooldown(event, spellReductionSpeed);
    this.lastReductionTimestamp = event.timestamp;
  }

  reduceRapidFireCooldown(event: any, spellReductionSpeed: number) {
    const maxReductionMs: number = (event.timestamp - this.lastReductionTimestamp) * spellReductionSpeed;
    debug && console.log('Reducing Rapid Fire cooldown by up to: ', maxReductionMs + ' seconds since last event');
    const effectiveReductionMs: number = this.spellUsable.reduceCooldown(SPELLS.RAPID_FIRE.id, maxReductionMs, event.timestamp);
    this.effectiveCDRFromTrueshot += effectiveReductionMs;
    this.wastedCDRFromTrueshot += effectiveReductionMs - maxReductionMs;
  }

  onAffectingBuffChange(event: ApplyBuffEvent | RefreshBuffEvent | RemoveBuffEvent) {
    if (event.type === EventType.RemoveBuff) {
      this.onEvent(event);
    }
    this.lastReductionTimestamp = event.timestamp;
  }

  onCast(event: CastEvent) {
    const expectedCooldownDuration = this.abilities.getExpectedCooldownDuration(SPELLS.AIMED_SHOT.id, event);
    if (expectedCooldownDuration) {
      this.totalCooldown += expectedCooldownDuration;
      this.casts += 1;
    }
  }
}

export default RapidFire;
