import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { TIERS } from 'game/TIERS';
import SPELLS from 'common/SPELLS';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Statistic from 'parser/ui/Statistic';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { formatNumber } from 'common/format';
import SpellLink from 'interface/SpellLink';
import { DRUID_MID1_ID } from 'common/ITEMS';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import BoringItemSetValueText from 'parser/ui/BoringItemSetValueText';
import ItemCooldownReduction from 'parser/ui/ItemCooldownReduction';
import ItemManaGained from 'parser/ui/ItemManaGained';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import SpellUsable from 'parser/shared/modules/SpellUsable';

const TWO_PIECE_HEALING_INCREASE = 0.25;
const FOUR_PIECE_CDR = 2000; // ms
const FOUR_PIECE_MANA_REDUCTION = 0.1;

class S1TierSet extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  twoPieceHealing = 0;
  fourPieceEffectiveCDR = 0;
  fourPieceWastedCDR = 0;
  fourPieceManaReduction = 0;
  fourPieceWildGrowthCasts = 0;
  private previousWildGrowthCastTimestamp: number | null = null;
  hasFourPiece = false;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.has2PieceByTier(TIERS.MID1);
    this.hasFourPiece = this.selectedCombatant.has4PieceByTier(TIERS.MID1);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.WILD_GROWTH), this.onHeal);

    if (this.hasFourPiece) {
      this.addEventListener(
        Events.cast.by(SELECTED_PLAYER).spell(SPELLS.WILD_GROWTH),
        this.onWildGrowthCast,
      );
    }
  }

  onHeal(event: HealEvent) {
    this.twoPieceHealing += calculateEffectiveHealing(event, TWO_PIECE_HEALING_INCREASE);
  }

  onWildGrowthCast(event: CastEvent) {
    this.fourPieceWildGrowthCasts += 1;

    if (this.previousWildGrowthCastTimestamp !== null) {
      const fullCooldownMs = this.spellUsable.fullCooldownDuration(SPELLS.WILD_GROWTH.id) || 9000;
      const castWithoutTierTimestamp = this.previousWildGrowthCastTimestamp + fullCooldownMs;

      const effectiveCdr = Math.max(
        0,
        Math.min(FOUR_PIECE_CDR, castWithoutTierTimestamp - event.timestamp),
      );

      this.fourPieceEffectiveCDR += effectiveCdr;
      this.fourPieceWastedCDR += FOUR_PIECE_CDR - effectiveCdr;
    }

    this.previousWildGrowthCastTimestamp = event.timestamp;

    const rawManaCost = event.rawResourceCost?.[RESOURCE_TYPES.MANA.id] ?? 0;
    this.fourPieceManaReduction += rawManaCost * FOUR_PIECE_MANA_REDUCTION;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(1)}
        category={STATISTIC_CATEGORY.ITEMS}
        size="flexible"
        tooltip={
          <>
            <strong>2pc Healing: {formatNumber(this.twoPieceHealing)}</strong>
            <br />
            {this.hasFourPiece && (
              <>
                <strong>4pc Wild Growth casts: {this.fourPieceWildGrowthCasts}</strong>
                <br />
                <SpellLink spell={SPELLS.WILD_GROWTH} /> cooldown reduced by{' '}
                {formatNumber(this.fourPieceEffectiveCDR / 1000)}s total, with{' '}
                {formatNumber(this.fourPieceWastedCDR / 1000)}s wasted.
                <br />
                <SpellLink spell={SPELLS.WILD_GROWTH} /> mana cost reduced by{' '}
                {formatNumber(this.fourPieceManaReduction)} total.
              </>
            )}
          </>
        }
      >
        <BoringItemSetValueText setId={DRUID_MID1_ID} title="Restoration Season 1 Tier Set">
          2pc:
          <br />
          <ItemHealingDone amount={this.twoPieceHealing} />
          {this.hasFourPiece && (
            <>
              <hr />
              4pc:
              <br />
              <ItemCooldownReduction
                effective={this.fourPieceEffectiveCDR}
                waste={this.fourPieceWastedCDR}
              />
              <br />
              <ItemManaGained amount={this.fourPieceManaReduction} useAbbrev />
            </>
          )}
        </BoringItemSetValueText>
      </Statistic>
    );
  }
}

export default S1TierSet;
