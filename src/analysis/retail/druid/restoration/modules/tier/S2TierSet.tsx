import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { TIERS } from 'game/TIERS';
import SPELLS from 'common/SPELLS';
import Events, { ApplyBuffEvent, ApplyBuffStackEvent, HealEvent } from 'parser/core/Events';
import { calculateEffectiveHealing, calculateOverhealing } from 'parser/core/EventCalculateLib';
import Statistic from 'parser/ui/Statistic';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { formatOverhealing } from 'analysis/retail/druid/restoration/format';
import { formatNumber } from 'common/format';
import SpellLink from 'interface/SpellLink';
import { DRUID_MID2_ID } from 'common/ITEMS';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import BoringItemSetValueText from 'parser/ui/BoringItemSetValueText';
import { GENESIS_BUFFED_HOTS } from 'analysis/retail/druid/restoration/constants';
import { isGenesisFromTierCooldown } from 'analysis/retail/druid/restoration/normalizers/CastLinkNormalizer';

const GENESIS_HEALING_INCREASE = 0.15;
/** With the 4pc, each Genesis application lasts 12s (8s base + 4s from the 4pc). */
const GENESIS_DURATION_MS = 12_000;
/** The base (2pc) portion of a Genesis application. Healing during the final 4s of a
 *  Rejuvenation-granted stack is attributed to the 4pc duration extension. */
const GENESIS_TWO_PIECE_DURATION_MS = 8_000;

/** A single Genesis application, tracked so overlapping stacks can be attributed individually. */
interface GenesisStack {
  start: number;
  /** granted by a 4pc empowering cast (NS / Tranq / Incarn / Convoke) rather than a Rejuv proc */
  fromTierCooldown: boolean;
  /** applied before the pull - always counts fully towards the 2pc */
  prepull: boolean;
}

/**
 * Restoration Druid Season 2 tier set.
 *
 * 2pc: Rejuvenation has a 15% chance to grant Genesis, causing all your heal over time effects to
 *      heal for 15% more for 8 sec. Multiple applications may overlap.
 * 4pc: Nature's Swiftness, Tranquility, and Incarnation: Tree of Life / Convoke the Spirits have a
 *      100% chance to grant Genesis, and Genesis duration is increased by 4 sec.
 *
 * The bonus healing is measured directly from active Genesis stacks. When the 4pc is equipped the
 * total is split into a 2pc and 4pc share:
 *  - 4pc = all healing from stacks granted by the empowering casts (full duration), plus the healing
 *    that occurs during the final 4s of each Rejuvenation-granted stack (the duration extension).
 *  - 2pc = the remaining healing (Rejuvenation-granted stacks during their first 8s, and any pre-pull
 *    stacks which always count fully towards the 2pc).
 */
class S2TierSet extends Analyzer {
  twoPieceHealing = 0;
  twoPieceOverhealing = 0;
  fourPieceHealing = 0;
  fourPieceOverhealing = 0;
  totalGenesisStackSamples = 0;
  genesisStackSampleCount = 0;
  hasFourPiece = false;

  /** Active Genesis applications, in application order (oldest first). Expired entries are pruned. */
  private genesisStacks: GenesisStack[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.has2PieceByTier(TIERS.MID2);
    this.hasFourPiece = this.selectedCombatant.has4PieceByTier(TIERS.MID2);

    if (this.hasFourPiece) {
      this.addEventListener(
        Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.RESTO_DRUID_TIER_36_GENESIS_BUFF),
        this.onGenesisApply,
      );
      this.addEventListener(
        Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.RESTO_DRUID_TIER_36_GENESIS_BUFF),
        this.onGenesisApply,
      );
    }

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(GENESIS_BUFFED_HOTS),
      this.onHotHeal,
    );
  }

  private onGenesisApply(event: ApplyBuffEvent | ApplyBuffStackEvent) {
    this.genesisStacks.push({
      start: event.timestamp,
      fromTierCooldown: isGenesisFromTierCooldown(event),
      prepull: Boolean(event.prepull),
    });
  }

  private onHotHeal(event: HealEvent) {
    const totalGenesisStacks = this.selectedCombatant.getBuffStacks(
      SPELLS.RESTO_DRUID_TIER_36_GENESIS_BUFF.id,
      event.timestamp,
    );

    if (totalGenesisStacks <= 0) {
      return;
    }

    this.totalGenesisStackSamples += totalGenesisStacks;
    this.genesisStackSampleCount += 1;

    const effectiveHealing = calculateEffectiveHealing(
      event,
      GENESIS_HEALING_INCREASE * totalGenesisStacks,
    );
    const overhealing = calculateOverhealing(event, GENESIS_HEALING_INCREASE * totalGenesisStacks);

    if (!this.hasFourPiece) {
      // 2pc only: all Genesis healing is 2pc (and the buff lasts 8s, so no stack modelling needed).
      this.twoPieceHealing += effectiveHealing;
      this.twoPieceOverhealing += overhealing;
      return;
    }

    const fourPieceFraction = this.getFourPieceFraction(event.timestamp, totalGenesisStacks);
    this.fourPieceHealing += effectiveHealing * fourPieceFraction;
    this.fourPieceOverhealing += overhealing * fourPieceFraction;
    this.twoPieceHealing += effectiveHealing * (1 - fourPieceFraction);
    this.twoPieceOverhealing += overhealing * (1 - fourPieceFraction);
  }

  /**
   * Determines what fraction of this heal's Genesis bonus should be credited to the 4pc, by
   * classifying each active stack. Any stacks not present in our model (e.g. pre-pull stacks that
   * never produced an application event) default to the 2pc.
   */
  private getFourPieceFraction(timestamp: number, totalGenesisStacks: number): number {
    this.pruneExpiredStacks(timestamp);

    const activeStacks = this.genesisStacks
      .filter((stack) => timestamp < stack.start + GENESIS_DURATION_MS)
      // keep the most recently applied stacks if our model has more than the log reports
      .sort((a, b) => b.start - a.start)
      .slice(0, totalGenesisStacks);

    let fourPieceStacks = 0;
    for (const stack of activeStacks) {
      if (stack.prepull) {
        // pre-pull stacks always count fully towards the 2pc
        continue;
      }
      if (stack.fromTierCooldown) {
        fourPieceStacks += 1;
        continue;
      }
      // Rejuvenation proc: healing after the base 8s duration is the 4pc extension
      if (timestamp - stack.start > GENESIS_TWO_PIECE_DURATION_MS) {
        fourPieceStacks += 1;
      }
    }

    return fourPieceStacks / totalGenesisStacks;
  }

  private pruneExpiredStacks(timestamp: number) {
    while (
      this.genesisStacks.length > 0 &&
      this.genesisStacks[0].start + GENESIS_DURATION_MS <= timestamp
    ) {
      this.genesisStacks.shift();
    }
  }

  private get averageGenesisStacks() {
    if (this.genesisStackSampleCount === 0) {
      return 0;
    }

    return this.totalGenesisStackSamples / this.genesisStackSampleCount;
  }

  private get totalHealing() {
    return this.twoPieceHealing + this.fourPieceHealing;
  }

  private get totalOverhealing() {
    return this.twoPieceOverhealing + this.fourPieceOverhealing;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(1)}
        category={STATISTIC_CATEGORY.ITEMS}
        size="flexible"
        tooltip={
          <>
            <SpellLink spell={SPELLS.RESTO_DRUID_TIER_36_GENESIS_BUFF} /> bonus healing:
            <br />
            <strong>Total: {formatNumber(this.totalHealing)}</strong>
            <br />
            <strong>Avg Genesis stacks: {this.averageGenesisStacks.toFixed(2)}</strong>
            <br />
            <strong>
              Overhealing: {formatOverhealing(this.totalOverhealing, this.totalHealing)}
            </strong>
            {this.hasFourPiece && (
              <>
                <br />
                <br />
                <strong>2pc: {formatNumber(this.twoPieceHealing)}</strong>
                <br />
                <strong>4pc: {formatNumber(this.fourPieceHealing)}</strong>
                <br />
                <br />
                The 4pc grants additional{' '}
                <SpellLink spell={SPELLS.RESTO_DRUID_TIER_36_GENESIS_BUFF} /> stacks from{' '}
                <SpellLink spell={SPELLS.NATURES_SWIFTNESS} />,{' '}
                <SpellLink spell={SPELLS.TRANQUILITY_CAST} />, and Incarnation / Convoke, and
                extends Genesis duration by 4 sec. The 4pc value is all healing from those granted
                stacks plus the healing during the final 4 sec of each Rejuvenation-granted stack.
                Pre-pull stacks always count fully towards the 2pc.
              </>
            )}
          </>
        }
      >
        <BoringItemSetValueText setId={DRUID_MID2_ID} title="Restoration Season 2 Tier Set">
          {this.hasFourPiece ? (
            <>
              2pc:
              <br />
              <ItemHealingDone amount={this.twoPieceHealing} />
              <hr />
              4pc:
              <br />
              <ItemHealingDone amount={this.fourPieceHealing} />
            </>
          ) : (
            <>
              2pc:
              <br />
              <ItemHealingDone amount={this.twoPieceHealing} />
            </>
          )}
        </BoringItemSetValueText>
      </Statistic>
    );
  }
}

export default S2TierSet;
