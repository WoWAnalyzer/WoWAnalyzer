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
import ItemSetLink from 'interface/ItemSetLink';
import ResourceLink from 'interface/ResourceLink';
import SpellLink from 'interface/SpellLink';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import MaelstromSpenderInfo from '../core/MaelstromSpenderInfo';

const TWO_PIECE_AMP = 0.25;
const FOUR_PIECE_AMP = 0.25;

// On-cast buffs can be removed before the damage they enabled is logged.
const BUFF_REMOVAL_GRACE_MS = 50;

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
// Damage-event ids (matching the Stormkeeper damage module), not cast ids.
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
  TALENTS.EARTH_SHOCK_TALENT.id,
  TALENTS.ELEMENTAL_BLAST_TALENT.id,
  TALENTS.EARTHQUAKE_1_ELEMENTAL_TALENT.id,
  TALENTS.EARTHQUAKE_2_ELEMENTAL_TALENT.id,
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

  /** A free spender is available while the most recent 4pc buff has not yet been spent. */
  private freeSpenderAvailable = false;

  constructor(options: Options) {
    super(options);
    this.has2Piece = this.selectedCombatant.has2PieceByTier(TIERS.MID2);
    this.has4Piece = this.selectedCombatant.has4PieceByTier(TIERS.MID2);
    this.active = this.has2Piece || this.has4Piece;
    if (!this.active) {
      return;
    }

    if (this.has2Piece) {
      this.addEventListener(
        Events.damage.by(SELECTED_PLAYER).spell(TWO_PIECE_DAMAGE_SPELLS),
        this.onTwoPieceDamage,
      );
    }

    if (this.has4Piece) {
      this.addEventListener(
        Events.damage.by(SELECTED_PLAYER).spell(FOUR_PIECE_DAMAGE_SPELLS),
        this.onFourPieceDamage,
      );
      this.addEventListener(
        Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.MIDNIGHT_S2_ELEMENTAL_4SET_BUFF),
        this.onFourPieceBuff,
      );
      this.addEventListener(
        Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.MIDNIGHT_S2_ELEMENTAL_4SET_BUFF),
        this.onFourPieceBuff,
      );
      this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
    }
  }

  private onTwoPieceDamage(event: DamageEvent) {
    this.twoPieceDamage += calculateEffectiveDamage(event, TWO_PIECE_AMP);
  }

  private onFourPieceDamage(event: DamageEvent) {
    if (
      !this.selectedCombatant.hasBuff(
        SPELLS.MIDNIGHT_S2_ELEMENTAL_4SET_BUFF.id,
        event.timestamp,
        BUFF_REMOVAL_GRACE_MS,
      )
    ) {
      return;
    }
    this.fourPieceDamage += calculateEffectiveDamage(event, FOUR_PIECE_AMP);
  }

  private onFourPieceBuff() {
    this.freeSpenderAvailable = true;
  }

  private onCast(event: CastEvent) {
    if (!this.freeSpenderAvailable || !FOUR_PIECE_FREE_SPENDERS.includes(event.ability.guid)) {
      return;
    }
    this.freeSpenderAvailable = false;
    this.maelstromSaved += this.normalSpenderCost(event.ability.guid);
  }

  private normalSpenderCost(spellId: number): number {
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
      >
        <div className="pad">
          <label>
            <ItemSetLink id={SHAMAN_MID2_ID}>Midnight Season 2 Tier Set</ItemSetLink>
          </label>
          {this.has2Piece && (
            <div>
              <strong>2-piece</strong> damage:
              <div className="value">
                <ItemDamageDone amount={this.twoPieceDamage} />
              </div>
            </div>
          )}
          {this.has4Piece && (
            <div>
              <strong>4-piece</strong> damage:
              <div className="value">
                <ItemDamageDone amount={this.fourPieceDamage} />
              </div>
              <strong>4-piece</strong> <ResourceLink id={RESOURCE_TYPES.MAELSTROM.id} /> saved:
              <div className="value">
                {formatNumber(this.maelstromSaved)}{' '}
                <small>
                  from free <SpellLink spell={TALENTS.EARTH_SHOCK_TALENT} />/
                  <SpellLink spell={TALENTS.ELEMENTAL_BLAST_TALENT} />/
                  <SpellLink spell={TALENTS.EARTHQUAKE_1_ELEMENTAL_TALENT} />
                </small>
              </div>
            </div>
          )}
        </div>
      </Statistic>
    );
  }
}

export default S2TierSet;
