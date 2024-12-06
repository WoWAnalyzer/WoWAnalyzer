import {
  ARCANE_SHOT_MAX_TRAVEL_TIME,
  PRECISE_SHOTS_ASSUMED_PROCS,
  PRECISE_SHOTS_MODIFIER,
} from 'analysis/retail/hunter/marksmanship/constants';
import SPELLS from 'common/SPELLS';
import { TALENTS_HUNTER } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/**
 * Aimed Shot causes your next 1-2 Arcane Shots, Chimaera Shots or Multi-Shots to deal 100% more damage.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/9Ljy6fh1TtCDHXVB#fight=2&type=auras&source=25&ability=260242
 */

class PreciseShots extends Analyzer {
  damage = 0;
  buffsActive = 0;
  buffsSpent = 0;
  minOverwrittenProcs = 0;
  maxOverwrittenProcs = 0;
  buffedShotInFlight: number | null = null;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_HUNTER.PRECISE_SHOT_TALENT);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.PRECISE_SHOTS),
      this.onPreciseShotsApplication,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.PRECISE_SHOTS),
      this.onPreciseShotsRemoval,
    );
    this.addEventListener(
      Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.PRECISE_SHOTS),
      this.onPreciseShotsStackRemoval,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.PRECISE_SHOTS),
      this.onPreciseShotsStackApplication,
    );
    this.addEventListener(
      Events.cast
        .by(SELECTED_PLAYER)
        .spell([
          SPELLS.ARCANE_SHOT,
          TALENTS_HUNTER.MULTI_SHOT_MARKSMANSHIP_TALENT,
          TALENTS_HUNTER.CHIMAERA_SHOT_TALENT,
        ]),
      this.onPreciseCast,
    );
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.checkForBuff);
    this.addEventListener(
      Events.damage
        .by(SELECTED_PLAYER)
        .spell([
          SPELLS.ARCANE_SHOT,
          TALENTS_HUNTER.MULTI_SHOT_MARKSMANSHIP_TALENT,
          SPELLS.CHIMAERA_SHOT_MM_FROST_DAMAGE,
          SPELLS.CHIMAERA_SHOT_MM_NATURE_DAMAGE,
        ]),
      this.onPreciseDamage,
    );
  }

  get preciseShotsUtilizationPercentage() {
    return this.buffsSpent / (this.buffsSpent + this.minOverwrittenProcs);
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

  onPreciseShotsApplication() {
    this.buffsActive = PRECISE_SHOTS_ASSUMED_PROCS;
  }

  onPreciseShotsRemoval() {
    this.buffsSpent += 1;
    this.buffsActive = 0;
  }

  onPreciseShotsStackRemoval() {
    this.buffsSpent += 1;
    this.buffsActive -= 1;
  }

  onPreciseShotsStackApplication() {
    this.minOverwrittenProcs += 1;
    this.maxOverwrittenProcs += 2;
    this.buffsActive = PRECISE_SHOTS_ASSUMED_PROCS;
  }

  onPreciseCast(event: CastEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.PRECISE_SHOTS.id)) {
      return;
    }
    this.buffedShotInFlight = event.timestamp;
  }

  onPreciseDamage(event: DamageEvent) {
    this.checkForBuff(event);
    if (!this.buffedShotInFlight) {
      return;
    }
    if (this.buffedShotInFlight < event.timestamp + ARCANE_SHOT_MAX_TRAVEL_TIME) {
      this.damage += calculateEffectiveDamage(event, PRECISE_SHOTS_MODIFIER);
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
            You wasted between {this.minOverwrittenProcs} and {this.maxOverwrittenProcs} Precise
            Shots procs by casting Aimed Shot when you already had Precise Shots active
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.PRECISE_SHOTS}>
          <>
            <ItemDamageDone amount={this.damage} />
            <br />
            {this.buffsSpent} <small>buffs used</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default PreciseShots;
