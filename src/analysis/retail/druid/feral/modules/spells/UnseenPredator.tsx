import type { ReactNode } from 'react';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import { TALENTS_DRUID } from 'common/TALENTS';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import getResourceSpent from 'parser/core/getResourceSpent';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemPercentDamageDone from 'parser/ui/ItemPercentDamageDone';
import { SpellLink } from 'interface';
import { formatPercentage } from 'common/format';
import { BadColor, OkColor } from 'interface/guide';
import {
  FB_SPELLS,
  FEROCIOUS_BITE_ENERGY,
  getFerociousBiteMaxDrain,
  MAX_CPS,
} from 'analysis/retail/druid/feral/constants';
import { getAdditionalEnergyUsed } from 'analysis/retail/druid/feral/normalizers/FerociousBiteDrainLinkNormalizer';
import { isConvoking } from 'analysis/retail/druid/shared/spells/ConvokeSpirits';

const RIP_BONUS_FROM_NODE_3 = 0.3;
const CRAVING_BONUS_PER_RANK = 0.075;
const CRAVING_DURATION_PER_CP_MS = 1000;

/**
 * **Unseen Predator**
 * Apex Talent
 *
 * Node 1 — Ferocious Bite has 15% chance per CP spent to trigger Unseen Slash (single target) or
 * Unseen Swipe (3+ targets). Damage is reduced if the Bite spent less than 5 CPs or less than the
 * full extra energy drain.
 *
 * Node 2 — Unseen Attacks grant Unseen Predator's Craving, increasing all damage by 7.5% per rank
 * for 1 second per CP spent. Additional procs extend the duration.
 *
 * Node 3 — Rip damage increased by 30%. Tiger's Fury causes your next 2 combo-point generators to
 * trigger a max-strength Unseen Attack.
 */
class UnseenPredator extends Analyzer {
  // direct proc damage (node 1)
  slashDirectDamage = 0;
  slashBleedDamage = 0;
  swipeDamage = 0;

  // +30% Rip damage (node 3)
  ripBonusDamage = 0;

  // all-damage buff bonus (node 2)
  cravingBonusDamage = 0;

  // FB cast tracking (drives the controllable "full strength FB" metric)
  fbCasts = 0;
  fullStrengthFbs = 0;

  /** CPs spent by the most recent FB, used to size the next Craving window */
  private lastFbCps = MAX_CPS;
  /** End timestamp of the current Craving buff window; extended by additional procs */
  private cravingWindowEnd = 0;
  /** Dedupes Unseen Swipe's per-target cleave so each proc extends the window once */
  private lastProcExtensionTs = -1;

  private readonly hasNode1: boolean;
  private readonly node2Rank: number;
  private readonly hasNode3: boolean;
  private readonly cravingMultiplier: number;

  constructor(options: Options) {
    super(options);

    this.hasNode1 = this.selectedCombatant.hasTalent(TALENTS_DRUID.UNSEEN_PREDATOR_1_FERAL_TALENT);
    this.node2Rank = this.selectedCombatant.getTalentRank(
      TALENTS_DRUID.UNSEEN_PREDATOR_2_FERAL_TALENT,
    );
    this.hasNode3 = this.selectedCombatant.hasTalent(TALENTS_DRUID.UNSEEN_PREDATOR_3_FERAL_TALENT);
    this.cravingMultiplier = this.node2Rank * CRAVING_BONUS_PER_RANK;

    this.active = this.hasNode1 || this.node2Rank > 0 || this.hasNode3;
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.UNSEEN_SLASH_DAMAGE),
      (event: DamageEvent) => {
        this.slashDirectDamage += event.amount + (event.absorbed || 0);
      },
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.UNSEEN_SLASH_BLEED),
      (event: DamageEvent) => {
        this.slashBleedDamage += event.amount + (event.absorbed || 0);
      },
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.UNSEEN_SWIPE_DAMAGE),
      (event: DamageEvent) => {
        this.swipeDamage += event.amount + (event.absorbed || 0);
      },
    );

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(FB_SPELLS), this.onFbCast);

    if (this.hasNode3) {
      this.addEventListener(
        Events.damage.by(SELECTED_PLAYER).spell(SPELLS.RIP),
        (event: DamageEvent) => {
          this.ripBonusDamage += calculateEffectiveDamage(event, RIP_BONUS_FROM_NODE_3);
        },
      );
    }

    if (this.node2Rank > 0) {
      // The proc's cast event has a proxy sourceID, so .by(SELECTED_PLAYER) drops it. Use the
      // damage event instead (correctly sourced from the player) and dedupe Swipe's cleave hits.
      this.addEventListener(
        Events.damage
          .by(SELECTED_PLAYER)
          .spell([SPELLS.UNSEEN_SLASH_DAMAGE, SPELLS.UNSEEN_SWIPE_DAMAGE]),
        this.onUnseenAttackHit,
      );
      this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onAnyDamageForCraving);
    }
  }

  onFbCast(event: CastEvent) {
    const cps = getResourceSpent(event, RESOURCE_TYPES.COMBO_POINTS);
    // Free Apex Predator's Craving bites trigger max-strength Unseen Attacks
    if (cps === 0) {
      this.fbCasts += 1;
      this.fullStrengthFbs += 1;
      this.lastFbCps = MAX_CPS;
      return;
    }
    // Convoke-fired bites aren't a player decision
    if (isConvoking(this.selectedCombatant)) {
      this.lastFbCps = cps;
      return;
    }
    this.fbCasts += 1;
    // Cast event reports only the 25 base energy cost; the 0-25 drain is a linked event
    const energy = getResourceSpent(event, RESOURCE_TYPES.ENERGY) + getAdditionalEnergyUsed(event);
    const maxTotalEnergy = FEROCIOUS_BITE_ENERGY + getFerociousBiteMaxDrain(this.selectedCombatant);
    // 1 energy of slack for talent-multiplier rounding (e.g. Incarn's 0.75)
    if (cps >= MAX_CPS && energy >= maxTotalEnergy - 1) {
      this.fullStrengthFbs += 1;
    }
    this.lastFbCps = cps;
  }

  onUnseenAttackHit(event: DamageEvent) {
    if (event.timestamp === this.lastProcExtensionTs) {
      return;
    }
    this.lastProcExtensionTs = event.timestamp;
    const newEnd = event.timestamp + this.lastFbCps * CRAVING_DURATION_PER_CP_MS;
    if (newEnd > this.cravingWindowEnd) {
      this.cravingWindowEnd = newEnd;
    }
  }

  onAnyDamageForCraving(event: DamageEvent) {
    if (event.timestamp > this.cravingWindowEnd) {
      return;
    }
    this.cravingBonusDamage += calculateEffectiveDamage(event, this.cravingMultiplier);
  }

  get directProcDamage(): number {
    return this.slashDirectDamage + this.slashBleedDamage + this.swipeDamage;
  }

  get totalDamage(): number {
    return this.directProcDamage + this.ripBonusDamage + this.cravingBonusDamage;
  }

  get fullStrengthFbRate(): number {
    return this.fbCasts === 0 ? 0 : this.fullStrengthFbs / this.fbCasts;
  }

  get breakdownRows(): BreakdownRow[] {
    const rows: BreakdownRow[] = [
      { label: <SpellLink spell={SPELLS.UNSEEN_SLASH_DAMAGE} />, damage: this.slashDirectDamage },
      { label: <SpellLink spell={SPELLS.UNSEEN_SLASH_BLEED} />, damage: this.slashBleedDamage },
      { label: <SpellLink spell={SPELLS.UNSEEN_SWIPE_DAMAGE} />, damage: this.swipeDamage },
    ];
    if (this.hasNode3) {
      rows.push({
        label: (
          <>
            <SpellLink spell={SPELLS.RIP} /> <small>+30%</small>
          </>
        ),
        damage: this.ripBonusDamage,
      });
    }
    if (this.node2Rank > 0) {
      rows.push({
        label: (
          <>
            <SpellLink spell={SPELLS.UNSEEN_PREDATORS_CRAVING_BUFF} />{' '}
            <small>+{formatPercentage(this.cravingMultiplier, 1)}%</small>
          </>
        ),
        damage: this.cravingBonusDamage,
      });
    }
    return rows;
  }

  statistic() {
    const fullStrengthColor =
      this.fullStrengthFbRate >= 0.9
        ? undefined
        : this.fullStrengthFbRate >= 0.75
          ? OkColor
          : BadColor;

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(20)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <p>
              Total damage attributed to the <strong>Unseen Predator</strong> apex talent.
            </p>
            <p style={{ color: fullStrengthColor }}>
              Full-strength <SpellLink spell={SPELLS.FEROCIOUS_BITE} />:{' '}
              <strong>
                {this.fullStrengthFbs} / {this.fbCasts} (
                {formatPercentage(this.fullStrengthFbRate, 1)}%)
              </strong>
              <div>
                <small>
                  Sub-max FBs (less than 5 CPs or less than the full extra energy drain) trigger
                  reduced-damage Unseen Attacks.
                </small>
              </div>
            </p>
          </>
        }
      >
        <TalentSpellText talent={TALENTS_DRUID.UNSEEN_PREDATOR_1_FERAL_TALENT}>
          <ItemPercentDamageDone amount={this.totalDamage} />
        </TalentSpellText>
        <div className="pad" style={{ paddingTop: 0 }}>
          <small>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {this.breakdownRows.map((row, i) => (
                  <tr key={i}>
                    <td style={{ textAlign: 'left', padding: '1px 0' }}>{row.label}</td>
                    <td style={{ textAlign: 'right', padding: '1px 0' }}>
                      {formatPercentage(this.owner.getPercentageOfTotalDamageDone(row.damage), 2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </small>
        </div>
      </Statistic>
    );
  }
}

interface BreakdownRow {
  label: ReactNode;
  damage: number;
}

export default UnseenPredator;
