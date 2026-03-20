import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
import { SpellLink } from 'interface';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import BuffStackTracker from 'parser/shared/modules/BuffStackTracker';
import BoringValueText from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import CastSummaryAndBreakdown from 'interface/guide/components/CastSummaryAndBreakdown';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';
import { BadColor, GoodColor, OkColor } from 'interface/guide';

const MAX_STACKS = 3;
const LOW_FOCUS_THRESHOLD = 30;
// Focus is resource type 2 (see RESOURCE_TYPES.FOCUS)
const FOCUS_RESOURCE_TYPE = 2;
const HOWL_BUFFS = [
  SPELLS.HOWL_OF_THE_PACKLEADER_WYVERN,
  SPELLS.HOWL_OF_THE_PACKLEADER_BEAR,
  SPELLS.HOWL_OF_THE_PACKLEADER_BOAR,
];

class TipOfTheSpear extends BuffStackTracker {
  static trackedBuff = SPELLS.TIP_OF_THE_SPEAR_CAST;

  private wastedStacks = 0;
  private generationEntries: BoxRowEntry[] = [];
  private killCommandCasts = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.KILL_COMMAND_SURVIVAL_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.KILL_COMMAND_SURVIVAL_TALENT),
      this.onKillCommandCast,
    );
  }

  get totalWastedStacks(): number {
    return this.wastedStacks;
  }

  private onKillCommandCast = (event: CastEvent) => {
    this.killCommandCasts += 1;
    const currentStacks = this.current;
    const hasPrimalSurge = this.selectedCombatant.hasTalent(TALENTS.PRIMAL_SURGE_TALENT);
    const stacksGained = hasPrimalSurge ? 2 : 1;
    const potentialStacks = currentStacks + stacksGained;

    const currentFocus =
      event.classResources?.find((r) => r.type === FOCUS_RESOURCE_TYPE)?.amount ?? Infinity;
    const isLowFocus = currentFocus < LOW_FOCUS_THRESHOLD;

    const hasHowlBuff = HOWL_BUFFS.some((spell) =>
      this.selectedCombatant.hasBuff(spell.id, event.timestamp),
    );

    // Track waste
    if (potentialStacks > MAX_STACKS) {
      const waste = potentialStacks - MAX_STACKS;
      this.wastedStacks += waste;
    }

    let value: QualitativePerformance;
    let header: string;
    let color: string;

    if (currentStacks === 0) {
      value = QualitativePerformance.Good;
      header = 'Good: generated at 0 stacks.';
      color = GoodColor;
    } else if (hasHowlBuff && currentStacks === 1) {
      value = QualitativePerformance.Good;
      header = 'Good: generated at 1 stack with Howl of the Pack Leader active.';
      color = GoodColor;
    } else if (isLowFocus) {
      value = QualitativePerformance.Ok;
      header = `Ok: generated at ${currentStacks} stack${currentStacks !== 1 ? 's' : ''} with low focus (${currentFocus}).`;
      color = OkColor;
    } else if (currentStacks === 1) {
      value = QualitativePerformance.Ok;
      header = 'Ok: generated at 1 stack.';
      color = OkColor;
    } else if (currentStacks === 2 && !hasPrimalSurge) {
      value = QualitativePerformance.Ok;
      header = 'Ok: generated at 2 stacks (no waste without Primal Surge).';
      color = OkColor;
    } else {
      value = QualitativePerformance.Fail;
      const wastedAmount = potentialStacks - MAX_STACKS;
      header = `Bad: generated at ${currentStacks} stacks, wasted ${wastedAmount} stack${wastedAmount !== 1 ? 's' : ''}.`;
      color = BadColor;
    }

    const targetName = this.owner.getTargetName(event);
    const tooltip = (
      <div>
        <h5 style={{ color }}>{header}</h5>
        <strong>{this.owner.formatTimestamp(event.timestamp)}</strong> targeting{' '}
        <strong>{targetName || 'unknown'}</strong>
        <div>
          Current stacks: <strong>{currentStacks}</strong> →{' '}
          <strong>{Math.min(potentialStacks, MAX_STACKS)}</strong>
        </div>
        {hasPrimalSurge && (
          <div>
            <small>
              (With <SpellLink spell={TALENTS.PRIMAL_SURGE_TALENT} />, generates {stacksGained}{' '}
              stacks)
            </small>
          </div>
        )}
      </div>
    );

    this.generationEntries.push({ value, tooltip });
  };

  get guideSubsection() {
    const explanation = (
      <p>
        <strong>
          <SpellLink spell={SPELLS.TIP_OF_THE_SPEAR_CAST} />
        </strong>{' '}
        should never be wasted. Ideally, only generate stacks with{' '}
        <SpellLink spell={TALENTS.KILL_COMMAND_SURVIVAL_TALENT} /> when you have 0 stacks. Avoid
        casting Kill Command when you already have 2 or 3 stacks to prevent waste.
      </p>
    );

    const data = (
      <div>
        <CastSummaryAndBreakdown
          spell={TALENTS.KILL_COMMAND_SURVIVAL_TALENT}
          castEntries={this.generationEntries}
          badExtraExplanation={<>and wasted Tip of the Spear stacks</>}
        />
      </div>
    );

    return explanationAndDataSubsection(explanation, data);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringValueText
          label={
            <>
              <SpellLink spell={SPELLS.TIP_OF_THE_SPEAR_CAST} /> stacks wasted
            </>
          }
        >
          {this.wastedStacks} / {this.killCommandCasts}
        </BoringValueText>
      </Statistic>
    );
  }
}

export default TipOfTheSpear;
