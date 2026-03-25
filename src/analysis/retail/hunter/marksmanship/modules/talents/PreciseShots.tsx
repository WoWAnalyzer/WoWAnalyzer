import {
  ARCANE_SHOT_MAX_TRAVEL_TIME,
  WINDRUNNER_PRECISE_SHOTS_ASSUMED_PROCS,
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
  minOverwrittenProcs = 0;
  maxOverwrittenProcs = 0;
  buffedShotInFlight: number | null = null;

  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_HUNTER.PRECISE_SHOTS_TALENT);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.PRECISE_SHOTS_BUFF),
      this.onPreciseShotsApplication,
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
    if (this.selectedCombatant.hasTalent(TALENTS_HUNTER.WINDRUNNER_QUIVER_TALENT)) {
      this.buffsActive = WINDRUNNER_PRECISE_SHOTS_ASSUMED_PROCS;
    } else {
      this.buffsActive = PRECISE_SHOTS_ASSUMED_PROCS;
    }
  }

  onPreciseShotsRemoval() {
    if (this.selectedCombatant.hasTalent(TALENTS_HUNTER.WINDRUNNER_QUIVER_TALENT)) {
      this.buffsSpent += 2;
      this.buffsActive = 0;
    } else {
      this.buffsSpent += 1;
      this.buffsActive = 0;
    }
  }

  onPreciseCast(event: CastEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.PRECISE_SHOTS_BUFF.id)) {
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
        <BoringSpellValueText spell={SPELLS.PRECISE_SHOTS_BUFF}>
          <div>
            <ItemDamageDone amount={this.damage} />
          </div>
          <div>
            {this.buffsSpent} <small>buffs used</small>
          </div>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default PreciseShots;
