import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import { SpellLink } from 'interface';
import { ReactNode } from 'react';
import {
  buff,
  MajorDefensiveBuff,
  absoluteMitigation,
} from 'interface/guide/components/MajorDefensives/MajorDefensiveAnalyzer';
import MajorDefensiveStatistic from 'interface/MajorDefensiveStatistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import SPELLS from 'common/SPELLS/paladin';
import TALENTS from 'common/TALENTS/paladin';

const MAX_MITIGATION = 0.3;

export default class Sentinel extends MajorDefensiveBuff {
  private startingStacks = 1;

  constructor(options: Options) {
    super(SPELLS.SENTINEL, buff(SPELLS.SENTINEL), options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SENTINEL_TALENT);
    this.addEventListener(
      Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.SENTINEL),
      this.onSentinelApply,
    );
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.recordDamage);
  }

  private onSentinelApply() {
    this.startingStacks = Math.max(1, this.selectedCombatant.getBuffStacks(SPELLS.SENTINEL.id));
  }

  private recordDamage(event: DamageEvent) {
    if (!this.defensiveActive || event.sourceIsFriendly) {
      return;
    }
    const stacks = this.selectedCombatant.getBuffStacks(SPELLS.SENTINEL.id);
    this.startingStacks = Math.max(this.startingStacks, stacks);
    this.recordMitigation({
      event,
      mitigatedAmount: absoluteMitigation(event, (MAX_MITIGATION * stacks) / this.startingStacks),
    });
  }

  description(): ReactNode {
    return (
      <p>
        <SpellLink spell={SPELLS.SENTINEL} /> reduces the damage you take by 30%, decreasing over
        its duration. Spending Holy Power delays the decrease.
      </p>
    );
  }

  statistic(): ReactNode {
    return <MajorDefensiveStatistic analyzer={this} category={STATISTIC_CATEGORY.GENERAL} />;
  }
}
