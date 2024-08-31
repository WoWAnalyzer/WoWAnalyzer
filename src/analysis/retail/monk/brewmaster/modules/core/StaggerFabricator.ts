import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/monk';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  AddStaggerEvent,
  RemoveStaggerEvent,
  AbsorbedEvent,
  AnyEvent,
  CastEvent,
  DamageEvent,
  DeathEvent,
  EventType,
} from 'parser/core/Events';
import EventEmitter from 'parser/core/modules/EventEmitter';
import Haste from 'parser/shared/modules/Haste';

import HighTolerance, { HIGH_TOLERANCE_HASTE } from '../spells/HighTolerance';

type StaggerEventType = EventType.AddStagger | EventType.RemoveStagger;

const PURIFY_BASE = 0.5;

const STAGGER_THRESHOLDS = {
  HEAVY: 0.6,
  MODERATE: 0.3,
  LIGHT: 0.0,
};

const MANTRA_OF_PURITY_BONUS = 0.1; // "Purifying Brew removes 10% additional Stagger [...]"

type PurifyBreakdown = {
  base: number;
  [key: number]: number;
};

type MaxHPEvent = AnyEvent & { maxHitPoints?: number };

/**
 * Fabricate events corresponding to stagger pool updates. Each stagger
 * tick, purify, and stagger absorb generates one event.
 */
class StaggerFabricator extends Analyzer {
  static dependencies = {
    eventEmitter: EventEmitter,
    ht: HighTolerance,
    haste: Haste,
  };
  _lastKnownMaxHp = 0;
  _initialized = false;
  _previousBuff: number | null = 0;
  protected eventEmitter!: EventEmitter;
  protected ht!: HighTolerance;
  protected haste!: Haste;

  constructor(options: Options) {
    super(options);

    //count as uninitialized if fight didn't start at actual fight start time (aka phase)
    this._initialized = (this.owner.fight.offset_time || 0) === 0;

    this.addEventListener(Events.cast.spell(talents.PURIFYING_BREW_TALENT), this._pbCast);
    this.addEventListener(Events.absorbed, this._absorb);
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this._damage);
    this.addEventListener(Events.death.to(SELECTED_PLAYER), this._death);
  }

  _staggerPool = 0;

  get staggerPool() {
    return this._staggerPool;
  }

  purifyPercentage(): PurifyBreakdown {
    const breakdown: PurifyBreakdown = {
      base: PURIFY_BASE,
    };
    if (this.selectedCombatant.hasTalent(talents.MANTRA_OF_PURITY_TALENT)) {
      breakdown[talents.MANTRA_OF_PURITY_TALENT.id] = MANTRA_OF_PURITY_BONUS;
    }

    return breakdown;
  }

  addStagger(event: MaxHPEvent, amount: number) {
    this._staggerPool += amount;
    const staggerEvent = this._fab(EventType.AddStagger, event, amount);
    this.eventEmitter.fabricateEvent(staggerEvent, event);
    if (this.ht && this.ht.active) {
      this._updateHaste(event, staggerEvent);
    }
  }

  removeStagger(event: MaxHPEvent, amount: number, sourceBreakdown?: PurifyBreakdown) {
    this._staggerPool -= amount;
    const overage = this._staggerPool < 0 ? this._staggerPool : 0;
    // sometimes a stagger tick is recorded immediately after death.
    // this ensures we don't go into negative stagger
    //
    // other sources of flat reduction may also hit this condition
    this._staggerPool = Math.max(this._staggerPool, 0);
    const staggerEvent = this._fab(
      EventType.RemoveStagger,
      event,
      amount,
      overage,
    ) as RemoveStaggerEvent;
    if (sourceBreakdown) {
      staggerEvent.sourceBreakdown = sourceBreakdown;
    }
    this.eventEmitter.fabricateEvent(staggerEvent, event);
    if (this.ht && this.ht.active) {
      this._updateHaste(event, staggerEvent);
    }
    return amount + overage;
  }

  _fab(type: StaggerEventType, reason: MaxHPEvent, amount: number, overage: number = 0) {
    return {
      timestamp: reason.timestamp,
      type: type,
      amount: amount + overage,
      overheal: -overage,
      newPooledDamage: this._staggerPool,
    };
  }

  _updateHaste(sourceEvent: MaxHPEvent, staggerEvent: AddStaggerEvent | RemoveStaggerEvent) {
    let currentBuff;
    const staggerRatio =
      staggerEvent.newPooledDamage /
      (sourceEvent.maxHitPoints ? sourceEvent.maxHitPoints : this._lastKnownMaxHp);
    if (staggerRatio === 0) {
      currentBuff = null;
    } else if (staggerRatio < STAGGER_THRESHOLDS.MODERATE) {
      currentBuff = SPELLS.LIGHT_STAGGER_DEBUFF.id;
    } else if (staggerRatio < STAGGER_THRESHOLDS.HEAVY) {
      currentBuff = SPELLS.MODERATE_STAGGER_DEBUFF.id;
    } else {
      currentBuff = SPELLS.HEAVY_STAGGER_DEBUFF.id;
    }

    if (currentBuff !== this._previousBuff) {
      this._previousBuff &&
        this.haste._applyHasteLoss(staggerEvent, HIGH_TOLERANCE_HASTE[this._previousBuff]);
      currentBuff && this.haste._applyHasteGain(staggerEvent, HIGH_TOLERANCE_HASTE[currentBuff]);
      this._previousBuff = currentBuff;
    }
  }

  private _absorb(event: AbsorbedEvent) {
    if (event.ability.guid !== SPELLS.STAGGER.id) {
      return;
    }
    if (
      event.extraAbility &&
      event.extraAbility.guid === SPELLS.SPIRIT_LINK_TOTEM_REDISTRIBUTE.id
    ) {
      return;
    }
    this.addStagger(event, event.amount);
  }

  private _damage(event: DamageEvent) {
    // used for buff tracking
    if (event.maxHitPoints) {
      this._lastKnownMaxHp = event.maxHitPoints;
    }

    if (event.ability.guid !== SPELLS.STAGGER_TAKEN.id) {
      return;
    }
    const amount = event.amount + (event.absorbed || 0);
    if (!this._initialized) {
      //if stagger hasn't been initialized (aka new phase), send a fake add stagger event
      this._staggerPool = amount * 19; //stagger lasts for 10 seconds at 0.5s per tick, we can calculate the total stagger remaining in the pool to be 19*tick (1 out of 20 total stacks being removed this tick)
      this.addStagger(
        {
          ...event,
          __fabricated: true,
          prepull: true,
        },
        0,
      ); //send empty stagger event to initialized purify etc without tainting the damage staggered statistic
      this._initialized = true;
    } else {
      //skip this tick's remove event as we only added 19 ticks to the pool
      this.removeStagger(event, amount);
    }
  }

  private _pbCast(event: CastEvent) {
    // used for buff tracking
    if (event.maxHitPoints) {
      this._lastKnownMaxHp = event.maxHitPoints;
    }

    const totalPct = Object.values(this.purifyPercentage()).reduce((a, b) => a + b, 0);
    const amount = this._staggerPool * totalPct;
    this.removeStagger(event, amount, this.purifyPercentage());
  }

  private _death(event: DeathEvent) {
    const amount = this._staggerPool;
    this.removeStagger(event, amount);
  }
}

export default StaggerFabricator;
