import { Options } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/evoker';
import TALENTS from 'common/TALENTS/evoker';
import { CastEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';
import Soup from 'interface/icons/Soup';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import ResourceLink from 'interface/ResourceLink';
import {
  IMMINENT_DESTRUCTION_ESSENCE_REDUCTION,
  IMMINENT_DESTRUCTION_INITIAL_STACKS_DEVA,
  IMMINENT_DESTRUCTION_INITIAL_STACKS_AUG,
} from '../../constants';
import SPECS from 'game/SPECS';
import { getImminentDestructionConsumeEvent } from '../normalizers/ImminentDestructionCastLinkNormalizer';
import { InformationIcon } from 'interface/icons';
import SpellLink from 'interface/SpellLink';
import {
  AnalysisData,
  PerformanceResolver,
} from 'analysis/retail/evoker/shared/modules/components/ProcAnalysis';
import { StackedBar, StackedBarSegment } from 'interface/guide/components';
import { formatPercentage } from 'common/format';
import ProcBuffAnalyzer, { BuffRemoveEvent } from '../core/ProcBuffAnalyzer';

/**
 * Devastation:
 * Deep Breath reduces the Essence costs of your next 4 Disintegrates and Pyres by 1. Stacks up to 8 times.
 *
 * Augmentation:
 * [Breath of Eons / Deep Breath] reduces the Essence cost of your next 6 Eruptions by 1.
 */
class ImminentDestruction extends ProcBuffAnalyzer<CastEvent> {
  isDeva = this.selectedCombatant.spec === SPECS.DEVASTATION_EVOKER;

  talent = this.isDeva
    ? TALENTS.IMMINENT_DESTRUCTION_DEVASTATION_TALENT
    : TALENTS.IMMINENT_DESTRUCTION_AUGMENTATION_TALENT;

  spenders = { Disintegrate: 0, Pyre: 0, Eruption: 0 };
  totalEssenceReduction = 0;

  constructor(options: Options) {
    const isDeva = options.owner.selectedCombatant.spec === SPECS.DEVASTATION_EVOKER;
    const initialStacks = isDeva
      ? IMMINENT_DESTRUCTION_INITIAL_STACKS_DEVA
      : IMMINENT_DESTRUCTION_INITIAL_STACKS_AUG;

    super(options, {
      buff: isDeva ? SPELLS.IMMINENT_DESTRUCTION_DEV_BUFF : SPELLS.IMMINENT_DESTRUCTION_AUG_BUFF,
      stacksPerProc: initialStacks,
      maxStacks: isDeva ? initialStacks * 2 : initialStacks,
    });
    this.active = this.selectedCombatant.hasTalent(this.talent);
  }

  protected getConsumeEvent(event: BuffRemoveEvent) {
    return getImminentDestructionConsumeEvent(event);
  }

  protected onStacksConsumed(event: BuffRemoveEvent, consumeEvent: CastEvent, stacks: number) {
    this.totalEssenceReduction += IMMINENT_DESTRUCTION_ESSENCE_REDUCTION * stacks;

    if (this.isDeva) {
      if (consumeEvent.ability.guid === SPELLS.DISINTEGRATE.id) {
        this.spenders.Disintegrate += 1;
      } else {
        this.spenders.Pyre += 1;
      }
    } else {
      this.spenders.Eruption += 1;
    }
  }

  private buildSpenderBar(): StackedBarSegment[] {
    return [
      {
        label: 'Disintegrate',
        value: this.spenders.Disintegrate,
        color: 'hsl(190, 70%, 55%)',
        tooltip: (
          <>
            {this.spenders.Disintegrate} <SpellLink spell={this.buff} /> spent on{' '}
            <SpellLink spell={SPELLS.DISINTEGRATE} />
          </>
        ),
      },
      {
        label: 'Pyre',
        value: this.spenders.Pyre,
        color: 'hsl(20, 70%, 55%)',
        tooltip: (
          <>
            {this.spenders.Pyre} <SpellLink spell={this.buff} /> spent on{' '}
            <SpellLink spell={SPELLS.PYRE} />
          </>
        ),
      },
    ];
  }
  get procUsageData(): AnalysisData {
    const usableStacks = this.stacksConsumed + this.stacksWasted;
    return {
      casts: this.casts,
      spell: this.buff,
      stats: [
        {
          label: 'Stack Utilization',
          value: `${formatPercentage(this.stacksConsumed / usableStacks, 2)}%`,
          tooltip: `Used ${this.stacksConsumed} out of ${usableStacks} stack(s). ${this.stacksExpired} expired, ${this.stacksOvercapped} overcapped.`,
          performance: PerformanceResolver(this.stacksConsumed / usableStacks),
        },
      ],
      additionalContent: this.isDeva
        ? {
            title: 'Spender Breakdown',
            content: <StackedBar segments={this.buildSpenderBar()} />,
          }
        : undefined,
    };
  }
  statistic() {
    const hasWastedBuffStacks = this.stacksWasted > 0;

    const tooltip = hasWastedBuffStacks ? (
      <>
        Wasted <ResourceLink id={RESOURCE_TYPES.ESSENCE.id} /> represent the amount of unused stacks
        of <SpellLink spell={this.buff} />.
      </>
    ) : null;

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={tooltip}
      >
        <TalentSpellText talent={this.talent}>
          <div>
            <Soup /> {this.totalEssenceReduction}{' '}
            <small>
              <ResourceLink id={RESOURCE_TYPES.ESSENCE.id} /> saved
            </small>
          </div>
          {hasWastedBuffStacks ? (
            <div>
              <InformationIcon /> {this.stacksWasted}{' '}
              <small>
                <ResourceLink id={RESOURCE_TYPES.ESSENCE.id} /> wasted
              </small>
            </div>
          ) : null}
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default ImminentDestruction;
