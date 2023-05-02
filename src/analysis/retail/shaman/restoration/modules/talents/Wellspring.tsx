import { t, Trans } from '@lingui/macro';
import { formatPercentage, formatDuration, formatNth } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import { SpellLink } from 'interface';
import { SpellIcon } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { BeginCastEvent, CastEvent, HealEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Combatants from 'parser/shared/modules/Combatants';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import StatisticBox from 'parser/ui/StatisticBox';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';

import CooldownThroughputTracker from '../features/CooldownThroughputTracker';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';

class Wellspring extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    cooldownThroughputTracker: CooldownThroughputTracker,
  };

  protected combatants!: Combatants;
  protected cooldownThroughputTracker!: CooldownThroughputTracker;

  healing = 0;
  wellspringCasts: number[] = [];
  wellspringTimestamps: number[] = [];
  castNumber = 0;
  castEvent: CastEvent | undefined = undefined;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.WELLSPRING_TALENT);

    this.addEventListener(
      Events.begincast.by(SELECTED_PLAYER).spell(TALENTS.WELLSPRING_TALENT),
      this._onBegincast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.WELLSPRING_TALENT),
      this._onCast,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.WELLSPRING_HEAL),
      this._onHeal,
    );
    this.addEventListener(Events.fightend, this._onFightend);
  }

  _onBegincast(event: BeginCastEvent) {
    if (event.ability.guid !== TALENTS.WELLSPRING_TALENT.id || event.isCancelled) {
      return;
    }

    if (this.wellspringCasts[this.castNumber] && this.wellspringCasts[this.castNumber] < 6) {
      this.registerInefficientCast();
    }

    this.castNumber += 1;
    this.wellspringTimestamps[this.castNumber] = event.timestamp;
  }

  _onCast(event: CastEvent) {
    this.castEvent = event;
  }

  _onHeal(event: HealEvent) {
    if (!this.wellspringCasts[this.castNumber]) {
      this.wellspringCasts[this.castNumber] = 0;
    }

    this.healing += event.amount + (event.absorbed || 0);

    // Pets aren't really interesting to us as they don't work against the mechanic of wellspring
    const combatant = this.combatants.getEntity(event);
    if (!combatant) {
      return;
    }

    // Fully overhealed events don't affect wellsprings cap and are discarded
    if (event.overheal && event.amount === 0) {
      return;
    }

    this.wellspringCasts[this.castNumber] += 1;
  }

  _onFightend() {
    if (
      this.wellspringCasts[this.castNumber] &&
      this.wellspringCasts[this.castNumber] < 6 &&
      this.castEvent &&
      !this.castEvent.meta
    ) {
      this.registerInefficientCast();
    }
  }

  registerInefficientCast() {
    // Avoid breaking the page on pre-combat casts
    if (!this.castEvent) {
      return;
    }
    this.castEvent.meta = this.castEvent.meta || {};
    this.castEvent.meta.isInefficientCast = true;
    this.castEvent.meta.inefficientCastReason = (
      <Trans id="shaman.restoration.wellspring.inefficientCast.reason">
        This Wellspring cast hit less than 6 targets.
      </Trans>
    );
  }

  get averageHitsPerCast() {
    const totalHits = this.wellspringCasts.reduce((total, hits) => total + hits, 0);
    return totalHits / this.numberOfCasts;
  }

  get wellspringEfficiency() {
    return 1 - this.inefficientCasts / this.numberOfCasts;
  }

  get numberOfCasts() {
    // this.wellspringCasts[0] is there for pre-combat casts, most of the time this will be empty
    return this.wellspringCasts.length - (!this.wellspringCasts[0] ? 1 : 0);
  }

  get inefficientCasts() {
    return this.wellspringCasts.reduce((total, hits) => (hits < 6 ? total + 1 : total), 0);
  }

  suggestions(when: When) {
    const suggestionThreshold = this.suggestionThreshold;
    when(suggestionThreshold.actual)
      .isLessThan(suggestionThreshold.isLessThan.minor)
      .addSuggestion((suggest, _actual, _recommended) =>
        suggest(
          <Trans id="shaman.restoration.suggestions.wellSpring.label">
            You're not making full use of the potential of{' '}
            <SpellLink id={TALENTS.WELLSPRING_TALENT.id} />. Try to aim it towards stacks of injured
            players with 6 people or more.
          </Trans>,
        )
          .icon(TALENTS.WELLSPRING_TALENT.icon)
          .actual(
            `${formatPercentage(suggestionThreshold.actual)}% ${t({
              id: 'shared.suggestions.efficiency',
              message: `efficiency`,
            })}`,
          )
          .recommended(
            `>${formatPercentage(suggestionThreshold.isLessThan.minor)}% efficiency is recommended`,
          )
          .regular(suggestionThreshold.isLessThan.average)
          .major(suggestionThreshold.isLessThan.average),
      );
  }

  get suggestionThreshold() {
    return {
      actual: this.wellspringEfficiency,
      isLessThan: {
        minor: 0.8,
        average: 0.6,
        major: 0.5,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  statistic() {
    if (isNaN(this.averageHitsPerCast)) {
      return false;
    }

    return (
      <StatisticBox
        icon={<SpellIcon id={TALENTS.WELLSPRING_TALENT.id} />}
        label={
          <Trans id="shaman.restoration.wellspring.statistic.label">
            Wellspring target efficiency
          </Trans>
        }
        value={`${formatPercentage(this.wellspringEfficiency)} %`}
        tooltip={
          <Trans id="shaman.restoration.wellspring.statistic.tooltip">
            The average number of targets healed by Wellspring out of the minimum amount of 6
            targets to archive the maximum potential healing.
          </Trans>
        }
        category={STATISTIC_CATEGORY.THEORYCRAFT}
        position={STATISTIC_ORDER.OPTIONAL(100)}
      >
        <table className="table table-condensed">
          <thead>
            <tr>
              <th>
                <Trans id="common.cast">Cast</Trans>
              </th>
              <th>
                <Trans id="common.time">Time</Trans>
              </th>
              <th />
            </tr>
          </thead>
          <tbody>
            {this.wellspringCasts.map((hits, index) => (
              <tr key={index}>
                <th scope="row">{formatNth(index)}</th>
                <td>
                  {formatDuration(this.wellspringTimestamps[index] - this.owner.fight.start_time) ||
                    0}
                </td>
                <td style={hits < 6 ? { color: 'red', fontWeight: 'bold' } : {}}>{hits} hits</td>
              </tr>
            ))}
          </tbody>
        </table>
      </StatisticBox>
    );
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink id={TALENTS.WELLSPRING_TALENT.id} />}
        value={`${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing))} %`}
      />
    );
  }

  /** Guide subsection describing the proper usage of Wellspring */
  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <b>
          <SpellLink id={TALENTS.WELLSPRING_TALENT.id} />
        </b>{' '}
        is an efficient AoE heal on a short cooldown. The heal itself has travel time so its
        possible to pre-cast it into a <SpellLink id={TALENTS.CLOUDBURST_TOTEM_TALENT} /> and have
        the majority of its healing collected.
      </p>
    );

    const data = (
      <div>
        <RoundedPanel>
          <strong>
            <SpellLink id={TALENTS.WELLSPRING_TALENT} /> cast efficiency
          </strong>
          <div className="flex-main chart" style={{ padding: 15 }}>
            {this.guideSubStatistic()}
          </div>
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }

  guideSubStatistic() {
    return (
      <CastEfficiencyBar
        spellId={TALENTS.WELLSPRING_TALENT.id}
        gapHighlightMode={GapHighlight.FullCooldown}
        useThresholds
        minimizeIcons
      />
    );
  }
}

export default Wellspring;
