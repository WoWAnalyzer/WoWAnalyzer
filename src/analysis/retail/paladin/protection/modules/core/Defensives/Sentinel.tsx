import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent, RemoveBuffStackEvent } from 'parser/core/Events';
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
const SENTINEL_INITIAL_STACKS = 15;

export default class Sentinel extends MajorDefensiveBuff {
  private stacks = SENTINEL_INITIAL_STACKS;

  constructor(options: Options) {
    super(SPELLS.SENTINEL, buff(SPELLS.SENTINEL), options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SENTINEL_TALENT);
    this.addEventListener(
      Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.SENTINEL),
      this.onSentinelApply,
    );
    this.addEventListener(
      Events.removebuffstack.to(SELECTED_PLAYER).spell(SPELLS.SENTINEL),
      this.onSentinelStackLost,
    );
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.recordDamage);
  }

  private onSentinelApply() {
    this.stacks = SENTINEL_INITIAL_STACKS;
  }

  private onSentinelStackLost(event: RemoveBuffStackEvent) {
    this.stacks = event.stack;
  }

  private recordDamage(event: DamageEvent) {
    if (!this.defensiveActive || event.sourceIsFriendly) {
      return;
    }
    this.recordMitigation({
      event,
      mitigatedAmount: absoluteMitigation(
        event,
        (MAX_MITIGATION * this.stacks) / SENTINEL_INITIAL_STACKS,
      ),
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
