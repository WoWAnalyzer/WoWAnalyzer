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

  return closestIndex;
}

/**
 * Takes a series of numbers, identifies each number that are most closely separated
 * by `period`. Returns the timestamps that are most closely separated by `period`.
 *
 * The first number is always selected as the first match.
 * The last number is included if it is more than `threshold` away from the last
 * periodical number.
 *
 * This is used to try to differentiate the ticks of Earthbreaker's Impact from
 * the weak point triggers. Both use the same spell ID, but the ticks should be
 * strongly periodic while weak point triggers should not.
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
 *   - Interestingly, this has two pulses go off at the same millisecond.
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
  }

  onCast(event: CastEvent) {
    this.currentSession = {};
    this.sessions.push(this.currentSession);
  }

  onDamage(event: DamageEvent) {
    this.trackDamage(
      event.timestamp,
      event.targetID,
      event.targetInstance,
      event.amount,
      event.hitType,
    );
  }

  private trackDamage(
    timestamp: number,
    targetId: number,
    targetInstance: number,
    damage: number,
    hitType: number,
  ): void {
    if (!this.currentSession[timestamp]) {
      // There is no entry for this timestamp
      this.currentSession[timestamp] = [];
    } else if (
      this.currentSession[timestamp].some(
        (t) => t.targetId === targetId && t.targetInstance === targetInstance,
      )
    ) {
      // The current target has already been hit by this tick
      // so we try to create a new tick for the next millisecond to create separate ticks
      // You might think that this would be so rare that it should not be necessary to handle
      // but with the 2 example logs I looked at, one had this happen, so I assume it can happen
      // again.
      return this.trackDamage(timestamp + 1, targetId, targetInstance, damage, hitType);
    }

    this.currentSession[timestamp].push({
      targetId,
      targetInstance,
      damage,
      hitType,
    });
  }

  private getCastEfficiency() {
    return this.castEfficiency.getCastEfficiencyForSpellId(CAST.id);
  }

  getStats() {
    const stats = this.sessions
      // Summarize stats for each session
      .map((session) => {
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

        return {
          totalNumberOfHits,
          baselineDamage,
          weakPointDamage,
          totalDamage,
          numberWeakPoints: weakPointTimestamps.length,
        };
      })
      // Summarize total datas
      .reduce(
        (acc, session) => ({
          totalNumberOfHits: acc.totalNumberOfHits + session.totalNumberOfHits,
          baselineDamage: acc.baselineDamage + session.baselineDamage,
          weakPointDamage: acc.weakPointDamage + session.weakPointDamage,
          totalDamage: acc.totalDamage + session.totalDamage,
          numberWeakPoints: acc.numberWeakPoints + session.numberWeakPoints,
        }),
        {
          totalNumberOfHits: 0,
          baselineDamage: 0,
          weakPointDamage: 0,
          totalDamage: 0,
          numberWeakPoints: 0,
        },
      );

    return {
      ...stats,
      averageWeakPointsPerSession: stats.numberWeakPoints / this.sessions.length,
    };
  }

  statistic() {
    const { casts = 0, maxCasts = 0 } = this.getCastEfficiency() ?? {};
    const {
      averageWeakPointsPerSession,
      baselineDamage,
      totalDamage,
      weakPointDamage,
      numberWeakPoints,
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
              <td>{formatNumber(baselineDamage)}</td>
              <td>{formatPercentage(baselineDamage / totalDamage, 1)} %</td>
            </tr>
            <tr>
              <th scope="row">Weak Points</th>
              <td>{formatNumber(weakPointDamage)}</td>
              <td>{formatPercentage(weakPointDamage / totalDamage, 1)} %</td>
            </tr>
            <tr>
              <th scope="row">Total</th>
              <td>{formatNumber(totalDamage)}</td>
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
            <ItemDamageDone amount={totalDamage} />
          </TooltipElement>
        </div>
        <div className="pad">
          <TooltipElement
            className="value"
            content={
              <>
                A total of {numberWeakPoints} weak points was activated by running over them. Over{' '}
                {casts} uses, averaging to {averageWeakPointsPerSession.toFixed(2)} weak points
                activated per use.
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
