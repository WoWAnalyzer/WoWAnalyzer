import { formatNumber, formatPercentage } from 'common/format';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import { TooltipElement } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent, Item } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import Buffs from 'parser/core/modules/Buffs';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import BoringItemValueText from 'parser/ui/BoringItemValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/** Id for both the cast event and the buff */
const CAST: Spell = SPELLS.EARTHBREAKERS_IMPACT;
const BUFF: Spell = CAST;
const TICK: Spell = SPELLS.EARTHBREAKERS_IMPACT_TICK;

// const WEAKPOINT_1: Spell = SPELLS.EARTHBREAKERS_IMPACT_WEAKPOINT_1;
// const WEAKPOINT_2: Spell = SPELLS.EARTHBREAKERS_IMPACT_WEAKPOINT_2;
// const WEAKPOINT_3: Spell = SPELLS.EARTHBREAKERS_IMPACT_WEAKPOINT_3;

// const WEAKPOINTS = [WEAKPOINT_1, WEAKPOINT_2, WEAKPOINT_3];

const COOLDOWN_SECONDS = 3 * 60;
const TICK_MS = 2 * 1000;

/**
 * Return the index of `all` whose value most closely matches `targetNumber`.
 *
 * @returns The _index_ of the best match.
 */
function indexOfClosestMatch(all: number[], startIndex: number, targetNumber: number): number {
  let closestIndex = -1;
  let closestDelta = Number.MAX_SAFE_INTEGER;

  for (let i = startIndex; i < all.length; i += 1) {
    const delta = Math.abs(all[i] - targetNumber);

    if (delta >= closestDelta) {
      // We assume `all` is sorted, and if delta is increasing, we will never find a better match
      return closestIndex;
    }

    closestIndex = i;
    closestDelta = delta;
  }

  // console.log('indexOfClosestMatch', {
  //   candidates: all.slice(startIndex),
  //   targetNumber,
  //   closestIndex,
  // });
  return closestIndex;
}

/**
 * Takes a series of numbers, identifies each number that are most closely separated
 * by `period`. Returns the timestamps that are most closely separated by `period`.
 *
 * The first number is always selected as the first match.
 * The last number is included if it is more than `threshold` away from the last
 * periodical number.
 */
function findPeroidicNumbers(all: number[], period: number, threshold = period * 0.9): number[] {
  all = all.sort();
  const peroidicNumbers = [];
  let index = 0;
  peroidicNumbers.push(all[index]);
  while (index < all.length) {
    // this is the last tick
    // const number = all[index];

    index = indexOfClosestMatch(all, index + 1, all[0] + peroidicNumbers.length * period);
    if (index === -1) {
      break;
    }
    peroidicNumbers.push(all[index]);
  }
  return peroidicNumbers;
}

type Tick = {
  targetId: number;
  targetInstance: number;
  damage: number;
  hitType: number;
};

type Session = { [timestamp: number]: Tick[] };

/**
 * Earthbreaker's Impact
 *
 * ### Example parses:
 *
 * - https://www.warcraftlogs.com/reports/YWKxBP6bLG7AcgHy#fight=4&type=damage-done&source=5
 * - https://www.warcraftlogs.com/reports/WbqYvN1nCQFLr4Pc#fight=18&type=damage-done&source=377
 */
class EarthbreakersImpact extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    buffs: Buffs,
    castEfficiency: CastEfficiency,
  };

  protected abilities!: Abilities;
  protected buffs!: Buffs;
  protected castEfficiency!: CastEfficiency;

  private readonly item: Item;

  private sessions: Session[] = [];
  private currentSession: Session = {};

  constructor(
    options: Options & {
      abilities: Abilities;
      buffs: Buffs;
      castEfficiency: CastEfficiency;
    },
  ) {
    super(options);

    this.item = this.selectedCombatant.getItem(ITEMS.EARTHBREAKERS_IMPACT.id)!;
    if (this.item == null) {
      this.active = false;
      return;
    }

    // Add the buff to the buff tracker so that they show up in the timeline
    options.buffs.add({
      spellId: BUFF.id,
      timelineHighlight: true,
      triggeredBySpellId: CAST.id,
    });

    // Add the cast as an ability to track cooldown and usage in timeline
    options.abilities.add({
      spell: CAST.id,
      category: Abilities.SPELL_CATEGORIES.ITEMS,
      cooldown: COOLDOWN_SECONDS,
      gcd: null,
      castEfficiency: {
        suggestion: true,
        recommendedEfficiency: 0.8,
      },
    });

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(CAST), this.onCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(TICK), this.onDamage);
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  onCast(event: CastEvent) {
    this.currentSession = {};
    this.sessions.push(this.currentSession);
  }

  onDamage(event: DamageEvent) {
    if (!this.currentSession[event.timestamp]) {
      this.currentSession[event.timestamp] = [];
    }
    this.currentSession[event.timestamp].push({
      targetId: event.targetID,
      targetInstance: event.targetInstance,
      damage: (event.amount || 0) + (event.absorbed || 0),
      hitType: event.hitType,
    });
  }

  private getCastEfficiency() {
    return this.castEfficiency.getCastEfficiencyForSpellId(CAST.id);
  }

  getStats() {
    let grandTotalHits = 0;
    let grandTotalDamage = 0;
    let grandTotalBaselineDamage = 0;
    let grandTotalWeakPointsDamage = 0;

    const sessionsStats = this.sessions.map((session, index) => {
      const timestamps = Object.keys(session).map(Number);

      const tickTimestamps = findPeroidicNumbers(timestamps, TICK_MS);
      const weakPointTimestamps = timestamps.filter(
        (timestamp) => !tickTimestamps.includes(timestamp),
      );

      const baselineDamage = tickTimestamps.reduce((acc, timestamp) => {
        const ticks = session[timestamp];
        return acc + ticks.reduce((acc, tick) => acc + tick.damage, 0);
      }, 0);
      const weakPointDamage = weakPointTimestamps.reduce((acc, timestamp) => {
        const ticks = session[timestamp];
        return acc + ticks.reduce((acc, tick) => acc + tick.damage, 0);
      }, 0);
      const totalDamage = baselineDamage + weakPointDamage;

      const totalNumberOfHits = timestamps.reduce((acc, timestamp) => {
        const ticks = session[timestamp];
        return acc + ticks.length;
      }, 0);

      grandTotalHits += totalNumberOfHits;
      grandTotalDamage += totalDamage;
      grandTotalBaselineDamage += baselineDamage;
      grandTotalWeakPointsDamage += weakPointDamage;

      return {
        numberTicks: tickTimestamps.length,
        numberWeakPoints: weakPointTimestamps.length,
        totalDamage: formatNumber(totalDamage),
        baselineDamage: formatNumber(baselineDamage),
        weakpointDamage: formatNumber(weakPointDamage),
        averageNumberOfTargets: totalNumberOfHits / timestamps.length,
        allTicks: Object.entries(session)
          .map(([timestamp, ticks]) => [Number(timestamp), ticks] as const)
          .map(([timestamp, ticks], index) => ({
            timestamp: timestamp - timestamps[0],
            delta: timestamp - timestamps[index - 1],
            isWeakPoint: !tickTimestamps.includes(timestamp),
            numberTargets: ticks.length,
            minDamage: ticks
              .map((tick) => Math.floor(tick.damage / tick.hitType))
              .reduce((min, damage) => Math.min(min, damage), Infinity),
            averageDamage: Math.round(
              ticks
                .map((tick) => Math.floor(tick.damage / tick.hitType))
                .reduce((acc, damage) => acc + damage, 0) / ticks.length,
            ),
          })),
      };
    });

    const totalWeakpoints = sessionsStats
      .map(({ allTicks }) => allTicks.filter(({ isWeakPoint }) => isWeakPoint).length)
      .reduce((acc, value) => acc + value, 0);
    const averageWeakPointsPerSession = totalWeakpoints / this.sessions.length;

    return {
      sessions: sessionsStats,
      grandTotalHits,
      grandTotalDamage,
      grandTotalBaselineDamage,
      grandTotalWeakPointsDamage,
      averageWeakPointsPerSession,
      totalWeakpoints,
    };
  }

  onFightEnd() {
    console.log(this.getStats());
  }

  statistic() {
    const { casts = 0, maxCasts = 0 } = this.getCastEfficiency() ?? {};
    const {
      averageWeakPointsPerSession,
      grandTotalBaselineDamage,
      grandTotalDamage,
      grandTotalWeakPointsDamage,
      totalWeakpoints,
      // grandTotalHits,
      // sessions,
    } = this.getStats();

    function damageBreakdown() {
      return (
        <table className="table tbale-condensed">
          <thead>
            <tr>
              <th></th>
              <th>Damage</th>
              <th>%</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Baseline</th>
              <td>{formatNumber(grandTotalBaselineDamage)}</td>
              <td>{formatPercentage(grandTotalBaselineDamage / grandTotalDamage, 1)} %</td>
            </tr>
            <tr>
              <th scope="row">Weak Points</th>
              <td>{formatNumber(grandTotalWeakPointsDamage)}</td>
              <td>{formatPercentage(grandTotalWeakPointsDamage / grandTotalDamage, 1)} %</td>
            </tr>
            <tr>
              <th scope="row">Total</th>
              <td>{formatNumber(grandTotalDamage)}</td>
              <td>100 %</td>
            </tr>
          </tbody>
        </table>
      );
    }

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(100)}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
      >
        <BoringItemValueText item={this.item}>
          {casts} Uses <small>{maxCasts} possible</small>
        </BoringItemValueText>
        <div className="pad">
          <TooltipElement className="value" content={damageBreakdown()}>
            <ItemDamageDone amount={grandTotalDamage} />
          </TooltipElement>
        </div>
        <div className="pad">
          <TooltipElement
            className="value"
            content={
              <>
                A total of {totalWeakpoints} weak points was activated over the {casts} uses,
                resulting in an average of {averageWeakPointsPerSession.toFixed(2)}
              </>
            }
          >
            {averageWeakPointsPerSession.toFixed(2)} <small>weak points per use</small>
          </TooltipElement>
        </div>
      </Statistic>
    );
  }
}

export default EarthbreakersImpact;
