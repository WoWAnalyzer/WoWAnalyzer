import { TRUESHOT_AIMED_SHOT_RECHARGE_INCREASE } from 'analysis/retail/hunter/marksmanship/constants';
import SPELLS from 'common/SPELLS';
import { TALENTS_HUNTER } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  AnyEvent,
  ApplyBuffEvent,
  CastEvent,
  EventType,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { addInefficientCastReason } from 'parser/core/EventMetaLib';

/**
 * A powerful aimed shot that deals [(248.4% of Attack power) * ((max(0, min(Level - 10, 10)) * 8 + 130) / 210)] Physical damage.
 *
 * Example log with timeline warnings:
 * https://www.warcraftlogs.com/reports/9Ljy6fh1TtCDHXVB#fight=2&type=damage-done&source=25&ability=-19434
 */
const debug = false;

class AimedShot extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    abilities: Abilities,
  };

  lastReductionTimestamp: number = 0;
  effectiveCDRFromTrueshotDeadEye: number = 0;
  wastedCDRFromTrueshotDeadEye: number = 0;
  casts: number = 0;
  totalCooldown: number = 0;
  averageCooldown: number = 0;

  protected spellUsable!: SpellUsable;
  protected abilities!: Abilities;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_HUNTER.AIMED_SHOT_TALENT);

    this.addEventListener(Events.any, this.onEvent);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_HUNTER.AIMED_SHOT_TALENT),
      this.onCast,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell([SPELLS.TRUESHOT]),
      this.onAffectingBuffChange,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell([SPELLS.TRUESHOT]),
      this.onAffectingBuffChange,
    );
    this.addEventListener(
      Events.removebuff.to(SELECTED_PLAYER).spell([SPELLS.TRUESHOT]),
      this.onAffectingBuffChange,
    );
  }

  //Pin Cushion reduces the cooldown of Aimed Shot by 2 seconds
  onSteadyShot(event: CastEvent) {
    if (this.selectedCombatant.hasTalent(TALENTS_HUNTER.PIN_CUSHION_TALENT)) {
      this.spellUsable.reduceCooldown(TALENTS_HUNTER.AIMED_SHOT_TALENT.id, 2000);
    }
  }

  onEvent(event: AnyEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.TRUESHOT.id)) {
      return;
    }
    if (!this.spellUsable.isOnCooldown(TALENTS_HUNTER.AIMED_SHOT_TALENT.id)) {
      return;
    }
    if (this.lastReductionTimestamp === 0 || event.timestamp <= this.lastReductionTimestamp) {
      return;
    }
    /**
     * modRate is what the value is called in-game that defines how fast a cooldown recharges, so reusing that terminology here
     * Dead Eye and Trueshot scale multiplicatively off each other, which can lead to extremely fast cooldown reduction that this should properly handle.
     */
    let modRate = 1;
    if (this.selectedCombatant.hasBuff(SPELLS.TRUESHOT.id)) {
      modRate /= 1 + TRUESHOT_AIMED_SHOT_RECHARGE_INCREASE;
    }
    const spellReductionSpeed = 1 / modRate - 1;
    debug &&
      console.log('modRate: ', modRate, ' & additional spellReductionSpeed: ', spellReductionSpeed);
    this.reduceAimedShotCooldown(event, spellReductionSpeed);
    this.lastReductionTimestamp = event.timestamp;
  }

  reduceAimedShotCooldown(event: AnyEvent, spellReductionSpeed: number) {
    const maxReductionMs: number =
      (event.timestamp - this.lastReductionTimestamp) * spellReductionSpeed;
    debug &&
      console.log(
        'Reducing Aimed Shot cooldown by up to: ',
        maxReductionMs / 1000 + ' seconds since last event',
      );
    const effectiveReductionMs: number = this.spellUsable.reduceCooldown(
      TALENTS_HUNTER.AIMED_SHOT_TALENT.id,
      maxReductionMs,
      event.timestamp,
    );
    this.effectiveCDRFromTrueshotDeadEye += effectiveReductionMs;
    this.wastedCDRFromTrueshotDeadEye += effectiveReductionMs - maxReductionMs;
  }

  onAffectingBuffChange(event: ApplyBuffEvent | RefreshBuffEvent | RemoveBuffEvent) {
    if (event.type === EventType.RemoveBuff) {
      this.onEvent(event);
    }
    this.lastReductionTimestamp = event.timestamp;
  }

  onCast(event: CastEvent) {
    const expectedCooldownDuration = this.abilities.getExpectedCooldownDuration(
      TALENTS_HUNTER.AIMED_SHOT_TALENT.id,
    );
    if (expectedCooldownDuration) {
      this.totalCooldown += expectedCooldownDuration;
      this.casts += 1;
    }

    const hasPreciseShotsBuff = this.selectedCombatant.hasBuff(SPELLS.PRECISE_SHOTS.id);
    const hasTrueshotBuff = this.selectedCombatant.hasBuff(SPELLS.TRUESHOT.id);

    if (hasPreciseShotsBuff && !hasTrueshotBuff) {
      addInefficientCastReason(event, 'Aimed Shot while having Precise Shots stacks left.');
    }
  }
}

export default AimedShot;
