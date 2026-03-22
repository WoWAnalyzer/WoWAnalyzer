import type { JSX } from 'react';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink } from 'interface';
import GuideSection from 'interface/guide/components/GuideSection';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  CastEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
} from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { consumedRushingWindKick } from '../../normalizers/RushingWindKickCastLinkNormalizer';
import AplProcWindowDetail from '../core/AplProcWindowDetail';
import { buildAplProcWindows, type AplProcWindow } from '../core/aplProcWindows';
import windwalkerApl from '../apl/WindwalkerApl';

const RUSHING_WIND_KICK_PROC_CHANCE = 0.6;
const RUSHING_WIND_KICK_MAX_STACKS = 1;

class RushingWindKick extends Analyzer {
  totalProcs = 0;
  currentStacks = 0;
  consumedProcs = 0;
  overcappedProcs = 0;
  expiredProcs = 0;
  overcappedTimestamps: number[] = [];
  expiredTimestamps: number[] = [];
  private procWindows?: AplProcWindow[];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(
      TALENTS_MONK.RUSHING_WIND_KICK_WINDWALKER_TALENT,
    );
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.RUSHING_WIND_KICK_BUFF),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.RUSHING_WIND_KICK_BUFF),
      this.onRefreshBuff,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.RUSHING_WIND_KICK_BUFF),
      this.onApplyBuffStack,
    );
    this.addEventListener(
      Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.RUSHING_WIND_KICK_BUFF),
      this.onRemoveBuffStack,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.RUSHING_WIND_KICK_BUFF),
      this.onRemoveBuff,
    );
  }

  private trackGeneratedProcs(procs: number, timestamp: number) {
    if (procs <= 0) {
      return;
    }

    const availableStacks = RUSHING_WIND_KICK_MAX_STACKS - this.currentStacks;
    const gainedProcs = Math.min(procs, availableStacks);
    const wastedProcs = procs - gainedProcs;

    this.totalProcs += procs;
    this.currentStacks += gainedProcs;
    this.overcappedProcs += wastedProcs;
    if (wastedProcs > 0) {
      this.overcappedTimestamps.push(timestamp);
    }
  }

  onApplyBuff(event: ApplyBuffEvent) {
    this.trackGeneratedProcs(1, event.timestamp);
  }

  onRefreshBuff(event: RefreshBuffEvent) {
    this.trackGeneratedProcs(1, event.timestamp);
  }

  onApplyBuffStack(event: ApplyBuffStackEvent) {
    this.trackGeneratedProcs(Math.max(0, event.stack - this.currentStacks), event.timestamp);
  }

  onRemoveBuffStack(event: RemoveBuffStackEvent) {
    const spentProcs = Math.max(0, this.currentStacks - event.stack);
    if (consumedRushingWindKick(event)) {
      this.consumedProcs += spentProcs;
    } else {
      this.expiredProcs += spentProcs;
      if (spentProcs > 0) {
        this.expiredTimestamps.push(event.timestamp);
      }
    }
    this.currentStacks = event.stack;
  }

  onRemoveBuff(event: RemoveBuffEvent) {
    if (this.currentStacks === 0) {
      return;
    }

    if (consumedRushingWindKick(event)) {
      this.consumedProcs += this.currentStacks;
    } else {
      this.expiredProcs += this.currentStacks;
      this.expiredTimestamps.push(event.timestamp);
    }

    this.currentStacks = 0;
  }

  get usedProcs() {
    return this.totalProcs > 0 ? this.consumedProcs / this.totalProcs : 0;
  }

  private getWindows() {
    if (!this.procWindows) {
      this.procWindows = buildAplProcWindows({
        apl: windwalkerApl(this.owner.info),
        info: this.owner.info,
        events: this.owner.eventHistory,
        selectedCombatantId: this.selectedCombatant.id,
        buffSpellId: SPELLS.RUSHING_WIND_KICK_BUFF.id,
        readySpellId: SPELLS.RUSHING_WIND_KICK_CAST.id,
        maxStacks: RUSHING_WIND_KICK_MAX_STACKS,
        shouldReportCast: (event: CastEvent) =>
          event.ability.guid !== SPELLS.MELEE.id &&
          event.ability.guid !== SPELLS.FORTIFYING_BREW_CAST.id &&
          event.ability.guid !== SPELLS.TOUCH_OF_KARMA_CAST.id,
        isConsumeCast: (event: CastEvent) =>
          event.ability.guid === SPELLS.RUSHING_WIND_KICK_CAST.id,
        isConsumedByEvent: (event: RemoveBuffEvent | RemoveBuffStackEvent) =>
          consumedRushingWindKick(event),
      });
    }
    return this.procWindows;
  }

  private classifyWindow(window: AplProcWindow) {
    if (window.resolution !== 'consumed' || window.spentCastAt === undefined) {
      return {
        performance: QualitativePerformance.Fail,
        summary: 'Proc was not consumed',
      };
    }

    const firstTopOpportunity = window.sequence.find(
      (cast) => cast.aplExpectedBefore[0]?.id === SPELLS.RUSHING_WIND_KICK_CAST.id,
    );

    if (
      window.resolveExpected[0]?.id === SPELLS.RUSHING_WIND_KICK_CAST.id &&
      firstTopOpportunity?.spellId === SPELLS.RUSHING_WIND_KICK_CAST.id &&
      firstTopOpportunity.timestamp === window.spentCastAt
    ) {
      return {
        performance: QualitativePerformance.Perfect,
        summary: 'Rushing Wind Kick was consumed the first time the APL expected it',
      };
    }

    if (window.resolveExpected.some((spell) => spell.id === SPELLS.RUSHING_WIND_KICK_CAST.id)) {
      return {
        performance: QualitativePerformance.Good,
        summary: 'Rushing Wind Kick was consumed in an acceptable APL spot',
      };
    }

    return {
      performance: QualitativePerformance.Ok,
      summary: 'Rushing Wind Kick was consumed, even though the APL did not prefer it yet',
    };
  }

  statistic() {
    return (
      <Statistic position={STATISTIC_ORDER.CORE(12)} size="flexible">
        <BoringSpellValueText spell={TALENTS_MONK.RUSHING_WIND_KICK_WINDWALKER_TALENT}>
          {formatPercentage(this.usedProcs, 0)}% <small>Proc utilization</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <>
        <p>
          The <SpellLink spell={TALENTS_MONK.RUSHING_WIND_KICK_WINDWALKER_TALENT} /> talent gives
          consumed <SpellLink spell={SPELLS.COMBO_BREAKER_BUFF} /> stacks a 60% chance to make your
          next cast of <SpellLink spell={SPELLS.RUSHING_WIND_KICK_CAST} /> available.
        </p>
        <p>
          Follow the suggested APL and use this proc before another consumed{' '}
          <SpellLink spell={SPELLS.COMBO_BREAKER_BUFF} /> could replace it or before it expires.
          Holding briefly is fine, but this is still a proc you want converted cleanly inside the
          normal rotation.
        </p>
      </>
    );

    return (
      <GuideSection
        spell={SPELLS.RUSHING_WIND_KICK_CAST}
        title="Rushing Wind Kick"
        explanation={explanation}
        explanationPercent={34}
      >
        <AplProcWindowDetail
          title="Rushing Wind Kick"
          windows={this.getWindows()}
          actionSpell={SPELLS.RUSHING_WIND_KICK_CAST}
          formatTimestamp={(timestamp) => this.owner.formatTimestamp(timestamp)}
          classifyWindow={(window) => this.classifyWindow(window)}
        />
      </GuideSection>
    );
  }
}

export default RushingWindKick;
