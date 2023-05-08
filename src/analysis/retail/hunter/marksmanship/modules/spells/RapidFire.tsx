import {
  RAPID_FIRE_FOCUS_PER_TICK,
  TRUESHOT_RAPID_FIRE_RECHARGE_INCREASE,
} from 'analysis/retail/hunter/marksmanship/constants';
import { MS_BUFFER_100 } from 'analysis/retail/hunter/shared/constants';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  AnyEvent,
  ApplyBuffEvent,
  ResourceChangeEvent,
  EventType,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/**
 * Shoot a stream of 7 shots at your target over 2 sec, dealing a total of 242% attack power Physical damage.
 * Each shot generates 1 focus.
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
  currentFocusTicks = 0;
  effectiveFocusGain = 0;
  focusWasted = 0;
  additionalFocusFromTrueshot = 0;
  possibleAdditionalFocusFromTrueshot = 0;
  lastFocusTickTimestamp = 0;

  protected spellUsable!: SpellUsable;
  protected abilities!: Abilities;

  constructor(options: Options) {
    super(options);

    this.addEventListener(Events.any, this.onEvent);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.RAPID_FIRE), this.onCast);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.TRUESHOT),
      this.onAffectingBuffChange,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.TRUESHOT),
      this.onAffectingBuffChange,
    );
    this.addEventListener(
      Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.TRUESHOT),
      this.onAffectingBuffChange,
    );
    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(SPELLS.RAPID_FIRE_FOCUS),
      this.onEnergize,
    );
  }

  onEvent(event: AnyEvent) {
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
      SPELLS.RAPID_FIRE.id,
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

  onCast() {
    this.casts += 1;
    this.currentFocusTicks = 0;
  }

  onEnergize(event: ResourceChangeEvent) {
    this.effectiveFocusGain += event.resourceChange - event.waste;
    this.focusWasted += event.waste;
    const hasTrueshot = this.selectedCombatant.hasBuff(SPELLS.TRUESHOT.id);

    /** If Trueshot is active Rapid Fire has a 50% chance to fire an additional energize event
     *  However because focus can't be fractional and WoW rounds down on halves, we simply attribute 1 focus gain per additional energize tick over the baseline amount
     */
    if (hasTrueshot && this.lastFocusTickTimestamp + MS_BUFFER_100 / 2 > event.timestamp) {
      this.additionalFocusFromTrueshot += event.resourceChange - event.waste;
      this.possibleAdditionalFocusFromTrueshot += RAPID_FIRE_FOCUS_PER_TICK;
    }
  }

  statistic() {
    return (
      <Statistic position={STATISTIC_ORDER.OPTIONAL(2)} size="flexible">
        <BoringSpellValueText spellId={SPELLS.RAPID_FIRE.id}>
          <>
            {this.effectiveFocusGain}/{this.focusWasted + this.effectiveFocusGain}{' '}
            <small>possible focus gained</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default RapidFire;
