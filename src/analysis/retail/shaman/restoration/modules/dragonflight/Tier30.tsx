import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/shaman';
import { TIERS } from 'game/TIERS';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import {
  getSwellingRainHealingWaves,
  getTidewatersHealingEvents,
} from '../../normalizers/Tier30Normalizer';
import ChainHealNormalizer from '../../normalizers/ChainHealNormalizer';
import { SHAMAN_T30_ID } from 'common/ITEMS/dragonflight';
import { SpellLink } from 'interface';
import ItemSetLink from 'interface/ItemSetLink';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import Statistic from 'parser/ui/Statistic';
import { formatNumber, formatPercentage } from 'common/format';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import { CAST_BUFFER_MS } from '../../constants';

const TIER_4PC_RAINSTORM_PER_STACK = 0.01;
const TIER_4PC_SWELLING_RAIN_CHAINHEAL_PER_STACK = 0.02;
const TIER_4PC_SWELLING_RAIN_HSHW_PER_STACK = 0.1;
const debug = false;
/**
 * **Resto Shaman T30 (Aberrus)**
 *
 * 2pc: When you cast Healing Rain, each ally with your Riptide on them is area healed by Tidewaters for (175% of Spell power).
 *
 * 4pc: Each ally healed by Tidewaters increases your healing done by 1% for 6 sec and increases the healing of your next Healing Wave or Healing Surge by 10%,
 *      or your next Chain Heal by 2%.
 */

export default class Tier30 extends Analyzer {
  static dependencies = {
    chainHealNormalizer: ChainHealNormalizer,
  };
  chainHealNormalizer!: ChainHealNormalizer;
  has4pc: boolean;
  tidewatersHealing: number = 0;
  tidewatersOverheal: number = 0;
  current4pcStacks: number = 0;
  rainstormHealing: number = 0;
  swellingRainHealingSurge: number = 0;
  swellingRainHealingWave: number = 0;
  swellingRainChainheal: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.has2PieceByTier(TIERS.T30);
    this.has4pc = this.selectedCombatant.has4PieceByTier(TIERS.T30);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(talents.HEALING_RAIN_TALENT),
      this.onHealingRainCast,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(ITEMS.T30_TIDEWATERS_HEAL),
      this.on2pcHeal,
    );
    this.addEventListener(Events.heal.by(SELECTED_PLAYER | SELECTED_PLAYER_PET), this.on4pcHeal);
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.HEALING_SURGE),
      this.handleHealingSurge,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(talents.HEALING_WAVE_TALENT),
      this.handleHealingWave,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(talents.CHAIN_HEAL_TALENT),
      this.handleChainHeal,
    );
  }

  get twoPieceOverhealPercent() {
    return formatPercentage(
      this.tidewatersOverheal / (this.tidewatersHealing + this.tidewatersOverheal),
    );
  }

  get fourPieceTotalHealing() {
    return (
      this.swellingRainChainheal +
      this.swellingRainHealingSurge +
      this.swellingRainHealingWave +
      this.rainstormHealing
    );
  }

  onHealingRainCast(event: CastEvent) {
    //apparently these 'stacks' for each buff don't appear in logs so we have to manually tally the number of tidewaters hits to know how potent our current buff is
    this.current4pcStacks = getTidewatersHealingEvents(event).length;
  }

  on2pcHeal(event: HealEvent) {
    this.tidewatersHealing += event.amount + (event.absorbed || 0);
    this.tidewatersOverheal += event.overheal || 0;
  }

  on4pcHeal(event: HealEvent) {
    if (!this.selectedCombatant.hasBuff(ITEMS.T30_RAINSTORM_BUFF.id)) {
      return;
    }
    const healIncrease = this.current4pcStacks * TIER_4PC_RAINSTORM_PER_STACK;
    this.rainstormHealing += calculateEffectiveHealing(event, healIncrease);
  }

  handleHealingWave(event: CastEvent) {
    if (
      !this.selectedCombatant.hasBuff(
        ITEMS.T30_SWELLING_RAIN_BUFF.id,
        event.timestamp,
        CAST_BUFFER_MS,
      )
    ) {
      return;
    }
    const healIncrease = this.current4pcStacks * TIER_4PC_SWELLING_RAIN_HSHW_PER_STACK;
    const swellingRainHealingWaves = getSwellingRainHealingWaves(event);
    debug && console.log('healing wave', swellingRainHealingWaves, healIncrease);
    if (swellingRainHealingWaves.length > 0) {
      this.swellingRainHealingWave += this._tallyHealingIncrease(
        swellingRainHealingWaves,
        healIncrease,
      );
      debug && console.log(this.swellingRainHealingWave);
    }
  }

  handleHealingSurge(event: HealEvent) {
    if (
      !this.selectedCombatant.hasBuff(
        ITEMS.T30_SWELLING_RAIN_BUFF.id,
        event.timestamp,
        CAST_BUFFER_MS,
      )
    ) {
      return;
    }
    const healIncrease = this.current4pcStacks * TIER_4PC_SWELLING_RAIN_HSHW_PER_STACK;
    this.swellingRainHealingSurge += calculateEffectiveHealing(event, healIncrease);
  }

  handleChainHeal(event: CastEvent) {
    if (
      !this.selectedCombatant.hasBuff(
        ITEMS.T30_SWELLING_RAIN_BUFF.id,
        event.timestamp,
        CAST_BUFFER_MS,
      )
    ) {
      return;
    }
    const healIncrease = this.current4pcStacks * TIER_4PC_SWELLING_RAIN_CHAINHEAL_PER_STACK;
    const orderedChainHeal = this.chainHealNormalizer.normalizeChainHealOrder(event);
    debug && console.log('chain heal: ', orderedChainHeal, healIncrease);
    if (orderedChainHeal.length > 0) {
      this.swellingRainChainheal += this._tallyHealingIncrease(orderedChainHeal, healIncrease);
      debug && console.log(this.swellingRainChainheal);
    }
  }

  private _tallyHealingIncrease(events: HealEvent[], healIncrease: number): number {
    if (events.length > 0) {
      return events.reduce(
        (amount, event) => amount + calculateEffectiveHealing(event, healIncrease),
        0,
      );
    }
    return 0;
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.OPTIONAL(0)}
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={
          <>
            <ul>
              <li>
                <SpellLink id={ITEMS.T30_TIDEWATERS_HEAL.id} />:{' '}
                <strong>{formatNumber(this.tidewatersHealing)}</strong> (
                {this.twoPieceOverhealPercent}% Overheal)
              </li>
              {this.has4pc && (
                <>
                  <li>
                    <SpellLink id={ITEMS.T30_RAINSTORM_BUFF.id} />:{' '}
                    <strong>{formatNumber(this.rainstormHealing)}</strong>
                  </li>
                  <SpellLink id={ITEMS.T30_SWELLING_RAIN_BUFF.id} />:
                  <li>
                    <SpellLink id={talents.HEALING_WAVE_TALENT.id} />:{' '}
                    <strong>{formatNumber(this.swellingRainHealingWave)}</strong>
                  </li>
                  <li>
                    <SpellLink id={talents.CHAIN_HEAL_TALENT.id} />:{' '}
                    <strong>{formatNumber(this.swellingRainChainheal)}</strong>
                  </li>
                  <li>
                    <SpellLink id={SPELLS.HEALING_SURGE.id} />:{' '}
                    <strong>{formatNumber(this.swellingRainHealingSurge)}</strong>
                  </li>
                </>
              )}
            </ul>
          </>
        }
      >
        <div className="pad boring-text">
          <label>
            <ItemSetLink id={SHAMAN_T30_ID}>
              <>
                Runes of the Cinderwolf
                <br />
                (Aberrus Tier)
              </>
            </ItemSetLink>
          </label>
          <div className="value">
            <h4>2 Piece</h4>
            <ItemHealingDone amount={this.tidewatersHealing} />
          </div>
          <hr />
          {this.has4pc && (
            <div className="value">
              <h4>4 Piece</h4>
              <ItemHealingDone amount={this.fourPieceTotalHealing} />
            </div>
          )}
        </div>
      </Statistic>
    );
  }
}
