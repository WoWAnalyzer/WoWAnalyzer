import { Trans } from '@lingui/react/macro';
import {
  ARCANE_SHOT_MAX_TRAVEL_TIME,
  BLEAK_POWDER_TRICK_SHOTS_WINDOW,
  WINDRUNNER_PRECISE_SHOTS_ASSUMED_PROCS,
  PRECISE_SHOTS_ASSUMED_PROCS,
  WINDRUNNER_PRECISE_SHOTS_MODIFIER,
  PRECISE_SHOTS_MODIFIER,
} from 'analysis/retail/hunter/marksmanship/constants';
import SPELLS from 'common/SPELLS';
import { TALENTS_HUNTER } from 'common/TALENTS';
import { MS_BUFFER_50 } from 'analysis/retail/hunter/shared/constants';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, {
  ApplyBuffEvent,
  CastEvent,
  DamageEvent,
  RefreshBuffEvent,
} from 'parser/core/Events';
import { addInefficientCastReason } from 'parser/core/EventMetaLib';
import { ThresholdStyle } from 'parser/core/ParseResults';
import { BadColor } from 'interface/guide';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import SpellUsable from 'parser/shared/modules/SpellUsable';

/**
 * Aimed Shot causes your next 1-2 Arcane Shots, Chimaera Shots or Multi-Shots to deal 100% more damage.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/9Ljy6fh1TtCDHXVB#fight=2&type=auras&source=25&ability=260242
 */

class PreciseShots extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  damage = 0;
  buffsActive = 0;
  buffsSpent = 0;
  inFlightStacks = 0;
  overwrittenProcs = 0;
  castsWithoutPreciseShots = 0;
  buffedShotInFlight: number | null = null;
  pendingBlackArrowCast: CastEvent | null = null;

  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_HUNTER.PRECISE_SHOTS_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell([TALENTS_HUNTER.AIMED_SHOT_TALENT]),
      this.onASPreciseShotsApplication,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell([TALENTS_HUNTER.RAPID_FIRE_TALENT]),
      this.onRFPreciseShotsApplication,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.PRECISE_SHOTS_BUFF),
      this.onPreciseShotsRemoval,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell([SPELLS.ARCANE_SHOT, SPELLS.MULTISHOT_MM]),
      this.onPreciseCast,
    );
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.checkForBuff);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell([SPELLS.ARCANE_SHOT, SPELLS.MULTISHOT_MM]),
      this.onPreciseDamage,
    );

    if (this.selectedCombatant.hasTalent(TALENTS_HUNTER.BLACK_ARROW_MARKSMANSHIP_TALENT)) {
      this.addEventListener(
        Events.cast.by(SELECTED_PLAYER).spell(SPELLS.BLACK_ARROW_DAMAGE),
        this.onBlackArrowCast,
      );
      this.addEventListener(
        Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.TRICK_SHOTS_BUFF),
        this.onTrickShotsApplied,
      );
      this.addEventListener(
        Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.TRICK_SHOTS_BUFF),
        this.onTrickShotsApplied,
      );
    }
  }

  get preciseShotsUtilizationPercentage() {
    return this.buffsSpent / (this.buffsSpent + this.overwrittenProcs);
  }

  get preciseShotsWastedThreshold() {
    return {
      actual: this.preciseShotsUtilizationPercentage,
      isLessThan: {
        minor: 0.9,
        average: 0.85,
        major: 0.8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  onASPreciseShotsApplication() {
    if (this.buffsActive != 0) {
      this.overwrittenProcs += 1;
    }
    if (this.selectedCombatant.hasTalent(TALENTS_HUNTER.WINDRUNNER_QUIVER_TALENT)) {
      this.buffsActive = WINDRUNNER_PRECISE_SHOTS_ASSUMED_PROCS;
    } else {
      this.buffsActive = PRECISE_SHOTS_ASSUMED_PROCS;
    }
  }

  onRFPreciseShotsApplication() {
    if (!this.selectedCombatant.hasTalent(TALENTS_HUNTER.NO_SCOPE_TALENT)) {
      return;
    }
    if (this.selectedCombatant.hasTalent(TALENTS_HUNTER.WINDRUNNER_QUIVER_TALENT)) {
      if (this.buffsActive == WINDRUNNER_PRECISE_SHOTS_ASSUMED_PROCS) {
        this.overwrittenProcs += 1;
      }
      if (this.buffsActive != WINDRUNNER_PRECISE_SHOTS_ASSUMED_PROCS) {
        this.buffsActive += 1;
      }
    } else {
      if (this.buffsActive == PRECISE_SHOTS_ASSUMED_PROCS) {
        this.overwrittenProcs += 1;
      }
      this.buffsActive = PRECISE_SHOTS_ASSUMED_PROCS;
    }
  }

  onPreciseShotsRemoval() {
    this.buffsSpent += this.buffsActive;
    this.buffsActive = 0;
  }

  onPreciseCast(event: CastEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.PRECISE_SHOTS_BUFF.id)) {
      // Multi-Shot is exempt if it's the cast turning Trick Shots on from cold - Arcane Shot
      // never gets an exception.
      const isMultiShot = event.ability.guid === SPELLS.MULTISHOT_MM.id;
      const trickShotsWasActive = this.selectedCombatant.hasBuff(
        SPELLS.TRICK_SHOTS_BUFF.id,
        event.timestamp,
        0,
        MS_BUFFER_50,
      );
      if (!isMultiShot || trickShotsWasActive) {
        this.flagCastWithoutPreciseShots(event);
      }
      return;
    }
    this.buffedShotInFlight = event.timestamp;
    this.inFlightStacks = this.buffsActive;
  }

  onBlackArrowCast(event: CastEvent) {
    // Resolve whatever the previous Black Arrow cast was waiting on - if Bleak Powder was going
    // to save it, that would've happened well before another Black Arrow came off cooldown.
    this.resolvePendingBlackArrowCast();

    if (this.selectedCombatant.hasBuff(SPELLS.PRECISE_SHOTS_BUFF.id)) {
      return;
    }
    const trickShotsWasActive = this.selectedCombatant.hasBuff(
      SPELLS.TRICK_SHOTS_BUFF.id,
      event.timestamp,
      0,
      1,
    );
    if (trickShotsWasActive) {
      // Trick Shots was already up, so Bleak Powder applying it again doesn't excuse this cast.
      this.flagCastWithoutPreciseShots(event);
      return;
    }
    // Trick Shots was down - hold judgment until we know whether Bleak Powder turns it on.
    this.pendingBlackArrowCast = event;
  }

  onTrickShotsApplied(event: ApplyBuffEvent | RefreshBuffEvent) {
    if (
      this.pendingBlackArrowCast &&
      event.timestamp - this.pendingBlackArrowCast.timestamp <= BLEAK_POWDER_TRICK_SHOTS_WINDOW
    ) {
      this.pendingBlackArrowCast = null;
    }
  }

  resolvePendingBlackArrowCast() {
    if (this.pendingBlackArrowCast) {
      this.flagCastWithoutPreciseShots(this.pendingBlackArrowCast);
      this.pendingBlackArrowCast = null;
    }
  }

  onFightEnd() {
    this.resolvePendingBlackArrowCast();
  }

  flagCastWithoutPreciseShots(event: CastEvent) {
    this.castsWithoutPreciseShots += 1;
    addInefficientCastReason(
      event,
      <Trans id="hunter.marksmanship.modules.talents.preciseShots.castWithoutBuff">
        This should never be cast without Precise Shots active.
      </Trans>,
    );
  }

  onPreciseDamage(event: DamageEvent) {
    this.checkForBuff(event);
    if (!this.buffedShotInFlight) {
      return;
    }
    if (this.buffedShotInFlight < event.timestamp + ARCANE_SHOT_MAX_TRAVEL_TIME) {
      if (this.selectedCombatant.hasTalent(TALENTS_HUNTER.WINDRUNNER_QUIVER_TALENT)) {
        this.damage += calculateEffectiveDamage(
          event,
          WINDRUNNER_PRECISE_SHOTS_MODIFIER * this.inFlightStacks,
        );
      } else {
        this.damage += calculateEffectiveDamage(event, PRECISE_SHOTS_MODIFIER);
      }
    }
    if (event.ability.guid === SPELLS.ARCANE_SHOT.id) {
      this.buffedShotInFlight = null;
    }
  }

  checkForBuff(event: DamageEvent) {
    if (!this.buffedShotInFlight) {
      return;
    }
    if (this.buffedShotInFlight > event.timestamp + ARCANE_SHOT_MAX_TRAVEL_TIME) {
      this.buffedShotInFlight = null;
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(2)}
        size="flexible"
        tooltip={
          <>
            You wasted {this.overwrittenProcs} Precise Shots procs by casting{' '}
            {this.selectedCombatant.hasTalent(TALENTS_HUNTER.WINDRUNNER_QUIVER_TALENT)
              ? 'Aimed Shot or Rapid Fire'
              : 'Aimed Shot'}{' '}
            when you already had Precise Shots active.
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.PRECISE_SHOTS_BUFF}>
          <div>
            <ItemDamageDone amount={this.damage} />
          </div>
          <div>
            {this.buffsSpent} <small>buffs used</small>
          </div>
          {this.castsWithoutPreciseShots > 0 && (
            <div style={{ color: BadColor }}>
              {this.castsWithoutPreciseShots} <small>casts without Precise Shots</small>
            </div>
          )}
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default PreciseShots;
