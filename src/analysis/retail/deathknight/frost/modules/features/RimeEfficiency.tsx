import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/deathknight';
import { SpellLink } from 'interface';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import GradiatedPerformanceBar from 'interface/guide/components/GradiatedPerformanceBar';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  GlobalCooldownEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const LAG_BUFFER_MS = 100;
const BUFF_DURATION_SEC = 15;

class RimeEfficiency extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  rimeProcs: number = 0;
  lastGCDTime: number = 0;
  lastGCDDuration: number = 0;
  lastProcTime: number = 0;
  refreshedRimeProcs: number = 0;
  expiredRimeProcs: number = 0;

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.RIME),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.RIME),
      this.onRemoveBuff,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.RIME),
      this.onRefreshBuff,
    );
    this.addEventListener(Events.GlobalCooldown, this.onGlobalCooldown);
  }

  onApplyBuff(event: ApplyBuffEvent) {
    this.rimeProcs += 1;
    this.lastProcTime = event.timestamp;
  }

  onRemoveBuff(event: RemoveBuffEvent) {
    const durationHeld = event.timestamp - this.lastProcTime;
    if (durationHeld > BUFF_DURATION_SEC * 1000) {
      this.expiredRimeProcs += 1;
    }
  }

  onRefreshBuff(event: RefreshBuffEvent) {
    const timeSinceGCD = event.timestamp - this.lastGCDTime;
    if (timeSinceGCD < this.lastGCDDuration + LAG_BUFFER_MS) {
      return;
    }
    this.refreshedRimeProcs += 1;
  }

  onGlobalCooldown(event: GlobalCooldownEvent) {
    this.lastGCDTime = event.timestamp;
    this.lastGCDDuration = event.duration;
  }

  get totalWastedProcs() {
    return this.refreshedRimeProcs + this.expiredRimeProcs;
  }

  get wastedProcRate() {
    return this.totalWastedProcs / this.rimeProcs;
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
        <>
          {' '}
          You are wasting <SpellLink id={SPELLS.RIME.id} /> procs. You should be casting{' '}
          <SpellLink id={talents.HOWLING_BLAST_TALENT.id} /> as soon as possible when you have a
          Rime proc to avoid wasting it.
        </>,
      )
        .icon(SPELLS.RIME.icon)
        .actual(
          t({
            id: 'deathknight.frost.suggestions.rime.wastedProcs',
            message: `${formatPercentage(
              this.wastedProcRate,
            )}% of Rime procs were either refreshed and lost or expired without being used`,
          }),
        )
        .recommended(`<${recommended} is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(5)}
        size="flexible"
        tooltip={`You wasted ${this.totalWastedProcs} out of ${
          this.rimeProcs
        } Rime procs (${formatPercentage(this.wastedProcRate)}%).  ${
          this.expiredRimeProcs
        } procs expired without being used and ${
          this.refreshedRimeProcs
        } procs were overwritten by new procs.`}
      >
        <BoringSpellValueText spellId={SPELLS.RIME.id}>
          <>
            {formatPercentage(this.efficiency)} % <small>efficiency</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }

  get guideSubsection(): JSX.Element {
    const goodRimes = {
      count: this.rimeProcs - this.expiredRimeProcs - this.refreshedRimeProcs,
      label: 'Consumed Rimes',
    };

    const refreshedRimes = {
      count: this.refreshedRimeProcs,
      label: 'Refreshed Rimes',
    };

    const expiredRimes = {
      count: this.expiredRimeProcs,
      label: 'Expired Rimes',
    };

    const explanation = (
      <p>
        <strong>
          <SpellLink id={talents.RIME_TALENT.id} />
        </strong>{' '}
        turns <SpellLink id={talents.HOWLING_BLAST_TALENT.id} /> from a weak ability you only use to
        apply Frost Fever to a powerful spell that jumps to the top of the priority list. This is
        especially true if <SpellLink id={talents.AVALANCHE_TALENT.id} /> or{' '}
        <SpellLink id={talents.ICEBREAKER_TALENT.id} /> are talented. Rime has a chance to proc
        whenever cast <SpellLink id={talents.OBLITERATE_TALENT.id} /> and you can use this to
        prevent refreshing the proc by making sure to consume Rime before casting Obliterate. You
        should aim to consume as many Rimes as you can, only ignoring it during certain periods of
        the main CD window.
      </p>
    );

    const data = (
      <div>
        <strong>Rime breakdown</strong>
        <GradiatedPerformanceBar good={goodRimes} ok={refreshedRimes} bad={expiredRimes} />
      </div>
    );

    return explanationAndDataSubsection(explanation, data, 50);
  }
}

export default RimeEfficiency;
