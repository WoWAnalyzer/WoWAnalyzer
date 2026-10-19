import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/evoker';
import SPELLS from 'common/SPELLS/evoker';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import {
  EBSource,
  eventWastedEB,
} from 'analysis/retail/evoker/shared/modules/normalizers/EssenceBurstCastLinkNormalizer';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { getUnboundFlameConsumeEvent } from '../normalizers/CastLinkNormalizer';
import ProcBuffAnalyzer, {
  BuffRemoveEvent,
} from 'analysis/retail/evoker/shared/modules/core/ProcBuffAnalyzer';

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
class UnboundFlame extends ProcBuffAnalyzer<CastEvent> {
  private statsEssenceBurst = {
    generated: 0,
    wasted: 0,
  };
  private damageFromUnboundFlame = 0;

  constructor(options: Options) {
    super(options, { buff: SPELLS.UNBOUND_FLAME_BUFF, stacksPerProc: 4, maxStacks: 4 });
    this.active = this.selectedCombatant.hasTalent(TALENTS.RISING_FURY_3_DEVASTATION_TALENT);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.UNBOUND_FLAME_DAMAGE),
      this.onDamage,
    );
  }

  protected getConsumeEvent(event: BuffRemoveEvent) {
    return getUnboundFlameConsumeEvent(event);
  }

  protected onStacksConsumed(event: BuffRemoveEvent, consumeEvent: CastEvent) {
    if (eventWastedEB(consumeEvent, EBSource.UnboundFlame)) {
      this.statsEssenceBurst.wasted += 1;
    } else {
      this.statsEssenceBurst.generated += 1;
    }
  }

  protected evaluateConsume(event: BuffRemoveEvent, consumeEvent: CastEvent, stacks: number) {
    if (eventWastedEB(consumeEvent, EBSource.UnboundFlame)) {
      return {
        performance: QualitativePerformance.Fail,
        reason: 'Overcapped Essence Burst',
      };
    }

    return super.evaluateConsume(event, consumeEvent, stacks);
  }

  private onDamage(event: DamageEvent) {
    this.damageFromUnboundFlame += (event.amount || 0) + (event.absorbed || 0);
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
}

export default UnboundFlame;
