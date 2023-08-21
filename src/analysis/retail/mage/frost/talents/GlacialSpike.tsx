import { Trans } from '@lingui/macro';
import { SHATTER_DEBUFFS } from 'analysis/retail/mage/shared';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import { TooltipElement } from 'interface';
import { highlightInefficientCast } from 'interface/report/Results/Timeline/Casts';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { EventType } from 'parser/core/Events';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Enemies from 'parser/shared/modules/Enemies';
import EventHistory from 'parser/shared/modules/EventHistory';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

class GlacialSpike extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    abilityTracker: AbilityTracker,
    eventHistory: EventHistory,
  };
  protected enemies!: Enemies;
  protected abilityTracker!: AbilityTracker;
  protected eventHistory!: EventHistory;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.GLACIAL_SPIKE_TALENT);
  }

  nonShatterCasts = () => {
    const spikeCasts = this.eventHistory.getEvents(EventType.Cast, {
      spell: TALENTS.GLACIAL_SPIKE_TALENT,
    });

    //If Icy Veins was active, disregard it
    let badCasts = spikeCasts.filter(
      (gs) => !this.selectedCombatant.hasBuff(TALENTS.ICY_VEINS_TALENT.id, gs.timestamp),
    );

    //If Glacial Spike was shattered on the main target, disregard it
    badCasts = badCasts.filter((gs) => {
      const spikeDamage = this.eventHistory.getEvents(EventType.Damage, {
        searchBackwards: false,
        spell: SPELLS.GLACIAL_SPIKE_DAMAGE,
        count: 1,
        startTimestamp: gs.timestamp,
        targetID: gs.targetID,
        duration: 1500,
      })[0];
      const enemy = this.enemies.getEntity(spikeDamage);
      return (
        !enemy || !SHATTER_DEBUFFS.some((effect) => enemy.hasBuff(effect.id, spikeDamage.timestamp))
      );
    });

    //Highlight bad casts on timeline
    const tooltip = `You cast Glacial Spike without shattering it. You should only use Glacial Spike if you can shatter it via Winter's Chill or a similar effect, or if Icy Veins is active.`;
    badCasts.forEach((c) => highlightInefficientCast(c, tooltip));

    return badCasts.length;
  };

  get utilPercentage() {
    return 1 - this.nonShatterCasts() / this.totalCasts;
  }

  get totalCasts() {
    return this.abilityTracker.getAbility(TALENTS.GLACIAL_SPIKE_TALENT.id).casts;
  }

  get glacialSpikeUtilizationThresholds() {
    return {
      actual: this.utilPercentage,
      isLessThan: {
        minor: 1.0,
        average: 0.85,
        major: 0.7,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.glacialSpikeUtilizationThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You cast <SpellLink spell={TALENTS.GLACIAL_SPIKE_TALENT} /> without{' '}
          <SpellLink spell={TALENTS.SHATTER_TALENT} />
          ing it {this.nonShatterCasts()} times. Because it is such a potent ability, it is
          important to maximize it's damage by only casting it if the target is
          <TooltipElement
            content={
              <>
                Winter's Chill, Frost Nova, Ice Nova, Ring of Frost, and your pet's Freeze will all
                cause the target to be frozen or act as frozen.
              </>
            }
          >
            Frozen or acting as Frozen
          </TooltipElement>
          .
        </>,
      )
        .icon(TALENTS.GLACIAL_SPIKE_TALENT.icon)
        .actual(
          <Trans id="mage.frost.suggestions.glacialSpike.castsWithoutShatter">
            {formatPercentage(actual, 1)}% utilization
          </Trans>,
        )
        .recommended(`${formatPercentage(recommended, 1)}% is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            You cast Glacial Spike {this.totalCasts} times, {this.nonShatterCasts()} casts of which
            were Shattered
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS.GLACIAL_SPIKE_TALENT}>
          {`${formatPercentage(this.utilPercentage, 0)}%`} <small>Cast utilization</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default GlacialSpike;
