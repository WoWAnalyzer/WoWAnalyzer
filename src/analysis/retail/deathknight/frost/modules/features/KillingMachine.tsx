import { defineMessage } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/deathknight';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  GlobalCooldownEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
} from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { Fragment } from 'react';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import GradiatedPerformanceBar from 'interface/guide/components/GradiatedPerformanceBar';
import RuneTracker from './RuneTracker';

const LAG_BUFFER_MS = 100;
const BUFF_DURATION_MS = 10000;

class KillingMachineEfficiency extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    runeTracker: RuneTracker,
  };

  protected abilityTracker!: AbilityTracker;
  protected runeTracker!: RuneTracker;

  kmProcs: number = 0;
  lastGCDTime: number = 0;
  lastGCDDuration: number = 0;
  lastProcTime: number = 0;
  refreshedKMProcs = 0;
  expiredKMProcs = 0;
  currentStacks = 0;
  procsWastedToResources = 0;

  readonly fatalFixation = true;

  constructor(options: Options) {
    super(options);

    this.addEventListener(Events.GlobalCooldown, this.globalCooldown);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.KILLING_MACHINE),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.KILLING_MACHINE),
      this.onRemoveBuff,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.KILLING_MACHINE),
      this.onRefreshBuff,
    );
    this.fatalFixation &&
      this.addEventListener(
        Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.KILLING_MACHINE),
        this.onApplyBuffStack,
      );
    this.fatalFixation &&
      this.addEventListener(
        Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.KILLING_MACHINE),
        this.onRemoveBuffStack,
      );
  }

  onApplyBuff(event: ApplyBuffEvent) {
    this.kmProcs += 1;
    this.lastProcTime = event.timestamp;
  }

  onRemoveBuff(event: RemoveBuffEvent) {
    const durationHeld = event.timestamp - this.lastProcTime;
    if (durationHeld > BUFF_DURATION_MS) {
      this.expiredKMProcs += 1;
    }
  }

  onRefreshBuff(event: RefreshBuffEvent) {
    const timeSinceStackRemoved = event.timestamp - this.lastProcTime;

    // 4/5/23 Going from 2 -> 1 KM stacks refreshes the proc, this shouldn't be counted
    if (this.fatalFixation && this.currentStacks === 1 && timeSinceStackRemoved < LAG_BUFFER_MS) {
      // 3/24/23, logs refresh km whenever you go from 2 -> 1 stacks
      this.lastProcTime = event.timestamp;
      return;
    }
    this.kmProcs += 1;
    // 3/24/23, trying out disabling lag tolerance for km refreshes if the player has fatal fixation talented, may need more work
    if (
      (!this.fatalFixation || (this.fatalFixation && this.currentStacks === 2)) &&
      this.runeTracker.runesAvailable < 2
    ) {
      this.procsWastedToResources += 1;
      return;
    }
    this.refreshedKMProcs += 1;
  }

  onApplyBuffStack(event: ApplyBuffStackEvent) {
    this.kmProcs += 1;
    this.lastProcTime = event.timestamp;
    this.currentStacks = event.stack;
  }

  onRemoveBuffStack(event: RemoveBuffStackEvent) {
    this.currentStacks = event.stack;
    this.lastProcTime = event.timestamp;
  }

  globalCooldown(event: GlobalCooldownEvent) {
    this.lastGCDTime = event.timestamp;
    this.lastGCDDuration = event.duration;
  }

  get totalWastedProcs() {
    return this.refreshedKMProcs + this.expiredKMProcs;
  }

  get wastedProcRate() {
    return this.totalWastedProcs / this.kmProcs;
  }

  get totalProcs() {
    return this.kmProcs + this.refreshedKMProcs + this.procsWastedToResources;
  }

  get efficiency() {
    return 1 - this.wastedProcRate;
  }

  get suggestionThresholds() {
    return {
      actual: this.efficiency,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.85,
      },
      style: ThresholdStyle.PERCENTAGE,
      suffix: 'Average',
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <Fragment>
          {' '}
          You wasted <SpellLink spell={SPELLS.KILLING_MACHINE} /> procs. You should be casting{' '}
          <SpellLink spell={talents.OBLITERATE_TALENT} /> or{' '}
          <SpellLink spell={talents.FROSTSCYTHE_TALENT} /> within 1 or 2 GCDs of gaining a Killing
          Machine proc to avoid wasting it. See one of the guides on the About tab for more
          information on when another ability takes precedence over spending Killing Machine
        </Fragment>,
      )
        .icon(SPELLS.KILLING_MACHINE.icon)
        .actual(
          defineMessage({
            id: 'deathknight.frost.suggestions.killingMachine.wasted',
            message: `${formatPercentage(
              this.wastedProcRate,
            )}% of Killing Machine procs were either refreshed and lost or expired without being used`,
          }),
        )
        .recommended(`<${formatPercentage(1 - recommended)}% is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(5)}
        size="flexible"
        tooltip={
          <>
            You wasted {this.totalWastedProcs} out of {this.totalProcs} Killing Machine procs (
            {formatPercentage(this.wastedProcRate)}%). <br />
            {this.expiredKMProcs} procs expired without being used and {this.refreshedKMProcs} procs
            were overwritten by new procs.
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.KILLING_MACHINE}>
          <>
            {formatPercentage(this.efficiency)} % <small>efficiency</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }

  get guideSubsection(): JSX.Element {
    const goodKms = {
      count:
        this.kmProcs - this.expiredKMProcs - this.refreshedKMProcs - this.procsWastedToResources,
      label: 'Killing Machines cosumed',
    };

    const procsWastedToResources = {
      count: this.procsWastedToResources,
      label: 'Killing Machines lost while you did not have enough Runes to spend it',
    };

    const refreshedKms = {
      count: this.refreshedKMProcs + this.expiredKMProcs,
      label: 'Killing Machines lost',
    };

    const explanation = (
      <p>
        <b>
          <SpellLink spell={talents.KILLING_MACHINE_TALENT} />
        </b>{' '}
        is your most important proc. You want to waste as few of them as possible. If you are
        playing 2H Frost it is even more important because{' '}
        <SpellLink spell={talents.OBLITERATE_TALENT} /> will be <b>the most important</b> source of
        damage in your build.
      </p>
    );

    const data = (
      <div>
        <strong>Killing Machine breakdown</strong>
        <GradiatedPerformanceBar good={goodKms} ok={procsWastedToResources} bad={refreshedKms} />
      </div>
    );
    return explanationAndDataSubsection(explanation, data, 50);
  }
}

export default KillingMachineEfficiency;
