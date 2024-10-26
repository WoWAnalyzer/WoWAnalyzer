import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import SPECS from 'game/SPECS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  CastEvent,
  DamageEvent,
  EndChannelEvent,
  EventType,
  FightEndEvent,
  HealEvent,
} from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import Haste from 'parser/shared/modules/Haste';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import Statistic from 'parser/ui/Statistic';
import TalentSpellText from 'parser/ui/TalentSpellText';
import {
  CELESTIAL_CONDUIT_INCREASE_PER_TARGET,
  CELESTIAL_CONDUIT_MAX_DURATION,
  CELESTIAL_CONDUIT_MAX_TARGETS,
  MISTWEAVER_HEART_SPELLS,
  WINDWALKER_HEART_SPELLS,
} from '../constants';
import { CAST_BUFFER_MS } from 'analysis/retail/evoker/preservation/normalizers/EventLinking/constants';
import { getConduitEventGrouping } from '../normalizers/ConduitOfTheCelestialsEventLinks';
import { formatPercentage } from 'common/format';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import CooldownExpandable, {
  CooldownExpandableItem,
} from 'interface/guide/components/CooldownExpandable';
import { getAveragePerf, QualitativePerformance } from 'parser/ui/QualitativePerformance';
import SpellLink from 'interface/SpellLink';
import { PerformanceMark } from 'interface/guide';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';

interface CastInfo {
  cancelled: boolean;
  timestamp: number;
  // map talent to remaining cd before cast (-1 if not on cd)
  cooldownMap: Map<number, number> | undefined;
  // hits per pulse
  targetsHit: number[];
}

const LESS_IMPORTANT_CDR_SPELLS: Set<number> = new Set<number>([
  TALENTS_MONK.LIFE_COCOON_TALENT.id,
]);

class CelestialConduit extends Analyzer {
  static dependencies = {
    haste: Haste,
    spellUsable: SpellUsable,
  };

  protected haste!: Haste;
  protected spellUsable!: SpellUsable;
  damage: number = 0;
  damageHits: number = 0;
  healing: number = 0;
  healingHits: number = 0;
  cancelledCasts: number = 0;
  channelStart: number = 0;
  currentHaste: number = 0;
  healingIncreaseDataPoints: number[] = [];
  damageIncreaseDataPoints: number[] = [];
  castInfoList: CastInfo[] = [];

  constructor(options: Options) {
    super(options);
    this.active =
      this.selectedCombatant.hasTalent(TALENTS_MONK.CELESTIAL_CONDUIT_TALENT) &&
      this.selectedCombatant.spec === SPECS.MISTWEAVER_MONK;

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(TALENTS_MONK.CELESTIAL_CONDUIT_TALENT),
      this.onChannelStart,
    );
    this.addEventListener(
      Events.EndChannel.by(SELECTED_PLAYER).spell(TALENTS_MONK.CELESTIAL_CONDUIT_TALENT),
      this.onChannelEnd,
    );
    this.addEventListener(
      Events.EndChannel.by(SELECTED_PLAYER).spell(TALENTS_MONK.CELESTIAL_CONDUIT_TALENT),
      this.onUnityWithin,
    );

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.CELESTIAL_CONDUIT_DAMAGE),
      this.onDamage,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.CELESTIAL_CONDUIT_HEAL),
      this.onHeal,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.UNITY_WITHIN_CAST),
      this.onUnityWithin,
    );
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  private onDamage(event: DamageEvent) {
    this.onAction(event);
    this.damage += event.amount + (event.absorbed || 0);
  }

  private onHeal(event: HealEvent) {
    this.onAction(event);
    this.healing += event.amount + (event.absorbed || 0);
  }

  private getCooldownMap(): Map<number, number> {
    const result = new Map<number, number>();
    const spellList =
      this.selectedCombatant.spec === SPECS.MISTWEAVER_MONK
        ? MISTWEAVER_HEART_SPELLS
        : WINDWALKER_HEART_SPELLS;
    spellList.forEach((spellId) => {
      result.set(spellId, this.spellUsable.cooldownRemaining(spellId));
    });
    return result;
  }

  private onChannelStart(event: ApplyBuffEvent) {
    this.currentHaste = this.haste.current;
    this.channelStart = event.timestamp;
    this.castInfoList.push({
      cancelled: false,
      cooldownMap: undefined,
      targetsHit: [],
      timestamp: event.timestamp,
    });
  }

  private updateCastListCooldownMap() {
    if (!this.castInfoList.at(-1)?.cooldownMap) {
      this.castInfoList.at(-1)!.cooldownMap = this.getCooldownMap();
    }
  }

  private onUnityWithin(event: CastEvent | EndChannelEvent) {
    this.updateCastListCooldownMap();
  }

  private onFightEnd(event: FightEndEvent) {
    this.updateCastListCooldownMap();
  }

  private onChannelEnd(event: EndChannelEvent) {
    const actualChannelTime = event.timestamp - this.channelStart;
    const expectedChannelTime = CELESTIAL_CONDUIT_MAX_DURATION / (1 + this.currentHaste);

    if (actualChannelTime + CAST_BUFFER_MS < expectedChannelTime) {
      this.cancelledCasts += 1;
      this.castInfoList.at(-1)!.cancelled = true;
    }
  }

  private onAction(event: HealEvent | DamageEvent) {
    const groupHits = getConduitEventGrouping(event);
    if (!groupHits) {
      return;
    }
    const totalHits = groupHits.length + 1;
    const increase =
      CELESTIAL_CONDUIT_INCREASE_PER_TARGET * Math.min(totalHits, CELESTIAL_CONDUIT_MAX_TARGETS);
    // prepull
    if (!this.castInfoList.length) {
      this.castInfoList.push({
        cancelled: false,
        cooldownMap: undefined,
        targetsHit: [],
        timestamp: event.timestamp,
      });
    }
    if (event.type === EventType.Heal) {
      this.healingIncreaseDataPoints.push(increase);
      this.castInfoList.at(-1)!.targetsHit.push(totalHits);
    } else {
      this.damageIncreaseDataPoints.push(increase);
    }
  }

  private getTargetsHitPerf(targetsHit: number): QualitativePerformance {
    if (targetsHit >= 5) {
      return QualitativePerformance.Good;
    } else if (targetsHit >= 4) {
      return QualitativePerformance.Ok;
    }
    return QualitativePerformance.Fail;
  }

  private getChecklistForCast(castInfo: CastInfo): {
    perf: QualitativePerformance;
    items: CooldownExpandableItem[];
  } {
    const cancelPerf = castInfo.cancelled
      ? QualitativePerformance.Fail
      : QualitativePerformance.Good;
    const cancelledItem: CooldownExpandableItem = {
      label: <>Fully channeled cast</>,
      result: (
        <>
          <PerformanceMark perf={cancelPerf} />
        </>
      ),
      details: <>{castInfo.cancelled ? 'No' : 'Yes'}</>,
    };
    const cooldownPerfs: QualitativePerformance[] = [];
    const cooldownItems: CooldownExpandableItem[] = [];
    castInfo.cooldownMap!.forEach((cooldown, spellId) => {
      const perf =
        cooldown === 0
          ? LESS_IMPORTANT_CDR_SPELLS.has(spellId)
            ? QualitativePerformance.Ok
            : QualitativePerformance.Fail
          : QualitativePerformance.Good;
      cooldownPerfs.push(perf);
      cooldownItems.push({
        label: (
          <>
            <SpellLink spell={spellId} /> on cooldown when casting{' '}
            <SpellLink spell={TALENTS_MONK.UNITY_WITHIN_TALENT} />
          </>
        ),
        result: (
          <>
            <PerformanceMark perf={perf} />
          </>
        ),
        details: <>{cooldown === 0 ? 'No' : 'Yes'}</>,
      });
    });
    const avgTargetsHit =
      castInfo.targetsHit.length > 0
        ? castInfo.targetsHit.reduce((prev, cur) => {
            return prev + cur;
          }) / castInfo.targetsHit.length
        : 0;

    const targetHitPerf = this.getTargetsHitPerf(avgTargetsHit);
    const targetsHitItem: CooldownExpandableItem = {
      label: <>Average targets hit per pulse</>,
      result: (
        <>
          <PerformanceMark perf={targetHitPerf} />
        </>
      ),
      details: <>{avgTargetsHit.toFixed(1)} </>,
    };
    return {
      perf: getAveragePerf([cancelPerf, ...cooldownPerfs, targetHitPerf]),
      items: [cancelledItem, ...cooldownItems, targetsHitItem],
    };
  }

  get avgHealIncrease() {
    return (
      this.healingIncreaseDataPoints.reduce((sum, cur) => (sum += cur), 0) /
      this.healingIncreaseDataPoints.length
    );
  }

  get avgDmgIncrease() {
    return (
      this.damageIncreaseDataPoints.reduce((sum, cur) => (sum += cur), 0) /
      this.damageIncreaseDataPoints.length
    );
  }

  get guideCastBreakdown() {
    const explanationPercent = 47.5;
    const explanation = (
      <p>
        <strong>
          <SpellLink spell={TALENTS_MONK.CELESTIAL_CONDUIT_TALENT} />
        </strong>
        <br />
        Before casting <SpellLink spell={TALENTS_MONK.CELESTIAL_CONDUIT_TALENT} />, make sure that
        all spells reduced by <SpellLink spell={TALENTS_MONK.HEART_OF_THE_JADE_SERPENT_TALENT} />{' '}
        are on cooldown so that the extra CDR granted when casting{' '}
        <SpellLink spell={TALENTS_MONK.UNITY_WITHIN_TALENT} /> is not wasted. Additionally, make
        sure to never cancel the spell and to hit at least 5 targets in order to get the maximum
        healing/damage buff (up to 30%).
      </p>
    );

    const data = (
      <div>
        <strong>Per-Cast Breakdown</strong>
        <small> - click to expand</small>
        {this.castInfoList.map((cast, ix) => {
          const header = (
            <>
              @ {this.owner.formatTimestamp(cast.timestamp)} &mdash;{' '}
              <SpellLink spell={TALENTS_MONK.CELESTIAL_CONDUIT_TALENT} />
            </>
          );
          const analysis = this.getChecklistForCast(cast);
          return (
            <CooldownExpandable
              header={header}
              checklistItems={analysis.items}
              perf={analysis.perf}
              key={ix}
            />
          );
        })}
      </div>
    );

    return explanationAndDataSubsection(explanation, data, explanationPercent);
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        size="flexible"
        position={STATISTIC_ORDER.CORE(0)}
        tooltip={
          <ul>
            <li>Casts cancelled early: {this.cancelledCasts}</li>
            <li>Average healing increase: {formatPercentage(this.avgHealIncrease)}%</li>
            <li>Average damage increase: {formatPercentage(this.avgDmgIncrease)}%</li>
          </ul>
        }
      >
        <TalentSpellText talent={TALENTS_MONK.CELESTIAL_CONDUIT_TALENT}>
          <ItemDamageDone amount={this.damage} />
          <div></div>
          <ItemHealingDone amount={this.healing} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default CelestialConduit;
