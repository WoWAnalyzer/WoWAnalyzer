import type { JSX } from 'react';
import { formatDurationMillisMinSec } from 'common/format';
import SPELLS from 'common/SPELLS/shaman';
import Spell from 'common/SPELLS/Spell';
import TALENTS from 'common/TALENTS/shaman';
import { SHAMAN_MID2_ID } from 'common/ITEMS';
import { TIERS } from 'game/TIERS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import { SpellbookAbility } from 'parser/core/modules/Ability';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import { addInefficientCastReason } from 'parser/core/EventMetaLib';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import ItemSetBonus from 'parser/ui/ItemSetBonus';
import ItemSetBonuses from 'parser/ui/ItemSetBonuses';
import SpellLink from 'interface/SpellLink';
import SpellUsable from '../core/SpellUsable';
import Abilities from '../Abilities';
import Enemies from 'parser/shared/modules/Enemies';
import { MID2_SET_TITLE } from 'analysis/retail/shaman/shared/constants';
import { UptimeIcon } from 'interface/icons';
import { ExplanationAndDataSubSection } from 'interface/guide/components/ExplanationRow';
import { StartAlignedRoundedPanel } from 'interface/guide/components/GuideDivs';

const SINGLE_TARGET_AMP = 2.0;
const CDR_PER_TRIGGER_MS = 2000;
const TRIGGER_BUFFER_MS = 100;

const ROTATIONAL_CATEGORIES: SpellbookAbility['category'][] = [
  SPELL_CATEGORY.ROTATIONAL,
  SPELL_CATEGORY.ROTATIONAL_AOE,
];

interface HoldSummary {
  total: number;
  average: number;
  minimum: number;
  maximum: number;
}

/**
 * 2-piece: Voltaic Blaze causes your primary target to erupt in a Fire Nova every 2 sec for 6 sec.
 *          Fire Nova deals 200% increased damage to the primary target of your Voltaic Blaze.
 * 4-piece: Fire Nova reduces the cooldown of Crash Lightning by 2.0 sec and increases the
 *          damage of your next Crash Lightning by 8%, stacking up to 5 times.
 */
class S2TierSet extends Analyzer.withDependencies({
  spellUsable: SpellUsable,
  enemies: Enemies,
  abilities: Abilities,
}) {
  private readonly has2Piece: boolean;
  private readonly has4Piece: boolean;
  private readonly hasVoltaicBlaze: boolean;
  private readonly hasCrashLightning: boolean;

  // 4-piece
  private effectiveCDR = 0;
  private wastedCDR = 0;
  private fireNovaDamage = 0;

  private lastFireNova: number | null = null;

  private readonly voltaicBlazeHolds: number[] = [];
  private readonly crashLightningHolds: number[] = [];

  private voltaicBlazeMissedCasts = 0;
  private crashLightningMissedCasts = 0;

  private lastVoltaicBlazeMiss: number | null = null;
  private lastCrashLightningMiss: number | null = null;

  constructor(options: Options) {
    super(options);
    this.has2Piece = this.selectedCombatant.has2PieceByTier(TIERS.MID2);
    this.has4Piece = this.selectedCombatant.has4PieceByTier(TIERS.MID2);
    this.hasVoltaicBlaze = this.selectedCombatant.hasTalent(TALENTS.VOLTAIC_BLAZE_TALENT);
    this.hasCrashLightning = this.selectedCombatant.hasTalent(TALENTS.CRASH_LIGHTNING_TALENT);
    this.active = this.has2Piece || this.has4Piece;
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FIRE_NOVA_DAMAGE),
      this.onFireNovaDamage,
    );

    if (this.has4Piece) {
      this.addEventListener(
        Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FIRE_NOVA_DAMAGE),
        this.onFireNovaPulse,
      );
    }

    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);

    if (this.hasCrashLightning) {
      this.addEventListener(
        Events.cast.by(SELECTED_PLAYER).spell(TALENTS.CRASH_LIGHTNING_TALENT),
        this.onCrashLightningCast,
      );
    }

    if (this.hasVoltaicBlaze) {
      this.addEventListener(
        Events.cast.by(SELECTED_PLAYER).spell(SPELLS.VOLTAIC_BLAZE_CAST),
        this.onVoltaicBlazeCast,
      );
    }
  }

  onFireNovaDamage(event: DamageEvent) {
    if (this.deps.enemies.getById(event.targetID)?.hasBuff(SPELLS.MIDNIGHT_S2_BURNING_CORE)) {
      this.fireNovaDamage += calculateEffectiveDamage(event, SINGLE_TARGET_AMP);
    }
  }

  onFireNovaPulse(event: DamageEvent) {
    // Debounce CDR, only applied once per pulse regardless of target count
    if ((this.lastFireNova ?? 0) + TRIGGER_BUFFER_MS > event.timestamp) {
      return;
    }
    this.lastFireNova = event.timestamp;

    const effectiveCdr = this.deps.spellUsable.reduceCooldown(
      TALENTS.CRASH_LIGHTNING_TALENT.id,
      CDR_PER_TRIGGER_MS,
    );
    const wastedCdr = CDR_PER_TRIGGER_MS - effectiveCdr;

    this.effectiveCDR += effectiveCdr;
    this.wastedCDR += wastedCdr;
  }

  private onCast(event: CastEvent) {
    if (!event.globalCooldown || event.ability.guid === SPELLS.VOLTAIC_BLAZE_CAST.id) {
      return;
    }

    const ability = this.deps.abilities.getAbility(event.ability.guid) as unknown as
      | SpellbookAbility
      | undefined;

    if (ability && !ROTATIONAL_CATEGORIES.includes(ability.category)) {
      return;
    }

    if (this.hasVoltaicBlaze && this.deps.spellUsable.isAvailable(SPELLS.VOLTAIC_BLAZE_CAST.id)) {
      addInefficientCastReason(
        event,
        <>
          <SpellLink spell={SPELLS.VOLTAIC_BLAZE_CAST} /> was available and is a higher priority
          cast.
        </>,
      );
      this.voltaicBlazeMissedCasts += 1;
      this.lastVoltaicBlazeMiss = event.timestamp;
      return;
    }

    if (
      this.hasCrashLightning &&
      this.deps.spellUsable.isAvailable(TALENTS.CRASH_LIGHTNING_TALENT.id) &&
      event.ability.guid !== TALENTS.CRASH_LIGHTNING_TALENT.id
    ) {
      addInefficientCastReason(
        event,
        <>
          <SpellLink spell={TALENTS.CRASH_LIGHTNING_TALENT} /> was available and is a higher
          priority cast.
        </>,
      );
      this.crashLightningMissedCasts += 1;
      this.lastCrashLightningMiss = event.timestamp;
    }
  }

  private onVoltaicBlazeCast(event: CastEvent) {
    const availableSince = this.cooldownAvailableSince(
      SPELLS.VOLTAIC_BLAZE_CAST.id,
      event.timestamp,
    );
    if (availableSince !== null && this.wasHeld(this.lastVoltaicBlazeMiss, availableSince)) {
      this.voltaicBlazeHolds.push(event.timestamp - availableSince);
    }
  }

  private onCrashLightningCast(event: CastEvent) {
    const availableSince =
      this.cooldownAvailableSince(TALENTS.CRASH_LIGHTNING_TALENT.id, event.timestamp) ??
      this.selectedCombatant.getBuff(SPELLS.STORM_UNLEASHED_BUFF.id, event.timestamp)?.start ??
      null;

    if (availableSince !== null && this.wasHeld(this.lastCrashLightningMiss, availableSince)) {
      this.crashLightningHolds.push(event.timestamp - availableSince);
    }
  }

  private wasHeld(lastMiss: number | null, availableSince: number): boolean {
    return lastMiss !== null && lastMiss >= availableSince;
  }

  private cooldownAvailableSince(spellId: number, timestamp: number): number | null {
    const cooldownState = this.deps.spellUsable.history(spellId).getBefore(timestamp, true);

    if (!cooldownState) {
      return this.owner.fight.start_time;
    }

    return cooldownState.isAvailable ? cooldownState.timestamp : null;
  }

  private summariseHolds(holds: number[]): HoldSummary | null {
    if (holds.length === 0) {
      return null;
    }

    const total = holds.reduce((sum, hold) => sum + hold, 0);

    return {
      total,
      average: total / holds.length,
      minimum: Math.min(...holds),
      maximum: Math.max(...holds),
    };
  }

  private buildHoldPanel(
    spell: Spell,
    summary: HoldSummary | null,
    missedCasts: number,
    additionalStat?: JSX.Element,
  ): JSX.Element {
    return (
      <StartAlignedRoundedPanel key={spell.id}>
        <strong>
          <SpellLink spell={spell} /> Hold Time
        </strong>
        <div style={{ display: 'flex', justifyContent: 'space-evenly', fontSize: '20px' }}>
          {summary && (
            <>
              <div>
                {formatDurationMillisMinSec(summary.average, 1)} <small>average</small>
              </div>
              <div>
                {formatDurationMillisMinSec(summary.minimum, 1)} <small>shortest</small>
              </div>
              <div>
                {formatDurationMillisMinSec(summary.maximum, 1)} <small>longest</small>
              </div>
            </>
          )}
          <div>
            {missedCasts} <small>casts delayed</small>
          </div>
          {additionalStat}
        </div>
        {!summary && (
          <small>
            No hold time recorded for <SpellLink spell={spell} />.
          </small>
        )}
      </StartAlignedRoundedPanel>
    );
  }

  private description(): JSX.Element {
    const vb = <SpellLink spell={SPELLS.VOLTAIC_BLAZE_CAST} />;
    const cl = <SpellLink spell={TALENTS.CRASH_LIGHTNING_TALENT} />;

    return (
      <>
        <p>
          The Season 2 tier set significantly increases the priority of {vb} and {cl}, they should
          be cast as soon as they are available.
        </p>
        <p>
          Even short delays before casting {cl} can quickly add up to a large number of lost casts
          over a fight. Holding {vb} can similarly lead to many missed {cl} opportunities due to the
          2-piece bonus's cooldown reduction from <SpellLink spell={TALENTS.FIRE_NOVA_TALENT} />.
        </p>
      </>
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
      >
        <ItemSetBonuses setId={SHAMAN_MID2_ID} title={MID2_SET_TITLE}>
          <ItemSetBonus
            pieces={2}
            label={
              <>
                <SpellLink spell={SPELLS.FIRE_NOVA_DAMAGE} /> bonus
              </>
            }
          >
            <ItemDamageDone amount={this.fireNovaDamage} />
          </ItemSetBonus>
          {this.has4Piece && (
            <>
              <hr />
              <ItemSetBonus
                pieces={4}
                label={
                  <>
                    <SpellLink spell={TALENTS.CRASH_LIGHTNING_TALENT} /> bonus
                  </>
                }
              >
                <UptimeIcon /> {(this.effectiveCDR / 1000).toFixed(1)} sec <small>CDR</small>
              </ItemSetBonus>
            </>
          )}
        </ItemSetBonuses>
      </Statistic>
    );
  }

  get guideSubsection(): JSX.Element | null {
    if (!this.active) {
      return null;
    }

    const vbSummary = this.summariseHolds(this.voltaicBlazeHolds);
    const clSummary = this.summariseHolds(this.crashLightningHolds);

    return (
      <ExplanationAndDataSubSection
        title={MID2_SET_TITLE}
        explanation={this.description()}
        data={
          <div style={{ display: 'grid', gap: '1em', alignSelf: 'start' }}>
            {this.hasVoltaicBlaze
              ? this.buildHoldPanel(
                  SPELLS.VOLTAIC_BLAZE_CAST,
                  vbSummary,
                  this.voltaicBlazeMissedCasts,
                  <div>
                    {formatDurationMillisMinSec(vbSummary?.total ?? 0, 1)}{' '}
                    <small>cumulative delay</small>
                  </div>,
                )
              : null}
            {this.hasCrashLightning
              ? this.buildHoldPanel(
                  TALENTS.CRASH_LIGHTNING_TALENT,
                  clSummary,
                  this.crashLightningMissedCasts,
                  this.has4Piece ? (
                    <div>
                      {formatDurationMillisMinSec(clSummary?.total ?? 0, 1)}{' '}
                      <small>wasted CDR</small>
                    </div>
                  ) : undefined,
                )
              : null}
          </div>
        }
      />
    );
  }
}

export default S2TierSet;
