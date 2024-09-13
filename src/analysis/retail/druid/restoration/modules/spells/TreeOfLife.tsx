import { defineMessage } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, {
  ApplyBuffEvent,
  CastEvent,
  Event,
  HealEvent,
  RefreshBuffEvent,
} from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import { Attribution } from 'parser/shared/modules/HotTracker';
import HealingDone from 'parser/shared/modules/throughput/HealingDone';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import { ABILITIES_AFFECTED_BY_HEALING_INCREASES_SPELL_OBJECTS } from 'analysis/retail/druid/restoration/constants';
import HotTrackerRestoDruid from 'analysis/retail/druid/restoration/modules/core/hottracking/HotTrackerRestoDruid';
import Rejuvenation from 'analysis/retail/druid/restoration/modules/spells/Rejuvenation';
import { isFromHardcast } from 'analysis/retail/druid/restoration/normalizers/CastLinkNormalizer';
import { TALENTS_DRUID } from 'common/TALENTS';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { GUIDE_CORE_EXPLANATION_PERCENT } from 'analysis/retail/druid/restoration/Guide';

const ALL_BOOST = 0.1;
const ALL_MULT = 1 + ALL_BOOST;
const REJUV_BOOST = 0.4;
const WG_INCREASE = 8 / 6 - 1;
const TOL_DURATION = 30000;
const BUFFER = 500;

// have to be careful about applying stacking boosts so we don't double count. Arbitrarily considering all boost to be applied "first"
// for example, lets say a rejuv tick during ToL heals for 1000 base, but is boosted by 1.15 * 1.5 => 1725... a total of 725 raw boost
// if we count each as a seperate boost, we get 1.15 => 225 boost, 1.5 => 575, total of 800 ... the overlapping boost was double counted
// we correct for this by dividing out the all boost before calcing either the rejuv boost or the wg increase

/**
 * **Incarnation: Tree of Life**
 * Spec Talent Tier 8
 *
 * Shapeshift into the Tree of Life, increasing healing done by 15%, increasing armor by 120%,
 * and granting protection from Polymorph effects.
 * Functionality of Rejuvenation, Wild Growth, Regrowth, Entangling Roots, and Wrath is enhanced.
 * Lasts 30 sec. You may shapeshift in and out of this form for its duration.
 *
 * Tree of Life healing bonuses:
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
    hotTracker: HotTrackerRestoDruid,
  };

  healingDone!: HealingDone;
  abilityTracker!: AbilityTracker;
  rejuvenation!: Rejuvenation;
  hotTracker!: HotTrackerRestoDruid;

  lastHardcastTimestamp: number | null = null;

  hardcast: TolAccumulator = {
    allBoostHealing: 0,
    rejuvBoostHealing: 0,
    extraWgsAttribution: HotTrackerRestoDruid.getNewAttribution('ToL Hardcast: Extra WGs'),
  };
  reforestation: TolAccumulator = {
    allBoostHealing: 0,
    rejuvBoostHealing: 0,
    extraWgsAttribution: HotTrackerRestoDruid.getNewAttribution(
      'ToL from Reforestation: Extra WGs',
    ),
  };

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(ABILITIES_AFFECTED_BY_HEALING_INCREASES_SPELL_OBJECTS),
      this.onBoostedHeal,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_DRUID.INCARNATION_TREE_OF_LIFE_TALENT),
      this.onHardcastTol,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.WILD_GROWTH),
      this.onApplyWildGrowth,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.WILD_GROWTH),
      this.onApplyWildGrowth,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.INCARNATION_TOL_ALLOWED),
      this.onApplyTol,
    );

    this.addEventListener(Events.fightend, this.checkActive);
  }

  // TODO better way of handling this now that both are talents in DF?
  checkActive() {
    // only stay active for suggestion / stat if player actually has Talent -
    // we need this to calc to check for 4pc, which is why we don't check active at the start
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.INCARNATION_TREE_OF_LIFE_TALENT);
  }

  onHardcastTol(event: CastEvent) {
    this.lastHardcastTimestamp = event.timestamp;
  }

  onApplyTol(event: ApplyBuffEvent) {
    if (isFromHardcast(event)) {
      this.lastHardcastTimestamp = event.timestamp; // set here and on cast to avoid event ordering mishaps
    }
  }

  /**
   * Gets the tracking accumulator for the current ToL, if there is one
   */
  _getAccumulator(event: Event<any>) {
    if (!this.selectedCombatant.hasBuff(TALENTS_DRUID.INCARNATION_TREE_OF_LIFE_TALENT.id)) {
      return null; // ToL isn't active, no accumulator
    } else if (!this.selectedCombatant.hasTalent(TALENTS_DRUID.INCARNATION_TREE_OF_LIFE_TALENT)) {
      return this.reforestation; // player doesn't have the ToL talent so this must be from the set 4pc
    } else if (
      this.lastHardcastTimestamp !== null &&
      this.lastHardcastTimestamp + TOL_DURATION + BUFFER >= event.timestamp
    ) {
      return this.hardcast; // player hardcast ToL within buff duration, so this is a hardcast
    } else {
      return this.reforestation; // player didn't hardcast within buff duration, so this is the set 4pc
    }
  }

  onBoostedHeal(event: HealEvent) {
    const spellId = event.ability.guid;

    const accumulator = this._getAccumulator(event);
    if (!accumulator) {
      return;
    }

    accumulator.allBoostHealing += calculateEffectiveHealing(event, ALL_BOOST);
    if (spellId === SPELLS.REJUVENATION.id || spellId === SPELLS.REJUVENATION_GERMINATION.id) {
      accumulator.rejuvBoostHealing += calculateEffectiveHealing(event, REJUV_BOOST) / ALL_MULT;
    }
  }

  onApplyWildGrowth(event: ApplyBuffEvent | RefreshBuffEvent) {
    const accumulator = this._getAccumulator(event);
    if (!accumulator) {
      return;
    }
    // ToL causes extra WG buffs to be applied - rather than arbitrarily deciding which HoTs
    // were the "extra" ones, we instead partially attribute every WG applied during ToL
    this.hotTracker.addBoostFromApply(
      accumulator.extraWgsAttribution,
      WG_INCREASE / ALL_MULT,
      event,
    );
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

  _getTotalHealing(accumulator: TolAccumulator) {
    return (
      accumulator.allBoostHealing +
      accumulator.rejuvBoostHealing +
      accumulator.extraWgsAttribution.healing
    );
  }

  // TODO implement (what do we need?)
  /** Guide fragment showing a breakdown of each Incarnation: Tree of Life cast */
  get guideCastBreakdown() {
    const explanation = (
      <p>
        <strong>
          <SpellLink spell={TALENTS_DRUID.INCARNATION_TREE_OF_LIFE_TALENT} />
        </strong>{' '}
        is a long duration healing boost with low immediate impact. It should be planned around
        periods of high sustained healing. Due to its long duration and Rejuvenation mana discount,
        it should be cast at the start of your ramp.
      </p>
    );

    const data = (
      <p>
        <strong>EXPANDABLE PER-CAST BREAKDOWN COMING SOON!</strong>
      </p>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Your <SpellLink spell={TALENTS_DRUID.INCARNATION_TREE_OF_LIFE_TALENT} /> is not providing
          you much throughput. You may want to plan your CD usage better or pick another talent.
        </>,
      )
        .icon(TALENTS_DRUID.INCARNATION_TREE_OF_LIFE_TALENT.icon)
        .actual(
          defineMessage({
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
        position={STATISTIC_ORDER.OPTIONAL(8)} // number based on talent row
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
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
                Increased Wild Growths:{' '}
                <strong>
                  {formatPercentage(
                    this.owner.getPercentageOfTotalHealingDone(
                      this.hardcast.extraWgsAttribution.healing,
                    ),
                  )}
                  %
                </strong>
              </li>
            </ul>
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS_DRUID.INCARNATION_TREE_OF_LIFE_TALENT}>
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
  extraWgsAttribution: Attribution;
}

export default TreeOfLife;
