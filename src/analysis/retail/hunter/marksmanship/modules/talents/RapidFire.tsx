import { TRUESHOT_RAPID_FIRE_RECHARGE_INCREASE } from 'analysis/retail/hunter/marksmanship/constants';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  AnyEvent,
  ApplyBuffEvent,
  ResourceChangeEvent,
  EventType,
  RefreshBuffEvent,
  RemoveBuffEvent,
  CastEvent,
} from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import SpellUsable from 'parser/shared/modules/SpellUsable';

const BASE_TICKS = 7;
const QUICK_DRAW_TICKS = 10;
const DOUBLE_TAP_TICKS = 13;
const QUICK_DRAW_DOUBLE_TAP_TICKS = 18;
const TAKE_AIM_CDR_MS = 500;

/**
 * Shoot a stream of shots at your target over 2 sec, dealing Physical damage.
 * Each shot generates 1 focus.
 * - Base: 7 shots
 * - Quick Draw: 10 shots
 * - Double Tap: 13 shots
 * - Quick Draw + Double Tap: 18 shots
 *
 * Example log:
 *
 */
const debug = false;

class RapidFire extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    abilities: Abilities,
  };

  lastReductionTimestamp = 0;
  casts = 0;
  effectiveCDRFromTrueshot = 0;
  wastedCDRFromTrueshot = 0;
  effectiveFocusGain = 0;
  focusWasted = 0;

  protected spellUsable!: SpellUsable;
  protected abilities!: Abilities;

  constructor(options: Options) {
    super(options);

    this.addEventListener(Events.any, this.onEvent);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.RAPID_FIRE_TALENT),
      this.onCast,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(TALENTS.TRUESHOT_TALENT),
      this.onAffectingBuffChange,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(TALENTS.TRUESHOT_TALENT),
      this.onAffectingBuffChange,
    );
    this.addEventListener(
      Events.removebuff.to(SELECTED_PLAYER).spell(TALENTS.TRUESHOT_TALENT),
      this.onAffectingBuffChange,
    );
    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(SPELLS.RAPID_FIRE_FOCUS),
      this.onEnergize,
    );

    if (this.selectedCombatant.hasTalent(TALENTS.TAKE_AIM_1_MARKSMANSHIP_TALENT)) {
      this.addEventListener(
        Events.resourcechange.by(SELECTED_PLAYER).spell(SPELLS.RAPID_FIRE_FOCUS),
        this.onTakeAimTick,
      );
    }
  }

  getExpectedTicks(): number {
    const hasQuickDraw = this.selectedCombatant.hasTalent(TALENTS.QUICK_DRAW_TALENT);
    const hasDoubleTap = this.selectedCombatant.hasBuff(SPELLS.DOUBLE_TAP_BUFF.id);

    if (hasQuickDraw && hasDoubleTap) {
      return QUICK_DRAW_DOUBLE_TAP_TICKS;
    }
    if (hasQuickDraw) {
      return QUICK_DRAW_TICKS;
    }
    if (hasDoubleTap) {
      return DOUBLE_TAP_TICKS;
    }
    return BASE_TICKS;
  }

  onEvent(event: AnyEvent) {
    if (!this.selectedCombatant.hasBuff(TALENTS.TRUESHOT_TALENT.id)) {
      return;
    }
    if (!this.spellUsable.isOnCooldown(TALENTS.RAPID_FIRE_TALENT.id)) {
      return;
    }
    if (this.lastReductionTimestamp === 0 || event.timestamp <= this.lastReductionTimestamp) {
      return;
    }
    /**
     * modRate is what the value is called in-game that defines how fast a cooldown recharges, so reusing that terminology here
     */
    let modRate = 1;
    if (this.selectedCombatant.hasBuff(TALENTS.TRUESHOT_TALENT.id)) {
      modRate /= 1 + TRUESHOT_RAPID_FIRE_RECHARGE_INCREASE;
    }
    const spellReductionSpeed = 1 / modRate - 1;
    debug &&
      console.log('modRate: ', modRate, ' & additional spellReductionSpeed: ', spellReductionSpeed);
    this.reduceRapidFireCooldown(event, spellReductionSpeed);
    this.lastReductionTimestamp = event.timestamp;
  }

  reduceRapidFireCooldown(event: AnyEvent, spellReductionSpeed: number) {
    const maxReductionMs: number =
      (event.timestamp - this.lastReductionTimestamp) * spellReductionSpeed;
    debug &&
      console.log(
        'Reducing Rapid Fire cooldown by up to: ',
        maxReductionMs / 1000 + ' seconds since last event',
      );
    const effectiveReductionMs: number = this.spellUsable.reduceCooldown(
      TALENTS.RAPID_FIRE_TALENT.id,
      maxReductionMs,
      event.timestamp,
    );
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
    this.casts += 1;
    debug && console.log('Rapid Fire cast — expected ticks:', this.getExpectedTicks());
  }

  onEnergize(event: ResourceChangeEvent) {
    this.effectiveFocusGain += event.resourceChange - event.waste;
    this.focusWasted += event.waste;
  }

  private onTakeAimTick(event: ResourceChangeEvent) {
    if (this.spellUsable.isOnCooldown(TALENTS.AIMED_SHOT_TALENT.id)) {
      this.spellUsable.reduceCooldown(
        TALENTS.AIMED_SHOT_TALENT.id,
        TAKE_AIM_CDR_MS,
        event.timestamp,
      );
    }
  }
}

export default RapidFire;
