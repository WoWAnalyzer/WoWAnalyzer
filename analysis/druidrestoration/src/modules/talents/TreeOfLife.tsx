import { t } from '@lingui/macro';
import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import calculateEffectiveHealing from 'parser/core/calculateEffectiveHealing';
import Events, {
  ApplyBuffEvent,
  CastEvent,
  Event,
  HealEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import HealingDone from 'parser/shared/modules/throughput/HealingDone';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import React from 'react';

import { ABILITIES_AFFECTED_BY_HEALING_INCREASES_SPELL_OBJECTS } from '../../constants';
import Rejuvenation from '../core/Rejuvenation';

const ALL_BOOST = 0.15;
const ALL_MULT = 1.15;
const REJUV_BOOST = 0.5;
const REJUV_MANA_SAVED = 0.3;
const REJUV_MANA_COST = SPELLS.REJUVENATION.manaCost;
const WG_INCREASE = 8 / 6 - 1;
const TOL_DURATION = 30000;

// have to be careful about applying stacking boosts so we don't double count. Arbitrarily considering all boost to be applied "first"
// for example, lets say a rejuv tick during ToL heals for 1000 base, but is boosted by 1.15 * 1.5 => 1725... a total of 725 raw boost
// if we count each as a seperate boost, we get 1.15 => 225 boost, 1.5 => 575, total of 800 ... the overlapping boost was double counted
// we correct for this by dividing out the all boost before calcing either the rejuv boost or the wg increase

/*
 * This module handles 'Incarnation: Tree of Life' talent.
 *
 * Incarnation: Tree of Life -
 * Shapeshift into the Tree of Life, increasing healing done by 15%, increasing armor by 120%, and granting protection from Polymorph effects.  Functionality of Rejuvenation, Wild Growth, Regrowth, and Entangling Roots is enhanced.
 *
 * Tree of Life bonuses:
 *  - ALL: +15% healing
 *  - Rejuv: +50% healing and -30% mana
 *  - Regrowth: instant
 *  - Wild Growth: +2 targets
 */
class TreeOfLife extends Analyzer {
  static dependencies = {
    healingDone: HealingDone,
    abilityTracker: AbilityTracker,
    rejuvenation: Rejuvenation,
  };

  healingDone!: HealingDone;
  abilityTracker!: AbilityTracker;
  rejuvenation!: Rejuvenation;

  lastTolCast: number | null = null;
  lastTolApply: number | null = null;
  completedTolUptime = 0;

  // gets the appropriate accumulator for tallying this event
  // if ToL buff isn't active, returns null,
  wgCasts = 0;
  hardcast: TolAccumulator = {
    allBoostHealing: 0,
    rejuvBoostHealing: 0,
    rejuvManaSaved: 0,
    extraWgHealing: 0,
  };

  get hardcastUptime() {
    const currentUptime = !this.lastTolCast
      ? 0
      : Math.min(TOL_DURATION, this.owner.currentTimestamp - this.lastTolCast);
    return currentUptime + this.completedTolUptime;
  }

  get hardcastUptimePercent() {
    return this.hardcastUptime / this.owner.fightDuration;
  }

  get suggestionThresholds() {
    return {
      actual: this.owner.getPercentageOfTotalHealingDone(this._getTotalHealing(this.hardcast)),
      isLessThan: {
        minor: 0.06,
        average: 0.045,
        major: 0.025,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.INCARNATION_TREE_OF_LIFE_TALENT.id);
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(ABILITIES_AFFECTED_BY_HEALING_INCREASES_SPELL_OBJECTS),
      this.onHeal,
    );
    this.addEventListener(
      Events.cast
        .by(SELECTED_PLAYER)
        .spell([SPELLS.INCARNATION_TREE_OF_LIFE_TALENT, SPELLS.REJUVENATION, SPELLS.WILD_GROWTH]),
      this.onCast,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.INCARNATION_TOL_ALLOWED),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.INCARNATION_TOL_ALLOWED),
      this.onRemoveBuff,
    );
  }

  // if ToL buff is due to hardcast, returns the hardcast accumulator,
  _getAccumulator(event: Event<any>) {
    if (!this.selectedCombatant.hasBuff(SPELLS.INCARNATION_TREE_OF_LIFE_TALENT.id)) {
      return null;
    } else if (this.lastTolCast && this.lastTolCast + TOL_DURATION > event.timestamp) {
      return this.hardcast;
    } else {
      return null;
    }
  }

  onHeal(event: HealEvent) {
    const spellId = event.ability.guid;

    const accumulator = this._getAccumulator(event);
    if (!accumulator) {
      return;
    }

    accumulator.allBoostHealing += calculateEffectiveHealing(event, ALL_BOOST);

    if (spellId === SPELLS.REJUVENATION.id || spellId === SPELLS.REJUVENATION_GERMINATION.id) {
      accumulator.rejuvBoostHealing += calculateEffectiveHealing(event, REJUV_BOOST) / ALL_MULT;
    } else if (spellId === SPELLS.WILD_GROWTH.id) {
      accumulator.extraWgHealing += calculateEffectiveHealing(event, WG_INCREASE) / ALL_MULT;
    }
  }

  onCast(event: CastEvent) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.INCARNATION_TREE_OF_LIFE_TALENT.id) {
      this.lastTolCast = event.timestamp;
    } else if (
      spellId === SPELLS.REJUVENATION.id &&
      !this.selectedCombatant.hasBuff(SPELLS.INNERVATE.id)
    ) {
      const accumulator = this._getAccumulator(event);
      if (!accumulator) {
        return;
      }
      accumulator.rejuvManaSaved += REJUV_MANA_SAVED;
    } else if (spellId === SPELLS.WILD_GROWTH.id) {
      this.wgCasts += 1;
    }
  }

  onApplyBuff(event: ApplyBuffEvent) {
    this.lastTolApply = event.timestamp;
  }

  onRemoveBuff(event: RemoveBuffEvent) {
    const tolApply = this.lastTolApply === null ? this.owner.fight.start_time : this.lastTolApply;
    const buffUptime = event.timestamp - tolApply;

    if (this.lastTolCast) {
      this.completedTolUptime += Math.min(TOL_DURATION, buffUptime);
    }

    this.lastTolCast = null;
    this.lastTolApply = null;
  }

  _getManaSavedHealing(accumulator: TolAccumulator) {
    return accumulator.rejuvManaSaved * this.rejuvenation.avgRejuvHealing;
  }

  _getManaSaved(accumulator: TolAccumulator) {
    return accumulator.rejuvManaSaved * REJUV_MANA_COST;
  }

  _getTotalHealing(accumulator: TolAccumulator) {
    return (
      accumulator.allBoostHealing +
      accumulator.rejuvBoostHealing +
      accumulator.extraWgHealing +
      this._getManaSavedHealing(accumulator)
    );
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Your <SpellLink id={SPELLS.INCARNATION_TREE_OF_LIFE_TALENT.id} /> is not providing you
          much throughput. You may want to plan your CD usage better or pick another talent.
        </>,
      )
        .icon(SPELLS.INCARNATION_TREE_OF_LIFE_TALENT.icon)
        .actual(
          t({
            id: 'druid.restoration.suggestions.treeOfLife.efficiency',
            message: `${formatPercentage(actual)}% healing`,
          }),
        )
        .recommended(`>${formatPercentage(recommended, 0)}% is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(20)}
        size="flexible"
        tooltip={
          <>
            The Tree of Life buff was active for{' '}
            <strong>{(this.hardcastUptime / 1000).toFixed(0)}s</strong>, or{' '}
            <strong>{formatPercentage(this.hardcastUptimePercent, 1)}%</strong> of the encounter.
            The displayed healing number is the sum of several benefits, listed below:
            <ul>
              <li>
                Overall Increased Healing:{' '}
                <strong>
                  {formatPercentage(
                    this.owner.getPercentageOfTotalHealingDone(this.hardcast.allBoostHealing),
                  )}
                  %
                </strong>
              </li>
              <li>
                Rejuv Increased Healing:{' '}
                <strong>
                  {formatPercentage(
                    this.owner.getPercentageOfTotalHealingDone(this.hardcast.rejuvBoostHealing),
                  )}
                  %
                </strong>
              </li>
              <li>
                Rejuv Mana Saved: <strong>{formatNumber(this._getManaSaved(this.hardcast))}</strong>{' '}
                (assuming mana used to fill with Rejuvs:{' '}
                <strong>
                  ≈
                  {formatPercentage(
                    this.owner.getPercentageOfTotalHealingDone(
                      this._getManaSavedHealing(this.hardcast),
                    ),
                  )}
                  %
                </strong>{' '}
                healing)
              </li>
              <li>
                Increased Wild Growths:{' '}
                <strong>
                  {formatPercentage(
                    this.owner.getPercentageOfTotalHealingDone(this.hardcast.extraWgHealing),
                  )}
                  %
                </strong>
              </li>
            </ul>
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.INCARNATION_TREE_OF_LIFE_TALENT}>
          <ItemPercentHealingDone amount={this._getTotalHealing(this.hardcast)} />
          <br />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

// data shuttle for keeping track of bonuses attributed to ToL
interface TolAccumulator {
  allBoostHealing: number;
  rejuvBoostHealing: number;
  rejuvManaSaved: number;
  extraWgHealing: number;
}

export default TreeOfLife;
