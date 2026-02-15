import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Analyzer from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Events, { CastEvent, DamageEvent, EventType, GetRelatedEvents } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import ArcaneChargeTracker from '../core/ArcaneChargeTracker';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { MageStatistic } from '../../shared/components/statistics';

export default class ArcaneOrb extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    arcaneChargeTracker: ArcaneChargeTracker,
  };
  protected abilityTracker!: AbilityTracker;
  protected arcaneChargeTracker!: ArcaneChargeTracker;

  orbData: ArcaneOrbData[] = [];

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.ARCANE_ORB), this.onOrbCast);
  }

  onOrbCast(event: CastEvent) {
    const damageEvents: DamageEvent[] = GetRelatedEvents(event, EventType.Damage);

    this.orbData.push({
      timestamp: event.timestamp,
      targetsHit: damageEvents.length || 0,
      chargesBefore: this.arcaneChargeTracker.current,
      clearcasting: this.selectedCombatant.hasBuff(
        SPELLS.CLEARCASTING_ARCANE,
        event.timestamp - 10,
      ),
    });
  }

  get missedOrbs() {
    const missed = this.orbData.filter((o) => o.targetsHit === 0);
    return missed.length;
  }

  get averageHitsPerCast() {
    let totalHits = 0;
    this.orbData.forEach((o) => {
      totalHits += o.targetsHit;
    });
    return totalHits / this.abilityTracker.getAbility(SPELLS.ARCANE_ORB.id).casts;
  }

  get orbTargetThresholds() {
    return {
      actual: this.averageHitsPerCast,
      isLessThan: {
        average: 1,
        major: 0.8,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  statistic() {
    const tooltipText = `You averaged ${formatNumber(
      this.averageHitsPerCast,
    )} hits per cast of Arcane Orb. ${
      this.missedOrbs > 0
        ? `Additionally, you cast Arcane Orb ${this.missedOrbs} times without hitting anything.`
        : ''
    } Casting Arcane Orb when it will only hit one target is still beneficial and acceptable, but if you can aim it so that it hits multiple enemies then you should.`;

    return (
      <MageStatistic
        spell={SPELLS.ARCANE_ORB}
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={tooltipText}
      >
        <MageStatistic.Number
          value={this.averageHitsPerCast}
          label="Average hits per cast"
          precision={2}
        />
        <MageStatistic.Number value={this.missedOrbs} label="Orbs cast with no targets hit" />
      </MageStatistic>
    );
  }
}

export interface ArcaneOrbData {
  timestamp: number;
  targetsHit: number;
  chargesBefore: number;
  clearcasting: boolean;
}
