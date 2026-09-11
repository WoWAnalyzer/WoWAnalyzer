import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS/shaman';
import TALENTS from 'common/TALENTS/shaman';
import { SHAMAN_MID2_ID } from 'common/ITEMS';
import { TIERS } from 'game/TIERS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import MaelstromSpenderInfo from '../core/MaelstromSpenderInfo';
import { ManaIcon } from 'interface/icons';
import ItemSetBonus from 'parser/ui/ItemSetBonus';
import ItemSetBonuses from 'parser/ui/ItemSetBonuses';
import ResourceLink from 'interface/ResourceLink';
import { MID2_SET_TITLE } from 'analysis/retail/shaman/shared/constants';
import SpellLink from 'interface/SpellLink';

const TWO_PIECE_AMP = 0.25;
const FOUR_PIECE_AMP = 0.25;

// 2-piece: Earth Shock, Elemental Blast, and Earthquake damage (and their Overloads) increased by 25%.
const TWO_PIECE_DAMAGE_SPELLS = [
  TALENTS.EARTH_SHOCK_TALENT,
  SPELLS.EARTH_SHOCK_OVERLOAD,
  SPELLS.ELEMENTAL_BLAST,
  SPELLS.ELEMENTAL_BLAST_OVERLOAD,
  SPELLS.EARTHQUAKE_DAMAGE,
  SPELLS.EARTHQUAKE_OVERLOAD,
];

// 4-piece: the next 2 Lightning Bolts, Chain Lightnings, or Lava Bursts deal 25% increased damage.
const FOUR_PIECE_DAMAGE_SPELLS = [
  SPELLS.LIGHTNING_BOLT,
  SPELLS.LIGHTNING_BOLT_OVERLOAD,
  TALENTS.CHAIN_LIGHTNING_TALENT,
  SPELLS.CHAIN_LIGHTNING_OVERLOAD,
  SPELLS.LAVA_BURST_DAMAGE,
  SPELLS.LAVA_BURST_OVERLOAD_DAMAGE,
];

// 4-piece: makes the next Earthquake, Earth Shock, or Elemental Blast cost 100% less Maelstrom.
const FOUR_PIECE_FREE_SPENDERS = [
  TALENTS.EARTH_SHOCK_TALENT,
  TALENTS.ELEMENTAL_BLAST_TALENT,
  TALENTS.EARTHQUAKE_1_ELEMENTAL_TALENT,
  TALENTS.EARTHQUAKE_2_ELEMENTAL_TALENT,
];

/**
 * Midnight Season 2 - Elemental tier set.
 *
 * 2-piece: Earth Shock, Elemental Blast, and Earthquake damage increased by 25%.
 * 4-piece: When Stormkeeper or Ascendance fade, your next 2 Lightning Bolts, Chain
 *          Lightnings, or Lava Bursts deal 25% increased damage and cause your next
 *          Earthquake, Earth Shock, or Elemental Blast to cost 100% less Maelstrom.
 */
class S2TierSet extends Analyzer.withDependencies({
  spenderInfo: MaelstromSpenderInfo,
}) {
  private readonly has2Piece: boolean;
  private readonly has4Piece: boolean;

  private twoPieceDamage = 0;
  private fourPieceDamage = 0;
  private maelstromSaved = 0;
  private wastedOverchargeBuffs = 0;

  constructor(options: Options) {
    super(options);
    this.has2Piece = this.selectedCombatant.has2PieceByTier(TIERS.MID2);
    this.has4Piece = this.selectedCombatant.has4PieceByTier(TIERS.MID2);
    this.active = this.has2Piece || this.has4Piece;
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TWO_PIECE_DAMAGE_SPELLS),
      (event) => (this.twoPieceDamage += calculateEffectiveDamage(event, TWO_PIECE_AMP)),
    );

    if (this.has4Piece) {
      this.addEventListener(
        Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.MIDNIGHT_S2_OVERCHARGE),
        () => (this.wastedOverchargeBuffs += 1),
      );
      this.addEventListener(
        Events.damage.by(SELECTED_PLAYER).spell(FOUR_PIECE_DAMAGE_SPELLS),
        this.onFourPieceDamage,
      );
      this.addEventListener(
        Events.cast.by(SELECTED_PLAYER).spell(FOUR_PIECE_FREE_SPENDERS),
        this.onCast,
      );
    }
  }

  onFourPieceDamage(event: DamageEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.MIDNIGHT_S2_FLOWING_ELEMENTS)) {
      this.fourPieceDamage += calculateEffectiveDamage(event, FOUR_PIECE_AMP);
    }
  }

  onCast(event: CastEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.MIDNIGHT_S2_OVERCHARGE)) {
      this.maelstromSaved += this.normalSpenderCost(event.ability.guid);
    }
  }

  normalSpenderCost(spellId: number): number {
    if (spellId === TALENTS.ELEMENTAL_BLAST_TALENT.id) {
      return this.deps.spenderInfo.elementalBlastCost;
    }
    if (this.deps.spenderInfo.isEarthquake(spellId)) {
      return this.deps.spenderInfo.earthquakeCost;
    }
    return this.deps.spenderInfo.earthShockCost;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={
          <>
            <strong>{this.wastedOverchargeBuffs}</strong>{' '}
            <SpellLink spell={SPELLS.MIDNIGHT_S2_OVERCHARGE.id} /> stacks wasted.
          </>
        }
      >
        <ItemSetBonuses setId={SHAMAN_MID2_ID} title={MID2_SET_TITLE}>
          <ItemSetBonus pieces={2}>
            <ItemDamageDone amount={this.twoPieceDamage} />
          </ItemSetBonus>
          {this.has4Piece && (
            <>
              <hr />
              <ItemSetBonus pieces={4}>
                <div>
                  <ItemDamageDone amount={this.fourPieceDamage} />
                </div>
                <div>
                  <ManaIcon />
                  {formatNumber(this.maelstromSaved)}{' '}
                  <small>
                    <ResourceLink id={RESOURCE_TYPES.MAELSTROM.id} /> saved
                  </small>
                </div>
              </ItemSetBonus>
            </>
          )}
        </ItemSetBonuses>
      </Statistic>
    );
  }
}

export default S2TierSet;
