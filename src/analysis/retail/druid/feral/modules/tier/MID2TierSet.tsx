import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { TIERS } from 'game/TIERS';
import SPELLS from 'common/SPELLS';
import { TALENTS_DRUID } from 'common/TALENTS';
import Spell from 'common/SPELLS/Spell';
import Events, {
  ApplyBuffEvent,
  CastEvent,
  DamageEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import getResourceSpent from 'parser/core/getResourceSpent';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import BoringItemSetValueText from 'parser/ui/BoringItemSetValueText';
import ItemPercentDamageDone from 'parser/ui/ItemPercentDamageDone';
import { DRUID_MID2_ID } from 'common/ITEMS';
import { formatDuration, formatPercentage } from 'common/format';
import { SpellLink } from 'interface';
import UptimeIcon from 'interface/icons/Uptime';
import { cdSpell, FINISHERS, MAX_CPS } from 'analysis/retail/druid/feral/constants';
import {
  getBerserkBaseDuration,
  MID2_FOUR_PIECE_BERSERK_BONUS,
} from 'analysis/retail/druid/feral/modules/spells/Berserk';

const DEBUG = false;

const TWO_PIECE_DAMAGE_BONUS = 0.1;
const DURATION_PER_CP_MS = 1_000;
/** With both Incarnation and Ashamane's Guidance talented, the per-CP duration is reduced. */
const DURATION_PER_CP_INCARN_AG_MS = 750;

/**
 * **Bark of the Enigmatic Dreamwatcher**
 * Feral Druid Midnight Season 2 tier set
 *
 * 2pc — When Berserk / Incarnation ends, you deal 10% increased damage (Halazzi's Fury) for 1 sec
 * per combo point spent during it (0.75 sec with Incarnation + Ashamane's Guidance).
 *
 * 4pc — Berserk / Incarnation lasts 10 sec longer.
 *
 * The 2pc damage is read directly off the Halazzi's Fury buff. The 4pc has no proc of its own, so
 * it is reported as the Halazzi's Fury time the combo points spent in its extra 10s earned.
 *
 * Combo points "spent" follow the game's count rather than the finisher's cost: the Overflowing
 * Power stacks held at cast time (CPs generated over the cap during Berserk) are included, and free
 * Apex bites count as a full 5. Convoke'd finishers add nothing - verified against logs, where
 * counting them overshoots the real buff duration in every window.
 */
class MID2TierSet extends Analyzer {
  hasFourPiece = false;

  /** Berserk or Incarnation depending on talent */
  private cdSpell: Spell;
  /** Berserk / Incarn duration before the 4pc bonus */
  private berserkBaseDuration: number;
  private durationPerCp: number;

  // 2pc tracking
  halazziProcs = 0;
  halazziDamage = 0;
  /** Combo points spent inside Berserk, summed over the fight */
  cpsSpentInBerserk = 0;
  /** Combo points spent inside the current Berserk, reset when Halazzi's Fury ends */
  private cpsThisBerserk = 0;
  private lastHalazziApply?: number;

  // 4pc tracking
  berserkCasts = 0;
  /** Combo points spent during the extra 10s, summed over the fight */
  cpsSpentInExtension = 0;
  private lastBerserkCast?: number;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.has2PieceByTier(TIERS.MID2);
    this.hasFourPiece = this.selectedCombatant.has4PieceByTier(TIERS.MID2);

    this.cdSpell = cdSpell(this.selectedCombatant);
    this.berserkBaseDuration = getBerserkBaseDuration(this.selectedCombatant);
    this.durationPerCp =
      this.selectedCombatant.hasTalent(TALENTS_DRUID.INCARNATION_AVATAR_OF_ASHAMANE_TALENT) &&
      this.selectedCombatant.hasTalent(TALENTS_DRUID.ASHAMANES_GUIDANCE_TALENT)
        ? DURATION_PER_CP_INCARN_AG_MS
        : DURATION_PER_CP_MS;

    if (!this.active) {
      return;
    }

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(FINISHERS), this.onFinisherCast);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.FERAL_DRUID_HALAZZIS_FURY),
      this.onHalazziApply,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.FERAL_DRUID_HALAZZIS_FURY),
      this.onHalazziApply,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.FERAL_DRUID_HALAZZIS_FURY),
      this.onHalazziRemove,
    );
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);

    if (this.hasFourPiece) {
      this.addEventListener(
        Events.cast.by(SELECTED_PLAYER).spell(this.cdSpell),
        this.onBerserkCast,
      );
    }
  }

  onFinisherCast(event: CastEvent) {
    if (!this.selectedCombatant.hasBuff(this.cdSpell.id)) {
      return;
    }
    // free finishers (Apex bites) spend 0 but count as a full-CP finisher, with no overflow
    const spent = getResourceSpent(event, RESOURCE_TYPES.COMBO_POINTS);
    const cps =
      spent === 0
        ? MAX_CPS
        : spent + this.selectedCombatant.getBuffStacks(SPELLS.OVERFLOWING_POWER.id);
    this.cpsSpentInBerserk += cps;
    this.cpsThisBerserk += cps;
    if (this.isInExtension(event.timestamp)) {
      this.cpsSpentInExtension += cps;
    }
  }

  onHalazziApply(event: ApplyBuffEvent | RefreshBuffEvent) {
    this.halazziProcs += 1;
    this.lastHalazziApply = event.timestamp;
  }

  onHalazziRemove(event: RemoveBuffEvent) {
    if (DEBUG && this.lastHalazziApply !== undefined) {
      console.log(
        `Halazzi's Fury @ ${this.owner.formatTimestamp(this.lastHalazziApply)}: ` +
          `expected ${(this.cpsThisBerserk * this.durationPerCp) / 1000}s from ${this.cpsThisBerserk} CPs, ` +
          `actual ${(event.timestamp - this.lastHalazziApply) / 1000}s`,
      );
    }
    this.cpsThisBerserk = 0;
  }

  onDamage(event: DamageEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.FERAL_DRUID_HALAZZIS_FURY.id)) {
      this.halazziDamage += calculateEffectiveDamage(event, TWO_PIECE_DAMAGE_BONUS);
    }
  }

  onBerserkCast(event: CastEvent) {
    this.berserkCasts += 1;
    this.lastBerserkCast = event.timestamp;
  }

  /** True when the timestamp falls in the final 10s that the 4pc added to the current Berserk */
  private isInExtension(timestamp: number): boolean {
    if (!this.hasFourPiece || this.lastBerserkCast === undefined) {
      return false;
    }
    const extensionStart = this.lastBerserkCast + this.berserkBaseDuration;
    return (
      timestamp >= extensionStart && timestamp < extensionStart + MID2_FOUR_PIECE_BERSERK_BONUS
    );
  }

  get halazziUptime() {
    return (
      this.selectedCombatant.getBuffUptime(SPELLS.FERAL_DRUID_HALAZZIS_FURY.id) /
      this.owner.fightDuration
    );
  }

  /** Total Halazzi's Fury duration the player's finishers earned */
  get expectedHalazziDuration() {
    return this.cpsSpentInBerserk * this.durationPerCp;
  }

  get extraBerserkDuration() {
    return this.berserkCasts * MID2_FOUR_PIECE_BERSERK_BONUS;
  }

  /** Halazzi's Fury time earned by combo points spent in the 4pc's extra 10s */
  get halazziTimeFromFourPiece() {
    return this.cpsSpentInExtension * this.durationPerCp;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(1)}
        category={STATISTIC_CATEGORY.ITEMS}
        size="flexible"
        tooltip={
          <>
            <p>
              <strong>2pc</strong> — when <SpellLink spell={this.cdSpell} /> ends you gain{' '}
              <SpellLink spell={SPELLS.FERAL_DRUID_HALAZZIS_FURY} /> (+10% damage) for{' '}
              {this.durationPerCp / 1000}s per combo point spent during it. Damage is attributed at
              10% of everything you dealt while the buff was up.
            </p>
            <ul>
              <li>
                Procs: <strong>{this.halazziProcs}</strong>
              </li>
              <li>
                Combo points spent in <SpellLink spell={this.cdSpell} />:{' '}
                <strong>{this.cpsSpentInBerserk}</strong> (
                {formatDuration(this.expectedHalazziDuration)} of buff earned)
              </li>
              <li>
                Buff uptime: <strong>{formatPercentage(this.halazziUptime, 1)}%</strong>
              </li>
            </ul>
            {this.hasFourPiece && (
              <>
                <p>
                  <strong>4pc</strong> — each <SpellLink spell={this.cdSpell} /> lasts 10s longer,
                  and the combo points you spend in those extra seconds lengthen{' '}
                  <SpellLink spell={SPELLS.FERAL_DRUID_HALAZZIS_FURY} />.
                </p>
                <ul>
                  <li>
                    Extra <SpellLink spell={this.cdSpell} /> time:{' '}
                    <strong>{formatDuration(this.extraBerserkDuration)}</strong> over{' '}
                    {this.berserkCasts} casts
                  </li>
                  <li>
                    Combo points spent in the extra time:{' '}
                    <strong>{this.cpsSpentInExtension}</strong>
                  </li>
                </ul>
              </>
            )}
          </>
        }
      >
        <BoringItemSetValueText setId={DRUID_MID2_ID} title="Bark of the Enigmatic Dreamwatcher">
          <div>2pc:</div>
          <div>
            <ItemPercentDamageDone amount={this.halazziDamage} />
          </div>
          {this.hasFourPiece && (
            <>
              <hr />
              <div>4pc:</div>
              <div>
                <UptimeIcon /> {formatDuration(this.halazziTimeFromFourPiece)}{' '}
                <small>
                  <SpellLink spell={SPELLS.FERAL_DRUID_HALAZZIS_FURY} /> gained
                </small>
              </div>
            </>
          )}
        </BoringItemSetValueText>
      </Statistic>
    );
  }
}

export default MID2TierSet;
