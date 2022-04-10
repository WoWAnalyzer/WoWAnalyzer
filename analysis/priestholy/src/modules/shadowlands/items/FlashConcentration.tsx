import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { ApplyBuffStackEvent, ApplyBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import SUGGESTION_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import BoringValue from 'parser/ui/BoringValueText';
import DonutChart from 'parser/ui/DonutChart';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

const FLASH_CONCENTRATION_DURATION = 20000; // 20 s buff duration
const FLASH_CONCENTRATION_CAST_TIME_REDUCTION = 200; // 0.2 seconds per stack

/**
 * An Analyzer for Flash Concentration:
 * - statistic: Heal Usage Analysis.
 * - statistic: Donut Analysis of Flash Heal and Heal Casts at 5 stacks of FC
 * - suggestion: when too many FC Drops.
 * - suggestion: when too many wasteful Flash Heal Casts.
 */
class FlashConcentration extends Analyzer {
  // Warcraft Logs seems to have issues with the stack status at fight start
  // we do not know how many stacks the character has and how long it has until expiration
  // in WoWA we have a prepull apply buff with the same lack of info
  // Realistically, people start at 5 stacks, or _isFullStack is going to turn to false on the first applyBuff or applyBuffStack
  // the only issue is that the first Flash Heal may be considered wasteful when it is not.
  _isFullStack = true;
  // There is also no buff event generated when Flash Heal is cast while there are already 5 stacks
  // so we are maintaining the date of the last refresh here.
  _lastFullStackRefresh = 0;
  // a Counter for wasteful Flash Heal Casts
  _wastefulCasts = 0;
  // a counter for when FC stacks are dropped
  _totalDrops = 0;
  // tracker for number of current stacks
  _currentStacks = 5;
  // overall gained cast time on Heals thanks to Flash Concentration
  _gainedCastTime = 0;
  // number of Heal Casts at each number of stacks of FC
  _HealBuffedStats = [0, 0, 0, 0, 0, 0];
  // number of times Flash Heal is cast at 5 stacks of FC, more than 5 seconds before the end of FC, to drop a second stack of Surge of Light
  _SurgeOfLightUnload = 0;
  // number of refreshes of FC stacks done less than 5 seconds before the end of the FC Buff
  _goodRefreshes = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasLegendary(SPELLS.FLASH_CONCENTRATION_ITEM);

    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.FLASH_CONCENTRATION),
      this.onByPlayerFlashConcentrationBuff,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.FLASH_CONCENTRATION),
      this.onByPlayerFlashConcentrationInitialBuff,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.FLASH_CONCENTRATION),
      this.onByPlayerFlashConcentrationBuffRemoval,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.FLASH_HEAL),
      this.onByPlayerFlashHealCast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.GREATER_HEAL),
      this.onByPlayerHealCast,
    );
  }

  /**
   * Sets _isFullStack to true if there are now 5 stacks, as well as the last refresh
   * NB: it comes after the Flash Heal Cast
   * @param event indicate the new number of stacks (only positive increments)
   */
  onByPlayerFlashConcentrationBuff(event: ApplyBuffStackEvent) {
    if (event.stack === 5) {
      this._isFullStack = true;
      this._lastFullStackRefresh = event.timestamp;
    } else {
      this._isFullStack = false;
    }
    this._currentStacks = event.stack;
  }

  /**
   * Sets _isFullStack to false.
   * Note: The only exception is the prepull event, for which we assume that
   * it means the character has five stacks. It will be corrected if the
   * first Flash Heal generates a ApplyBuffStack or ApplyBuff event
   * Note 2: Technically, the only time this function does something is on the first
   * apply buff if there was no prepull FC.
   * @param event with info about first stack, or prepull incomplete indication
   */
  onByPlayerFlashConcentrationInitialBuff(event: ApplyBuffEvent) {
    if (event.prepull !== true) {
      this._isFullStack = false;
      this._currentStacks = 1;
    }
  }

  /**
   * Increments _totalDrops for our suggestion, since that should ideally not happen
   */
  onByPlayerFlashConcentrationBuffRemoval(event: RemoveBuffEvent) {
    this._totalDrops += 1;
    this._isFullStack = false;
    this._currentStacks = 0;
  }

  /**
   * when at full stack, it refreshes the last refresh timer,
   * and counts a Wasteful Cast if it was used earlier than needed
   * without 2 Surge Of Light Stacks
   */
  onByPlayerFlashHealCast(event: CastEvent) {
    if (this._isFullStack) {
      if (event.timestamp - this._lastFullStackRefresh > FLASH_CONCENTRATION_DURATION - 5000) {
        this._goodRefreshes += 1;
      } else if (this.selectedCombatant.getBuffStacks(SPELLS.SURGE_OF_LIGHT_BUFF.id) >= 2) {
        this._SurgeOfLightUnload += 1;
      } else {
        this._wastefulCasts += 1;
      }
      this._lastFullStackRefresh = event.timestamp;
    }
  }

  onByPlayerHealCast(event: CastEvent) {
    // store the Heal in the table per number of stacks
    this._HealBuffedStats[this._currentStacks] += 1;
    this._gainedCastTime += this._currentStacks * FLASH_CONCENTRATION_CAST_TIME_REDUCTION;
  }

  renderMaxStacksChart() {
    const items = [
      {
        color: '#00bbcc',
        label: 'Heal',
        spellId: SPELLS.GREATER_HEAL.id,
        value: this._HealBuffedStats[5],
        valueTooltip: `${this._HealBuffedStats[5]} casts of very efficient Heals`,
      },
      {
        color: '#f37735',
        label: 'Innefficient Flash Heal',
        spellId: SPELLS.FLASH_HEAL.id,
        value: this._wastefulCasts,
        valueTooltip: `${this._wastefulCasts} unefficient Flash Heal casts. Some inefficient casts are unavoidable to account for mechanics that may silence you for a few seconds (e.g. Blood Price), or to move Fae Guardians.`,
      },
      {
        color: '#eeff41',
        label: 'Surge of Light*2',
        spellId: SPELLS.SURGE_OF_LIGHT_TALENT.id,
        value: this._SurgeOfLightUnload,
        valueTooltip: `${this._SurgeOfLightUnload} Flash Heal casts with 2 stacks of Surge of Light`,
      },
      {
        color: '#b2ff59',
        label: 'Efficient Refresh',
        spellId: SPELLS.FLASH_CONCENTRATION.id,
        value: this._goodRefreshes,
        valueTooltip: `${this._goodRefreshes} efficient refreshes of Flash Concentration`,
      },
    ];

    return <DonutChart items={items} />;
  }

  statistic() {
    const averageStacksOnHeal = (
      this._HealBuffedStats.reduce((p, v, i) => p + v * i) /
      this._HealBuffedStats.reduce((p, v) => p + v)
    ).toFixed(2);
    return (
      <>
        <Statistic
          size="flexible"
          category={STATISTIC_CATEGORY.ITEMS}
          tooltip={
            <>
              Impact is approximative since <SpellLink id={SPELLS.FLASH_CONCENTRATION.id} />{' '}
              modifies the gameplay in depth
            </>
          }
          dropdown={
            <>
              <table className="table table-condensed">
                <thead>
                  <tr>
                    <th>Stacks</th>
                    <th>Number of Casts</th>
                  </tr>
                </thead>
                <tbody>
                  {this._HealBuffedStats.map((v, i) => (
                    <tr key={`stack${i}`}>
                      <th>{i}</th>
                      <th>{v}</th>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          }
        >
          <BoringValue
            label={
              <>
                <SpellLink id={SPELLS.GREATER_HEAL.id} /> with{' '}
                <SpellLink id={SPELLS.FLASH_CONCENTRATION.id} />
              </>
            }
          >
            {this._gainedCastTime / 1000} sec{' '}
            <small>
              saved on <SpellLink id={SPELLS.GREATER_HEAL.id} /> casts
            </small>
            <br />
            {averageStacksOnHeal}{' '}
            <small>
              avg stacks on <SpellLink id={SPELLS.GREATER_HEAL.id} /> casts
            </small>
          </BoringValue>
        </Statistic>
        <Statistic
          size="flexible"
          category={STATISTIC_CATEGORY.ITEMS}
          tooltip={
            <>
              Detailed usage of <SpellLink id={SPELLS.FLASH_HEAL.id} /> and{' '}
              <SpellLink id={SPELLS.GREATER_HEAL.id} /> while maintaining 5 stacks of{' '}
              <SpellLink id={SPELLS.FLASH_CONCENTRATION.id} />
            </>
          }
        >
          <div className="pad">
            <label>
              {' '}
              <SpellLink id={SPELLS.FLASH_CONCENTRATION.id} /> fully stacked
            </label>
            {this.renderMaxStacksChart()}
          </div>
        </Statistic>
      </>
    );
  }

  get dropSuggestion() {
    return {
      actual: this._totalDrops,
      isGreaterThan: {
        minor: 0,
        average: 0,
        major: 0,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  get wastefulFlashHealSuggestion() {
    return {
      actual:
        (100 * this._wastefulCasts) /
        (this._wastefulCasts +
          this._HealBuffedStats[5] +
          this._SurgeOfLightUnload +
          this._goodRefreshes),
      isGreaterThan: {
        minor: 10,
        average: 20,
        major: 30,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.dropSuggestion).addSuggestion((suggest, actual) =>
      suggest(
        <span>
          You dropped your <SpellLink id={SPELLS.FLASH_CONCENTRATION.id}></SpellLink> stacks{' '}
          {actual} times. Try to keep it up at all times.
        </span>,
      )
        .icon(SPELLS.FLASH_CONCENTRATION.icon)
        .staticImportance(SUGGESTION_IMPORTANCE.MAJOR)
        .actual(<>You lost your stacks {actual} times</>)
        .recommended(<>It is recommended to maintain 5 stacks at all times</>),
    );

    when(this.wastefulFlashHealSuggestion).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <span>
          You used too many inefficient <SpellLink id={SPELLS.FLASH_HEAL.id} /> while you had 5
          stacks of <SpellLink id={SPELLS.FLASH_CONCENTRATION.id}></SpellLink>
        </span>,
      )
        .icon(SPELLS.FLASH_CONCENTRATION.icon)
        .actual(<>While some are unavoidable, you had {Math.floor(actual)}% of inefficient casts</>)
        .recommended(
          <>
            {'<'}
            {recommended}% inefficient casts is recommended
          </>,
        ),
    );
  }
}

export default FlashConcentration;
