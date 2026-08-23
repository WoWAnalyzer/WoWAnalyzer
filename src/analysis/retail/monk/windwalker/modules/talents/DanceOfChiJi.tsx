import type { JSX } from 'react';
import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import GuideSection from 'interface/guide/components/GuideSection';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  CastEvent,
  DamageEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
} from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { TALENTS_MONK } from 'common/TALENTS';
import { addEnhancedCastReason } from 'parser/core/EventMetaLib';
import { consumedDanceOfChiJi } from '../../normalizers/DanceOfChiJiCastLinkNormalizer';
import AplProcWindowDetail from '../core/AplProcWindowDetail';
import { buildAplProcWindows, type AplProcWindow } from '../core/aplProcWindows';
import windwalkerApl from '../apl/WindwalkerApl';

const DAMAGE_MODIFIER = 1;
const STORM_EARTH_AND_FIRE_CAST_BUFFER = 200;
const DANCE_OF_CHI_JI_MAX_STACKS = 2;

class DANCE_OF_CHI_JI extends Analyzer {
  buffedCast = false;
  damageGain = 0;
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
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.DANCE_OF_CHI_JI_WINDWALKER_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.DANCE_OF_CHI_JI_BUFF),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.DANCE_OF_CHI_JI_BUFF),
      this.onRefreshBuff,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.DANCE_OF_CHI_JI_BUFF),
      this.onApplyBuffStack,
    );
    this.addEventListener(
      Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.DANCE_OF_CHI_JI_BUFF),
      this.onRemoveBuffStack,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.DANCE_OF_CHI_JI_BUFF),
      this.onRemoveBuff,
    );
    this.addEventListener(
      Events.damage
        .by(SELECTED_PLAYER | SELECTED_PLAYER_PET)
        .spell(SPELLS.SPINNING_CRANE_KICK_DAMAGE),
      this.onSpinningCraneKickDamage,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER | SELECTED_PLAYER_PET).spell(SPELLS.SPINNING_CRANE_KICK),
      this.onSpinningCraneKickCast,
    );
  }

  private trackGeneratedProcs(procs: number, timestamp: number) {
    if (procs <= 0) {
      return;
    }

    const availableStacks = DANCE_OF_CHI_JI_MAX_STACKS - this.currentStacks;
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
    if (consumedDanceOfChiJi(event)) {
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

    if (consumedDanceOfChiJi(event)) {
      this.consumedProcs += this.currentStacks;
    } else {
      this.expiredProcs += this.currentStacks;
      if (this.currentStacks > 0) {
        this.expiredTimestamps.push(event.timestamp);
      }
    }

    this.currentStacks = 0;
  }

  onSpinningCraneKickDamage(event: DamageEvent) {
    const bonusDamage = this.buffedCast ? calculateEffectiveDamage(event, DAMAGE_MODIFIER) : 0;
    this.damageGain += bonusDamage;
  }

  onSpinningCraneKickCast(event: CastEvent) {
    if (
      this.selectedCombatant.hasBuff(
        SPELLS.DANCE_OF_CHI_JI_BUFF.id,
        null,
        STORM_EARTH_AND_FIRE_CAST_BUFFER,
      )
    ) {
      this.buffedCast = true;
      addEnhancedCastReason(
        event,
        <>
          This cast was empowered by <SpellLink spell={SPELLS.DANCE_OF_CHI_JI_BUFF} />
        </>,
      );
    } else {
      // GCD is shorter than the duration SCK deals damage, and new SCK casts override any ongoing SCK cast, so this prevents a directly following from being marked as benefitting
      this.buffedCast = false;
    }
  }

  get dps() {
    return (this.damageGain / this.owner.fightDuration) * 1000;
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
        buffSpellId: SPELLS.DANCE_OF_CHI_JI_BUFF.id,
        readySpellId: SPELLS.SPINNING_CRANE_KICK.id,
        maxStacks: DANCE_OF_CHI_JI_MAX_STACKS,
        shouldReportCast: (event: CastEvent) =>
          event.ability.guid !== SPELLS.MELEE.id &&
          event.ability.guid !== SPELLS.FORTIFYING_BREW_CAST.id &&
          event.ability.guid !== SPELLS.TOUCH_OF_KARMA_CAST.id,
        isConsumeCast: (event: CastEvent) => event.ability.guid === SPELLS.SPINNING_CRANE_KICK.id,
        isConsumedByEvent: (event: RemoveBuffEvent | RemoveBuffStackEvent) =>
          consumedDanceOfChiJi(event),
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
      (cast) => cast.aplExpectedBefore[0]?.id === SPELLS.SPINNING_CRANE_KICK.id,
    );

    if (
      window.resolveExpected[0]?.id === SPELLS.SPINNING_CRANE_KICK.id &&
      firstTopOpportunity?.spellId === SPELLS.SPINNING_CRANE_KICK.id &&
      firstTopOpportunity.timestamp === window.spentCastAt
    ) {
      return {
        performance: QualitativePerformance.Perfect,
        summary: 'Spinning Crane Kick was consumed the first time the APL expected it',
      };
    }

    if (window.resolveExpected.some((spell) => spell.id === SPELLS.SPINNING_CRANE_KICK.id)) {
      return {
        performance: QualitativePerformance.Good,
        summary: 'Dance of Chi-Ji was consumed in an acceptable APL spot',
      };
    }

    return {
      performance: QualitativePerformance.Ok,
      summary: 'Dance of Chi-Ji was consumed, even though the APL did not prefer it yet',
    };
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(11)}
        size="flexible"
        tooltip={
          <>
            <div>Total damage increase: {formatNumber(this.damageGain)}</div>
            <div>
              You used {this.consumedProcs} of {this.totalProcs} Dance of Chi-Ji procs.
            </div>
            <div>
              {this.overcappedProcs} were overcapped and {this.expiredProcs} expired unused.
            </div>
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS_MONK.DANCE_OF_CHI_JI_WINDWALKER_TALENT}>
          <img src="img/sword.png" alt="Damage" className="icon" /> {formatNumber(this.dps)} DPS{' '}
          <small>
            {formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.damageGain))} % of
            total
          </small>
        </BoringSpellValueText>
      </Statistic>
    );
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <>
        <p>
          The <SpellLink spell={TALENTS_MONK.DANCE_OF_CHI_JI_WINDWALKER_TALENT} /> talent gives your
          Chi spenders a chance to grant a free cast of{' '}
          <SpellLink spell={SPELLS.SPINNING_CRANE_KICK} /> at roughly one proc per minute.
        </p>
        <p>
          Follow the suggested APL and spend this proc before it expires or before staying capped
          long enough for another Chi spender to waste a future proc. Holding briefly is fine, but
          the goal is still to convert it cleanly inside the normal rotation.
        </p>
        <p>
          Because consuming <SpellLink spell={SPELLS.DANCE_OF_CHI_JI_BUFF} /> also guarantees a{' '}
          <SpellLink spell={SPELLS.COMBO_BREAKER_BUFF} /> stack, spending it should be planned with
          your current <SpellLink spell={SPELLS.COMBO_BREAKER_BUFF} /> stacks in mind so you do not
          immediately force a new overcap there.
        </p>
      </>
    );
    return (
      <GuideSection
        spell={SPELLS.DANCE_OF_CHI_JI_BUFF}
        title="Dance of Chi-Ji"
        explanation={explanation}
        explanationPercent={34}
      >
        <AplProcWindowDetail
          title="Dance of Chi-Ji"
          windows={this.getWindows()}
          actionSpell={SPELLS.SPINNING_CRANE_KICK}
          formatTimestamp={(timestamp) => this.owner.formatTimestamp(timestamp)}
          classifyWindow={(window) => this.classifyWindow(window)}
        />
      </GuideSection>
    );
  }
}

export default DANCE_OF_CHI_JI;
