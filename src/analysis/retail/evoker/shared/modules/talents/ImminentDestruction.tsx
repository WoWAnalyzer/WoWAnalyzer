import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/evoker';
import TALENTS from 'common/TALENTS/evoker';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  FightEndEvent,
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
} from 'analysis/retail/evoker/devastation/modules/components/ProcAnalysis';
import { CastEvaluation, StackedBar, StackedBarSegment } from 'interface/guide/components';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { formatPercentage } from 'common/format';

/**
 * Devastation:
 * Deep Breath reduces the Essence costs of your next 4 Disintegrates and Pyres by 1. Stacks up to 8 times.
 *
 * Augmentation:
 * [Breath of Eons / Deep Breath] reduces the Essence cost of your next 6 Eruptions by 1.
 */
class ImminentDestruction extends Analyzer {
  totalEssenceReduction = 0;

  isDeva = this.selectedCombatant.spec === SPECS.DEVASTATION_EVOKER;

  buffSpell = this.isDeva
    ? SPELLS.IMMINENT_DESTRUCTION_DEV_BUFF
    : SPELLS.IMMINENT_DESTRUCTION_AUG_BUFF;

  talent = this.isDeva
    ? TALENTS.IMMINENT_DESTRUCTION_DEVASTATION_TALENT
    : TALENTS.IMMINENT_DESTRUCTION_AUGMENTATION_TALENT;

  initialBuffStacks = this.isDeva
    ? IMMINENT_DESTRUCTION_INITIAL_STACKS_DEVA
    : IMMINENT_DESTRUCTION_INITIAL_STACKS_AUG;

  casts: CastEvaluation[] = [];
  spenders = { Disintegrate: 0, Pyre: 0, Eruption: 0 };
  currentBuffStacks = 0;
  wastedBuffStacks = 0;
  totalBuffStacks = 0;
  buffStacksConsumed = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(this.talent);

    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(this.buffSpell),
      this.onRemoveBuff,
    );
    this.addEventListener(
      Events.removebuffstack.by(SELECTED_PLAYER).spell(this.buffSpell),
      this.onRemoveBuffStack,
    );

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(this.buffSpell),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(this.buffSpell),
      this.onApplyBuffStack,
    );
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  private onApplyBuff(_event: ApplyBuffEvent) {
    this.currentBuffStacks = this.initialBuffStacks;
    this.totalBuffStacks += this.currentBuffStacks;
  }

  private onApplyBuffStack(event: ApplyBuffStackEvent) {
    this.totalBuffStacks += event.stack - this.currentBuffStacks;
    this.currentBuffStacks = event.stack;
  }

  private onRemoveBuffStack(event: RemoveBuffStackEvent) {
    if (!this.handleReduction(event)) {
      console.error(
        '[ImminentDestruction] No consume ability found for RemoveBuffStackEvent',
        this.owner.formatTimestamp(event.timestamp),
        event,
      );
    }

    this.castAnalysis(event.timestamp, QualitativePerformance.Good);
    this.currentBuffStacks = event.stack;
  }

  private onRemoveBuff(event: RemoveBuffEvent) {
    if (!this.handleReduction(event)) {
      this.wastedBuffStacks += this.currentBuffStacks * IMMINENT_DESTRUCTION_ESSENCE_REDUCTION;
      this.castAnalysis(event.timestamp, QualitativePerformance.Fail);
    } else this.castAnalysis(event.timestamp, QualitativePerformance.Good);
    this.currentBuffStacks = 0;
  }

  private handleReduction(event: RemoveBuffEvent | RemoveBuffStackEvent): boolean {
    const consumeEvent = getImminentDestructionConsumeEvent(event);
    if (!consumeEvent) {
      return false;
    }

    if (this.isDeva)
      if (consumeEvent.ability.guid === SPELLS.DISINTEGRATE.id) this.spenders.Disintegrate += 1;
      else this.spenders.Pyre += 1;

    this.buffStacksConsumed += 1;
    this.totalEssenceReduction += IMMINENT_DESTRUCTION_ESSENCE_REDUCTION;

    return true;
  }

  private onFightEnd(event: FightEndEvent) {
    if (this.currentBuffStacks > 0) {
      this.castAnalysis(event.timestamp, QualitativePerformance.Ok);
    }
  }

  private castAnalysis(timestamp: number, performance: QualitativePerformance) {
    let info: string;

    switch (performance) {
      case QualitativePerformance.Fail:
        info = `Buff expired, wasting ${this.currentBuffStacks} stack(s)`;
        break;
      case QualitativePerformance.Ok:
        info = `Fight ended, leaving ${this.currentBuffStacks} stack(s) unused`;
        break;
      default:
        info = 'Buff used';
        break;
    }

    const castEntry: CastEvaluation = {
      performance: performance,
      timestamp: timestamp,
      reason: info,
    };

    this.casts.push(castEntry);
  }

  private buildSpenderBar(): StackedBarSegment[] {
    return [
      {
        label: 'Disintegrate',
        value: this.spenders.Disintegrate,
        color: 'hsl(190, 70%, 55%)',
        tooltip: (
          <>
            {this.spenders.Disintegrate} <SpellLink spell={SPELLS.ESSENCE_BURST_BUFF} /> spent on{' '}
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
            {this.spenders.Pyre} <SpellLink spell={SPELLS.ESSENCE_BURST_BUFF} /> spent on{' '}
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
          value: `${formatPercentage(this.buffStacksConsumed / (this.totalBuffStacks - this.currentBuffStacks), 2)}%`,
          tooltip: `Used ${this.buffStacksConsumed} out of ${this.totalBuffStacks - this.currentBuffStacks} (${this.totalBuffStacks}) stack(s).`,
          performance: PerformanceResolver(this.buffStacksConsumed / this.totalBuffStacks),
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
    const hasWastedBuffStacks = this.wastedBuffStacks > 0;

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
              <InformationIcon /> {this.wastedBuffStacks}{' '}
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
