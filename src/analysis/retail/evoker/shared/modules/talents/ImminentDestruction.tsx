import { Options } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/evoker';
import TALENTS from 'common/TALENTS/evoker';
import {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
} from 'parser/core/Events';
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
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { formatPercentage } from 'common/format';
import ProcBuffAnalyzer, { ProcBuffAnalyzerOptions } from '../core/ProcBuffAnalyzer';

const ProcBuffOptions: ProcBuffAnalyzerOptions = {
  trackedBuffs: [SPELLS.IMMINENT_DESTRUCTION_DEV_BUFF, SPELLS.IMMINENT_DESTRUCTION_AUG_BUFF],
  inactiveListeners: {},
};

/**
 * Devastation:
 * Deep Breath reduces the Essence costs of your next 4 Disintegrates and Pyres by 1. Stacks up to 8 times.
 *
 * Augmentation:
 * [Breath of Eons / Deep Breath] reduces the Essence cost of your next 6 Eruptions by 1.
 */
class ImminentDestruction extends ProcBuffAnalyzer {
  isDeva = this.selectedCombatant.spec === SPECS.DEVASTATION_EVOKER;

  talent = this.isDeva
    ? TALENTS.IMMINENT_DESTRUCTION_DEVASTATION_TALENT
    : TALENTS.IMMINENT_DESTRUCTION_AUGMENTATION_TALENT;

  buffSpell = this.isDeva
    ? SPELLS.IMMINENT_DESTRUCTION_DEV_BUFF
    : SPELLS.IMMINENT_DESTRUCTION_AUG_BUFF;

  amountOfStacksGenerated = this.isDeva
    ? IMMINENT_DESTRUCTION_INITIAL_STACKS_DEVA
    : IMMINENT_DESTRUCTION_INITIAL_STACKS_AUG;

  maxStacks = this.isDeva
    ? IMMINENT_DESTRUCTION_INITIAL_STACKS_DEVA * 2
    : IMMINENT_DESTRUCTION_INITIAL_STACKS_AUG;

  spenders = { Disintegrate: 0, Pyre: 0, Eruption: 0 };
  totalEssenceReduction = 0;

  constructor(options: Options) {
    super(options, ProcBuffOptions);
    this.active = this.selectedCombatant.hasTalent(this.talent);
  }

  onApplyBuff(event: ApplyBuffEvent) {
    return;
  }
  onApplyBuffStack(event: ApplyBuffStackEvent) {
    return;
  }
  onRefreshBuff(event: RefreshBuffEvent) {
    return;
  }

  onRemoveBuffStack(event: RemoveBuffStackEvent) {
    if (!this.handleReduction(event)) {
      console.error(
        '[ImminentDestruction] No consume ability found for RemoveBuffStackEvent',
        this.owner.formatTimestamp(event.timestamp),
        event,
      );
    }

    this.pushCastData(event, 'Buff used', QualitativePerformance.Good);
  }

  onRemoveBuff(event: RemoveBuffEvent) {
    if (!this.handleReduction(event)) {
      this.pushCastData(
        event,
        `Buff expired, wasting ${-this.stackDifference} stack(s)`,
        QualitativePerformance.Fail,
      );
    } else {
      this.pushCastData(event, 'Buff used', QualitativePerformance.Good);
    }
  }

  private handleReduction(event: RemoveBuffEvent | RemoveBuffStackEvent): boolean {
    const consumeEvent = getImminentDestructionConsumeEvent(event);
    if (!consumeEvent) {
      return false;
    }

    if (this.isDeva) {
      if (consumeEvent.ability.guid === SPELLS.DISINTEGRATE.id) {
        this.spenders.Disintegrate += 1;
      } else {
        this.spenders.Pyre += 1;
      }
    } else {
      this.spenders.Eruption += 1;
    }

    this.addStacksUsed(1);
    this.totalEssenceReduction += IMMINENT_DESTRUCTION_ESSENCE_REDUCTION;

    return true;
  }

  private buildSpenderBar(): StackedBarSegment[] {
    return [
      {
        label: 'Disintegrate',
        value: this.spenders.Disintegrate,
        color: 'hsl(190, 70%, 55%)',
        tooltip: (
          <>
            {this.spenders.Disintegrate} <SpellLink spell={this.buffSpell} /> spent on{' '}
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
            {this.spenders.Pyre} <SpellLink spell={this.buffSpell} /> spent on{' '}
            <SpellLink spell={SPELLS.PYRE} />
          </>
        ),
      },
    ];
  }
  get procUsageData(): AnalysisData {
    return {
      casts: this.casts,
      spell: this.buffSpell,
      stats: [
        {
          label: 'Stack Utilization',
          value: `${formatPercentage(this.stacksUsed / (this.stacksGenerated - this.activeStacks), 2)}%`,
          tooltip: `Used ${this.stacksUsed} out of ${this.stacksGenerated - this.activeStacks} (${this.stacksGenerated}) stack(s).`,
          performance: PerformanceResolver(this.stacksUsed / this.stacksGenerated),
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
        of <SpellLink spell={this.buffSpell} />.
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
