import type { JSX } from 'react';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import GuideSection from 'interface/guide/components/GuideSection';
import { consumedComboBreaker } from 'analysis/retail/monk/windwalker/normalizers/ComboBreakerCastLinkNormalizer';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  CastEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
} from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import { TALENTS_MONK } from 'common/TALENTS';
import windwalkerApl from '../apl/WindwalkerApl';
import AplProcWindowDetail from '../core/AplProcWindowDetail';
import { buildAplProcWindows, type AplProcWindow } from '../core/aplProcWindows';

const COMBO_BREAKER_PROC_CHANCE = 0.08;
const MEMORY_OF_THE_MONASTERY_BONUS = 1.75;
const COMBO_BREAKER_MAX_STACKS = 2;
const COMBO_BREAKER_SPENDER_IDS = [SPELLS.BLACKOUT_KICK.id, SPELLS.BLACKOUT_KICK_TOTM.id];

class ComboBreaker extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  protected abilityTracker!: AbilityTracker;

  CBProcsTotal = 0;
  currentCBStacks = 0;
  lastCBGainTime: number | null = null;
  consumedCBProc = 0;
  overwrittenCBProc = 0;
  expiredCBProc = 0;
  riskyTP = 0;
  overcappedTimestamps: number[] = [];
  expiredTimestamps: number[] = [];
  private comboBreakerWindows?: AplProcWindow[];

  constructor(options: Options) {
    super(options);
    this.active =
      this.selectedCombatant.hasTalent(TALENTS_MONK.COMBO_BREAKER_TALENT) ||
      this.selectedCombatant.hasTalent(TALENTS_MONK.SEQUENCED_STRIKES_TALENT);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.COMBO_BREAKER_BUFF),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.COMBO_BREAKER_BUFF),
      this.onRefreshBuff,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.COMBO_BREAKER_BUFF),
      this.onApplyBuffStack,
    );
    this.addEventListener(
      Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.COMBO_BREAKER_BUFF),
      this.onRemoveBuffStack,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.COMBO_BREAKER_BUFF),
      this.onRemoveBuff,
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.TIGER_PALM), this.onTPCast);
  }

  trackGeneratedProcs(procs: number, timestamp: number) {
    if (procs <= 0) {
      return;
    }

    const availableStacks = COMBO_BREAKER_MAX_STACKS - this.currentCBStacks;
    const gainedProcs = Math.min(procs, availableStacks);
    const wastedProcs = procs - gainedProcs;

    this.CBProcsTotal += procs;
    this.currentCBStacks += gainedProcs;
    this.overwrittenCBProc += wastedProcs;
    if (wastedProcs > 0) {
      this.overcappedTimestamps.push(timestamp);
    }
    this.lastCBGainTime = timestamp;
  }

  onApplyBuff(event: ApplyBuffEvent) {
    this.trackGeneratedProcs(1, event.timestamp);
  }

  onRefreshBuff(event: RefreshBuffEvent) {
    this.trackGeneratedProcs(1, event.timestamp);
  }

  onApplyBuffStack(event: ApplyBuffStackEvent) {
    this.trackGeneratedProcs(Math.max(0, event.stack - this.currentCBStacks), event.timestamp);
  }

  onRemoveBuffStack(event: RemoveBuffStackEvent) {
    const spentProcs = Math.max(0, this.currentCBStacks - event.stack);
    if (consumedComboBreaker(event)) {
      this.consumedCBProc += spentProcs;
    }
    this.currentCBStacks = event.stack;
    if (this.currentCBStacks === 0) {
      this.lastCBGainTime = null;
    }
  }

  onRemoveBuff(event: RemoveBuffEvent) {
    if (this.currentCBStacks === 0) {
      return;
    }

    if (consumedComboBreaker(event)) {
      this.consumedCBProc += this.currentCBStacks;
    } else {
      this.expiredCBProc += this.currentCBStacks;
      if (this.currentCBStacks > 0) {
        this.expiredTimestamps.push(event.timestamp);
      }
    }

    this.currentCBStacks = 0;
    this.lastCBGainTime = null;
  }

  onTPCast(event: CastEvent) {
    if (this.currentCBStacks < COMBO_BREAKER_MAX_STACKS || this.lastCBGainTime === null) {
      return;
    }
    if (this.lastCBGainTime !== event.timestamp) {
      this.riskyTP += 1;
    }
  }

  get usedCBProcs() {
    return this.CBProcsTotal > 0 ? this.consumedCBProc / this.CBProcsTotal : 0;
  }

  get tigerPalmProcChance() {
    return this.selectedCombatant.hasTalent(TALENTS_MONK.MEMORY_OF_THE_MONASTERY_TALENT)
      ? COMBO_BREAKER_PROC_CHANCE * MEMORY_OF_THE_MONASTERY_BONUS
      : COMBO_BREAKER_PROC_CHANCE;
  }

  get suggestionThresholds() {
    return {
      actual: this.usedCBProcs,
      isLessThan: {
        minor: 0.9,
        average: 0.8,
        major: 0.7,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  statistic() {
    const averageCBProcs =
      this.abilityTracker.getAbility(SPELLS.TIGER_PALM.id).casts * this.tigerPalmProcChance;
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(6)}
        size="flexible"
        tooltip={
          <>
            You got a total of <strong>{this.CBProcsTotal} Combo Breaker procs</strong> and{' '}
            <strong>used {this.consumedCBProc}</strong> of them.{' '}
            <strong>{this.overwrittenCBProc}</strong> were overcapped and{' '}
            <strong>{this.expiredCBProc}</strong> expired unused. The average expected number of
            procs from your Tiger Palms this fight is <strong>{averageCBProcs.toFixed(2)}</strong>,
            and you got <strong>{this.CBProcsTotal}</strong>.
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.COMBO_BREAKER_BUFF}>
          {formatPercentage(this.usedCBProcs, 0)}% <small>Proc utilization</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }

  private getWindows() {
    if (!this.comboBreakerWindows) {
      this.comboBreakerWindows = this.buildComboBreakerWindows();
    }
    return this.comboBreakerWindows;
  }

  private buildComboBreakerWindows(): AplProcWindow[] {
    return buildAplProcWindows({
      apl: windwalkerApl(this.owner.info),
      info: this.owner.info,
      events: this.owner.eventHistory,
      selectedCombatantId: this.selectedCombatant.id,
      buffSpellId: SPELLS.COMBO_BREAKER_BUFF.id,
      readySpellId: SPELLS.BLACKOUT_KICK.id,
      maxStacks: COMBO_BREAKER_MAX_STACKS,
      shouldReportCast: (event: CastEvent) =>
        event.ability.guid !== SPELLS.MELEE.id &&
        event.ability.guid !== SPELLS.FORTIFYING_BREW_CAST.id &&
        event.ability.guid !== SPELLS.TOUCH_OF_KARMA_CAST.id,
      isConsumeCast: (event: CastEvent) => COMBO_BREAKER_SPENDER_IDS.includes(event.ability.guid),
      isConsumedByEvent: (event: RemoveBuffEvent | RemoveBuffStackEvent) =>
        consumedComboBreaker(event),
    });
  }

  private classifyWindow(window: AplProcWindow) {
    if (window.resolution !== 'consumed' || window.spentCastAt === undefined) {
      return {
        performance: QualitativePerformance.Fail,
        summary: 'Proc was not consumed',
      };
    }

    const firstTopOpportunity = window.sequence.find(
      (cast) => cast.aplExpectedBefore[0]?.id === SPELLS.BLACKOUT_KICK.id,
    );

    if (
      window.resolveExpected[0]?.id === SPELLS.BLACKOUT_KICK.id &&
      firstTopOpportunity !== undefined &&
      COMBO_BREAKER_SPENDER_IDS.includes(firstTopOpportunity.spellId) &&
      firstTopOpportunity.timestamp === window.spentCastAt
    ) {
      return {
        performance: QualitativePerformance.Perfect,
        summary: 'Blackout Kick was consumed the first time the APL expected it',
      };
    }

    if (window.resolveExpected.some((spell) => spell.id === SPELLS.BLACKOUT_KICK.id)) {
      return {
        performance: QualitativePerformance.Good,
        summary: 'Blackout Kick was consumed in an acceptable APL spot',
      };
    }

    return {
      performance: QualitativePerformance.Ok,
      summary: 'Blackout Kick was consumed, even though the APL did not prefer it yet',
    };
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <>
        <p>
          The <SpellLink spell={SPELLS.COMBO_BREAKER_BUFF} /> buff makes your next cast of{' '}
          <SpellLink spell={SPELLS.BLACKOUT_KICK} /> free. It is generated by consumed{' '}
          <SpellLink spell={SPELLS.DANCE_OF_CHI_JI_BUFF} /> stacks and by{' '}
          <SpellLink spell={SPELLS.TIGER_PALM} />, which has an 8% chance to trigger it from{' '}
          <SpellLink spell={SPELLS.COMBO_BREAKER} />.{' '}
          {this.selectedCombatant.hasTalent(TALENTS_MONK.MEMORY_OF_THE_MONASTERY_TALENT) && (
            <>
              With <SpellLink spell={TALENTS_MONK.MEMORY_OF_THE_MONASTERY_TALENT} />, that{' '}
              <SpellLink spell={SPELLS.TIGER_PALM} /> proc chance is increased by 75%, which raises
              the chance from 8% to {formatPercentage(this.tigerPalmProcChance, 0)}%.
            </>
          )}
        </p>
        <p>
          <SpellLink spell={SPELLS.BLACKOUT_KICK} /> and <SpellLink spell={SPELLS.COMBO_BREAKER} />{' '}
          refer to the same proc effect here, so this section treats them as the same buff state.
        </p>
        <p>
          This section is about timing, not raw proc speed. Use{' '}
          <SpellLink spell={SPELLS.BLACKOUT_KICK} /> once it rises to the top of the suggested APL,
          not just because the buff is active.
        </p>
        <p>
          Spend before incoming <SpellLink spell={SPELLS.TIGER_PALM} /> casts or a planned{' '}
          <SpellLink spell={SPELLS.DANCE_OF_CHI_JI_BUFF} /> consume would cap you. Holding briefly
          is fine, but sitting at {COMBO_BREAKER_MAX_STACKS} stacks for long usually means you are
          drifting outside the intended sequence.
        </p>
      </>
    );
    return (
      <GuideSection
        spell={SPELLS.COMBO_BREAKER_BUFF}
        title="Combo Breaker"
        explanation={explanation}
        explanationPercent={34}
      >
        <AplProcWindowDetail
          title="Combo Breaker"
          windows={this.getWindows()}
          actionSpell={SPELLS.BLACKOUT_KICK}
          actionSpellIds={COMBO_BREAKER_SPENDER_IDS}
          formatTimestamp={(timestamp) => this.owner.formatTimestamp(timestamp)}
          classifyWindow={(window) => this.classifyWindow(window)}
        />
        <div style={{ display: 'grid', gap: '0.75rem', marginTop: '0.75rem' }}>
          <div
            style={{
              padding: '10px 12px',
              borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(0,0,0,0.16)',
              display: 'grid',
              gap: '0.4rem',
            }}
          >
            <div style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 700 }}>
              Risky Tiger Palm Casts
            </div>
            <div>
              <b>{this.riskyTP}</b> casts of <SpellLink spell={SPELLS.TIGER_PALM} /> were made at{' '}
              {COMBO_BREAKER_MAX_STACKS} stacks without actually overcapping. These casts are still
              risky because the next proc source could easily have turned them into wasted value.
            </div>
          </div>
        </div>
      </GuideSection>
    );
  }
}

export default ComboBreaker;
