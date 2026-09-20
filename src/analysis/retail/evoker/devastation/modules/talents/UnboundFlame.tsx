import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/evoker';
import SPELLS from 'common/SPELLS/evoker';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  DamageEvent,
  EventType,
  RefreshBuffEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
} from 'parser/core/Events';
import {
  EBSource,
  isEBFrom,
} from 'analysis/retail/evoker/shared/modules/normalizers/EssenceBurstCastLinkNormalizer';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { AnalysisData } from '../../../shared/modules/components/ProcAnalysis';
import { isFromUnboundFlameConsume } from '../normalizers/CastLinkNormalizer';
import ProcBuffAnalyzer, {
  AnalyzerOptions,
} from 'analysis/retail/evoker/shared/modules/core/ProcBuffAnalyzer';

const ProcBuffOptions: AnalyzerOptions = {
  trackedBuffs: [SPELLS.UNBOUND_FLAME_BUFF],
  inactiveListeners: {},
};

/**
 * (1) While Dragonrage is active you gain Rising Fury every 6 sec, increasing your haste by 4%, stacking up to 5 times.
 *
 * (2) At 5 stacks of Rising Fury, all damage dealt is increased by 8%.
 *
 * (3) At 5 stacks of Rising Fury, all damage dealt is increased by 15%.
 *
 * (4) When Dragonrage ends, Rising Fury persists for 4 sec per stack, and Dragonrage becomes Unbound Flame. Unbound Flame may be cast 4 times before Dragonrage
 * finishes its cooldown.
 * Unbound Flame
 * Exhale destructive flame, critically striking for [(800% of Spell Power) * 2] Fire damage to your target and nearby enemies, reduced beyond 5 targets.
 * Causes 1 Essence Burst
 */
class UnboundFlame extends ProcBuffAnalyzer {
  private statsUnboundFlame = {
    usedStacks: 0,
    totalStacks: 0,
  };
  private statsEssenceBurst = {
    generated: 0,
    wasted: 0,
  };
  private damageFromUnboundFlame = 0;

  constructor(options: Options) {
    super(options, ProcBuffOptions);
    this.active = this.selectedCombatant.hasTalent(TALENTS.RISING_FURY_3_DEVASTATION_TALENT);
    this.maxStacks = 4;
    this.amountOfStacksGenerated = 4;

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.UNBOUND_FLAME_DAMAGE),
      this.onDamage,
    );

    [Events.applybuff, Events.applybuffstack].forEach((event) =>
      this.addEventListener(
        event.by(SELECTED_PLAYER).spell(SPELLS.ESSENCE_BURST_DEV_BUFF),
        this.onApplyEssenceBurst,
      ),
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.ESSENCE_BURST_DEV_BUFF),
      this.onRefreshEssenceBurst,
    );
  }

  private onDamage(event: DamageEvent) {
    this.damageFromUnboundFlame += (event.amount || 0) + (event.absorbed || 0);
  }

  ApplyCheck(event: ApplyBuffEvent) {
    this.statsUnboundFlame.totalStacks += 4;
  }

  RemoveCheck(event: RemoveBuffEvent) {
    this.onUnboundRemove(event);
  }
  RemoveStackCheck(event: RemoveBuffStackEvent) {
    this.onUnboundRemove(event);
  }
  private onUnboundRemove(event: RemoveBuffEvent | RemoveBuffStackEvent) {
    if (event.type === EventType.RemoveBuff && !isFromUnboundFlameConsume(event)) {
      this.pushCastData(
        event,
        `Buff decayed, wasting ${this.previousStacks} stack(s)`,
        QualitativePerformance.Fail,
      );
    } else {
      this.statsUnboundFlame.usedStacks += 1;
      this.pushCastData(event, 'Buff used', QualitativePerformance.Good);
    }
  }

  private onApplyEssenceBurst(event: ApplyBuffEvent | ApplyBuffStackEvent) {
    if (isEBFrom(event, EBSource.UnboundFlame)) {
      this.statsEssenceBurst.generated += 1;
    }
  }
  private onRefreshEssenceBurst(event: RefreshBuffEvent) {
    if (isEBFrom(event, EBSource.UnboundFlame)) {
      this.statsEssenceBurst.wasted += 1;
      this.pushCastData(event, `Overcapped Essence Burst`, QualitativePerformance.Fail);
    }
  }

  get usedStacks() {
    return this.statsUnboundFlame.usedStacks;
  }

  get totalStacks() {
    return this.statsUnboundFlame.totalStacks;
  }

  get essenceBurstGenerated() {
    return this.statsEssenceBurst.generated;
  }

  get essenceBurstWasted() {
    return this.statsEssenceBurst.wasted;
  }

  get damage() {
    return this.damageFromUnboundFlame;
  }

  get procUsageData(): AnalysisData {
    return {
      casts: this.casts,
      spell: SPELLS.UNBOUND_FLAME,
    };
  }
}

export default UnboundFlame;
