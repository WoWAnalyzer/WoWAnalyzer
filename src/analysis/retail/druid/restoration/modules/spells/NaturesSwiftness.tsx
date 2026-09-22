import type { JSX, ReactNode } from 'react';
import { Fragment } from 'react';
import SPELLS from 'common/SPELLS';
import type Spell from 'common/SPELLS/Spell';
import { maybeGetTalentOrSpell } from 'common/maybeGetTalentOrSpell';
import { SpellLink } from 'interface';
import { qualitativePerformanceToColor } from 'interface/guide';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import CastDetail, { type PerCastData } from 'interface/guide/components/CastDetail';
import { SpellSequence, type CastInSequence } from 'interface/guide/components/CastSequence';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, RemoveBuffEvent } from 'parser/core/Events';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import { TALENTS_DRUID } from 'common/TALENTS';
import { TIERS } from 'game/TIERS';

import Abilities from '../Abilities';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';

/** Spells that can consume Nature's Swiftness (Nature spells with a base cast time) */
const NS_CONSUMABLE_SPELLS: Spell[] = [
  SPELLS.REGROWTH,
  SPELLS.REBIRTH,
  SPELLS.WRATH,
  SPELLS.STARFIRE,
  SPELLS.ENTANGLING_ROOTS,
  SPELLS.CYCLONE,
  SPELLS.HIBERNATE,
  SPELLS.NOURISH,
];

const HEALING_COOLDOWN_SPELLS: Spell[] = [SPELLS.CONVOKE_SPIRITS, SPELLS.TRANQUILITY_CAST];

/** Combat log often emits NS removebuff before the consuming cast; allow a short window. */
const NS_CONSUME_BUFFER_MS = 200;

interface NsCastRecord {
  timestamp: number;
  /** Resolved once the buff is spent or wasted */
  performance: QualitativePerformance;
  /** Spell that consumed NS; null if expired / unused */
  consumedSpell: Spell | null;
  /**
   * S2 4pc only: NS immediately before Convoke/Tranq, or the next global after Tranq
   */
  linedUpWithCooldown: boolean;
  cooldownSpellId?: number;
}

/**
 * Guide analysis for Nature's Swiftness: cast efficiency, what the buff was spent on,
 * and (with Season 2 4pc) lining Genesis up with Convoke / Tranquility.
 */
class NaturesSwiftness extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };

  protected abilities!: Abilities;

  hasFourPiece: boolean;
  hasConvoke: boolean;
  hasTranquility: boolean;
  hasOvergrowth: boolean;
  hasNaturesBounty: boolean;
  hasPhotosynthesis: boolean;

  casts: NsCastRecord[] = [];
  /** Index of an NS press whose consume is not yet resolved */
  private pendingConsumeIndex: number | null = null;
  /**
   * Timestamp of the pending NS buff's removebuff, if it already fired.
   * Used when removebuff is logged before the consuming cast.
   */
  private pendingNsRemovedAt: number | null = null;
  /** Index awaiting Convoke/Tranq as the next GCD after NS (4pc Genesis alignment) */
  private pendingPreCdIndex: number | null = null;
  /** After Tranq, the next NS (with no intervening GCD) also lines up Genesis */
  private pendingNsAfterTranq = false;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.NATURES_SWIFTNESS_TALENT);
    this.hasFourPiece = this.selectedCombatant.has4PieceByTier(TIERS.MID2);
    this.hasConvoke = this.selectedCombatant.hasTalent(TALENTS_DRUID.CONVOKE_THE_SPIRITS_TALENT);
    this.hasTranquility = this.selectedCombatant.hasTalent(TALENTS_DRUID.TRANQUILITY_TALENT);
    this.hasOvergrowth = this.selectedCombatant.hasTalent(TALENTS_DRUID.OVERGROWTH_TALENT);
    this.hasNaturesBounty = this.selectedCombatant.hasTalent(TALENTS_DRUID.NATURES_BOUNTY_TALENT);
    this.hasPhotosynthesis = this.selectedCombatant.hasTalent(TALENTS_DRUID.PHOTOSYNTHESIS_TALENT);

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.NATURES_SWIFTNESS),
      this.onNsCast,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.NATURES_SWIFTNESS),
      this.onNsRemove,
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onPlayerCast);
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  private get tracksCooldownSync(): boolean {
    return this.hasFourPiece && (this.hasConvoke || this.hasTranquility);
  }

  private isHealingCooldown(spellId: number): boolean {
    return HEALING_COOLDOWN_SPELLS.some((spell) => spell.id === spellId);
  }

  private isConsumable(spellId: number): boolean {
    return NS_CONSUMABLE_SPELLS.some((spell) => spell.id === spellId);
  }

  /** True when this cast uses a GCD (off-GCD utilities do not break CD sync) */
  private isGcdCast(spellId: number): boolean {
    const ability = this.abilities.getAbility(spellId);
    return ability?.gcd != null;
  }

  private spellFromId(spellId: number): Spell {
    return (
      NS_CONSUMABLE_SPELLS.find((s) => s.id === spellId) ??
      HEALING_COOLDOWN_SPELLS.find((s) => s.id === spellId) ??
      maybeGetTalentOrSpell(spellId) ?? {
        id: spellId,
        name: 'Unknown',
        icon: 'inv_misc_questionmark',
      }
    );
  }

  onNsCast(event: CastEvent) {
    const cast: NsCastRecord = {
      timestamp: event.timestamp,
      performance: QualitativePerformance.Fail,
      consumedSpell: null,
      linedUpWithCooldown: false,
    };
    this.casts.push(cast);
    this.pendingConsumeIndex = this.casts.length - 1;
    this.pendingNsRemovedAt = null;

    if (!this.tracksCooldownSync) {
      return;
    }

    // Tranq → NS (next global) also counts as lined up
    if (this.pendingNsAfterTranq) {
      cast.linedUpWithCooldown = true;
      cast.cooldownSpellId = SPELLS.TRANQUILITY_CAST.id;
      this.pendingNsAfterTranq = false;
      return;
    }

    // Otherwise wait to see if Convoke/Tranq is the next GCD
    this.pendingPreCdIndex = this.casts.length - 1;
  }

  onPlayerCast(event: CastEvent) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.NATURES_SWIFTNESS.id) {
      return;
    }

    // S2 4pc: Genesis procs on the NS press
    if (this.pendingPreCdIndex !== null) {
      if (this.isHealingCooldown(spellId)) {
        const cast = this.casts[this.pendingPreCdIndex];
        cast.linedUpWithCooldown = true;
        cast.cooldownSpellId = spellId;
        this.pendingPreCdIndex = null;
        this.rescore(cast);
      } else if (this.isConsumable(spellId) || this.isGcdCast(spellId)) {
        // Intervening GCD between NS and CD — not lined up beforehand
        this.casts[this.pendingPreCdIndex].linedUpWithCooldown = false;
        this.pendingPreCdIndex = null;
      }
    }

    // After Tranq, NS must be the next action (no intervening GCD) to count as lined up
    if (spellId === SPELLS.TRANQUILITY_CAST.id && this.tracksCooldownSync) {
      this.pendingNsAfterTranq = true;
    } else if (
      this.pendingNsAfterTranq &&
      (this.isConsumable(spellId) || this.isGcdCast(spellId))
    ) {
      this.pendingNsAfterTranq = false;
    }

    if (this.pendingConsumeIndex === null) {
      return;
    }

    if (this.isConsumable(spellId) && this.canAttributeConsume(event.timestamp)) {
      this.resolveConsume(this.pendingConsumeIndex, spellId);
      this.pendingConsumeIndex = null;
      this.pendingNsRemovedAt = null;
      return;
    }

    // Buff already removed and this cast is outside the consume window → wasted
    if (
      this.pendingNsRemovedAt !== null &&
      event.timestamp - this.pendingNsRemovedAt > NS_CONSUME_BUFFER_MS
    ) {
      this.markPendingWasted();
    }
  }

  private canAttributeConsume(timestamp: number): boolean {
    if (
      this.selectedCombatant.hasBuff(SPELLS.NATURES_SWIFTNESS.id, timestamp, NS_CONSUME_BUFFER_MS)
    ) {
      return true;
    }
    // removebuff logged before the consuming cast
    return (
      this.pendingNsRemovedAt !== null &&
      timestamp - this.pendingNsRemovedAt <= NS_CONSUME_BUFFER_MS
    );
  }

  private markPendingWasted() {
    if (this.pendingConsumeIndex === null) {
      return;
    }
    const cast = this.casts[this.pendingConsumeIndex];
    cast.consumedSpell = null;
    this.rescore(cast);
    this.pendingConsumeIndex = null;
    this.pendingNsRemovedAt = null;
  }

  onNsRemove(event: RemoveBuffEvent) {
    if (this.pendingConsumeIndex === null) {
      return;
    }
    // Do not finalize waste yet — the consuming cast is often logged after removebuff.
    this.pendingNsRemovedAt = event.timestamp;
  }

  onFightEnd() {
    if (this.pendingConsumeIndex !== null) {
      this.markPendingWasted();
    }
    if (this.pendingPreCdIndex !== null) {
      this.casts[this.pendingPreCdIndex].linedUpWithCooldown = false;
      this.rescore(this.casts[this.pendingPreCdIndex]);
      this.pendingPreCdIndex = null;
    }
    this.pendingNsAfterTranq = false;
  }

  private resolveConsume(index: number, spellId: number) {
    const cast = this.casts[index];
    cast.consumedSpell = this.spellFromId(spellId);
    this.rescore(cast);
  }

  /**
   * Regrowth = Good, Rebirth = Ok, other/expired = Bad.
   * With S2 4pc, lining up with Convoke/Tranq upgrades to Perfect.
   */
  private rescore(cast: NsCastRecord) {
    if (!cast.consumedSpell) {
      cast.performance = QualitativePerformance.Fail;
      return;
    }
    if (cast.consumedSpell.id === SPELLS.REGROWTH.id) {
      cast.performance = QualitativePerformance.Good;
    } else if (cast.consumedSpell.id === SPELLS.REBIRTH.id) {
      cast.performance = QualitativePerformance.Ok;
    } else {
      cast.performance = QualitativePerformance.Fail;
      return;
    }

    if (this.tracksCooldownSync && cast.linedUpWithCooldown) {
      cast.performance = QualitativePerformance.Perfect;
    }
  }

  private get possiblePerformances(): QualitativePerformance[] {
    const grades = [
      QualitativePerformance.Good,
      QualitativePerformance.Ok,
      QualitativePerformance.Fail,
    ];
    if (this.tracksCooldownSync) {
      grades.unshift(QualitativePerformance.Perfect);
    }
    return grades;
  }

  private spellToSequenceCast(
    spell: Spell,
    timestamp: number,
    performance: QualitativePerformance | undefined,
    tooltip: ReactNode,
    ghosted = false,
  ): CastInSequence {
    return {
      timestamp,
      spellId: spell.id,
      spellName: spell.name,
      icon: spell.icon,
      performance,
      tooltip,
      ghosted,
    };
  }

  private buildSequence(cast: NsCastRecord): CastInSequence[] {
    const sequence: CastInSequence[] = [
      this.spellToSequenceCast(
        SPELLS.NATURES_SWIFTNESS,
        cast.timestamp,
        cast.performance,
        <>
          <SpellLink spell={SPELLS.NATURES_SWIFTNESS} />
        </>,
      ),
    ];

    if (cast.consumedSpell) {
      const consumePerf =
        cast.consumedSpell.id === SPELLS.REGROWTH.id
          ? QualitativePerformance.Good
          : cast.consumedSpell.id === SPELLS.REBIRTH.id
            ? QualitativePerformance.Ok
            : QualitativePerformance.Fail;
      sequence.push(
        this.spellToSequenceCast(
          cast.consumedSpell,
          cast.timestamp + 1,
          consumePerf,
          this.consumeTooltip(cast),
        ),
      );
    } else {
      sequence.push(
        this.spellToSequenceCast(
          SPELLS.NATURES_SWIFTNESS,
          cast.timestamp + 1,
          QualitativePerformance.Fail,
          <>
            <SpellLink spell={SPELLS.NATURES_SWIFTNESS} /> expired unused
          </>,
          true,
        ),
      );
    }

    if (this.tracksCooldownSync && cast.linedUpWithCooldown && cast.cooldownSpellId) {
      const cdSpell = this.spellFromId(cast.cooldownSpellId);
      const afterTranq = cast.cooldownSpellId === SPELLS.TRANQUILITY_CAST.id;
      sequence.push(
        this.spellToSequenceCast(
          cdSpell,
          cast.timestamp + 2,
          QualitativePerformance.Perfect,
          <>
            Lined up with <SpellLink spell={cdSpell} />
            {afterTranq ? ' (before or after)' : ''} for{' '}
            <SpellLink spell={SPELLS.RESTO_DRUID_TIER_36_GENESIS_BUFF} />
          </>,
        ),
      );
    }

    return sequence;
  }

  private consumeTooltip(cast: NsCastRecord): ReactNode {
    if (!cast.consumedSpell) {
      return (
        <>
          <SpellLink spell={SPELLS.NATURES_SWIFTNESS} /> expired unused
        </>
      );
    }
    if (cast.consumedSpell.id === SPELLS.REGROWTH.id) {
      return (
        <>
          Buffed <SpellLink spell={SPELLS.REGROWTH} />
        </>
      );
    }
    if (cast.consumedSpell.id === SPELLS.REBIRTH.id) {
      return (
        <>
          Buffed <SpellLink spell={SPELLS.REBIRTH} /> (useful for progression, not ideal healing)
        </>
      );
    }
    return (
      <>
        Buffed <SpellLink spell={cast.consumedSpell} />
      </>
    );
  }

  private buildCastDetails(): PerCastData[] {
    return this.casts.map((cast) => {
      const stats = [];
      if (this.tracksCooldownSync) {
        stats.push(
          cast.linedUpWithCooldown
            ? {
                value: 'Yes',
                label: 'CD Sync',
                performance: QualitativePerformance.Perfect,
              }
            : {
                value: 'No',
                label: 'CD Sync',
                ungraded: true,
              },
        );
      }

      return {
        performance: cast.performance,
        timestamp: this.owner.formatTimestamp(cast.timestamp),
        stats,
        tooltip: this.castSummary(cast),
        additionalContent: {
          content: <SpellSequence casts={this.buildSequence(cast)} iconSize={34} />,
        },
        details: this.castSummary(cast),
      };
    });
  }

  private castSummary(cast: NsCastRecord): JSX.Element {
    const parts: ReactNode[] = [this.consumeTooltip(cast)];
    if (this.tracksCooldownSync) {
      parts.push(
        cast.linedUpWithCooldown && cast.cooldownSpellId ? (
          <>
            synced with <SpellLink spell={cast.cooldownSpellId} />
          </>
        ) : (
          <>not synced with Convoke/Tranq</>
        ),
      );
    }

    return (
      <>
        {cast.performance}:{' '}
        {parts.map((part, i) => (
          <Fragment key={i}>
            {i > 0 && <> · </>}
            {part}
          </Fragment>
        ))}
      </>
    );
  }

  private perfBadge(perf: QualitativePerformance): JSX.Element {
    return (
      <span>
        (<span style={{ color: qualitativePerformanceToColor(perf) }}>{perf}</span>)
      </span>
    );
  }

  get guideSubsection(): JSX.Element {
    if (!this.active) {
      return <></>;
    }

    const explanation = (
      <>
        <p>
          <b>
            <SpellLink spell={SPELLS.NATURES_SWIFTNESS} />
          </b>{' '}
          makes your next Nature spell instant and greatly increases the healing of that{' '}
          <SpellLink spell={SPELLS.REGROWTH} />. Spend it on Regrowth{' '}
          {this.perfBadge(QualitativePerformance.Good)}. Using it for{' '}
          <SpellLink spell={SPELLS.REBIRTH} /> {this.perfBadge(QualitativePerformance.Ok)} is
          sometimes the right call for progression, but it is not ideal for healing throughput. Any
          other consumer {this.perfBadge(QualitativePerformance.Fail)}.
        </p>
        {this.hasOvergrowth && (
          <p>
            With <SpellLink spell={TALENTS_DRUID.OVERGROWTH_TALENT} />, self-cast Nature&apos;s
            Swiftness into Regrowth during dangerous or semi-dangerous damage. That refreshes the
            HoTs on yourself
            {this.hasNaturesBounty ? (
              <>
                , splashes a large heal to your other <SpellLink spell={SPELLS.REGROWTH} /> targets
                via <SpellLink spell={TALENTS_DRUID.NATURES_BOUNTY_TALENT} />
              </>
            ) : null}
            {this.hasPhotosynthesis ? (
              <>
                , and procs a lot of <SpellLink spell={TALENTS_DRUID.PHOTOSYNTHESIS_TALENT} /> over
                the next few seconds
              </>
            ) : null}
            .
          </p>
        )}
        {this.tracksCooldownSync && (
          <p>
            With your Season 2 4-piece, casting Nature&apos;s Swiftness grants{' '}
            <SpellLink spell={SPELLS.RESTO_DRUID_TIER_36_GENESIS_BUFF} /> immediately (on the NS
            press, not when the buff is consumed). For{' '}
            {this.hasConvoke && <SpellLink spell={SPELLS.CONVOKE_SPIRITS} />}
            {this.hasConvoke && ', press NS as the global immediately before. '}
            {this.hasTranquility && (
              <>
                For <SpellLink spell={SPELLS.TRANQUILITY_CAST} />, NS either immediately before or
                on the next global after also counts.
              </>
            )}{' '}
            Lining up that way grades the cast {this.perfBadge(QualitativePerformance.Perfect)}.
          </p>
        )}
      </>
    );

    const data = (
      <RoundedPanel>
        <strong>
          <SpellLink spell={SPELLS.NATURES_SWIFTNESS} /> cast efficiency
        </strong>
        <CastEfficiencyBar
          spell={SPELLS.NATURES_SWIFTNESS}
          gapHighlightMode={GapHighlight.FullCooldown}
          minimizeIcons
          useThresholds
        />
        {this.casts.length > 0 && (
          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <CastDetail
              title="Nature's Swiftness Casts"
              casts={this.buildCastDetails()}
              possiblePerformances={this.possiblePerformances}
            />
          </div>
        )}
      </RoundedPanel>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }
}

export default NaturesSwiftness;
