import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, {
  CastEvent,
  DamageEvent,
  ResourceChangeEvent,
  GetRelatedEvents,
} from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';
import ArcaneChargeTracker from '../core/ArcaneChargeTracker';

const ORB_CHARGE_THRESHOLD = 2;

class ArcaneOrb extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    arcaneChargeTracker: ArcaneChargeTracker,
  };
  protected abilityTracker!: AbilityTracker;
  protected arcaneChargeTracker!: ArcaneChargeTracker;

  orbCasts: {
    cast: number;
    damageEvents?: DamageEvent[];
    targetsHit: number;
    chargesBefore: number;
    usage?: BoxRowEntry;
  }[] = [];

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.ARCANE_ORB), this.onOrbCast);
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  onOrbCast(event: CastEvent) {
    const damageEvents: DamageEvent[] | undefined = GetRelatedEvents(event, 'SpellDamage');
    const energize: ResourceChangeEvent[] = GetRelatedEvents(event, 'Energize');
    const targets: number[] = [];
    damageEvents &&
      damageEvents.forEach((d) => {
        if (!targets.includes(d.targetID)) {
          targets.push(d.targetID);
        }
      });
    const charges =
      this.arcaneChargeTracker.charges -
      (energize && energize.filter((e) => e.timestamp < event.timestamp).length > 0 ? 1 : 0);

    this.orbCasts.push({
      cast: event.timestamp,
      damageEvents: damageEvents || [],
      targetsHit: targets.length || 0,
      chargesBefore: charges,
    });
  }

  analyzeOrbs = () => {
    this.orbCasts.forEach((o) => {
      if (o.targetsHit === 0) {
        o.usage = { value: QualitativePerformance.Fail, tooltip: `No Targets Hit by Arcane Orb` };
      } else if (o.chargesBefore > ORB_CHARGE_THRESHOLD) {
        o.usage = {
          value: QualitativePerformance.Fail,
          tooltip: `Had ${o.chargesBefore} Arcane Charges`,
        };
      } else {
        o.usage = {
          value: QualitativePerformance.Good,
          tooltip: `Hit ${o.targetsHit} Targets, Had ${o.chargesBefore} Arcane Charges before Arcane Orb`,
        };
      }
    });
  };

  onFightEnd() {
    this.analyzeOrbs();
  }

  get missedOrbs() {
    const missed = this.orbCasts.filter((o) => o.targetsHit === 0);
    return missed.length;
  }

  get averageHitsPerCast() {
    let totalHits = 0;
    this.orbCasts.forEach((o) => {
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
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={`You averaged ${formatNumber(
          this.averageHitsPerCast,
        )} hits per cast of Arcane Orb. ${
          this.missedOrbs > 0
            ? `Additionally, you cast Arcane Orb ${this.missedOrbs} times without hitting anything.`
            : ''
        } Casting Arcane Orb when it will only hit one target is still beneficial and acceptable, but if you can aim it so that it hits multiple enemies then you should.`}
      >
        <BoringSpellValueText spell={SPELLS.ARCANE_ORB}>
          <>
            {this.averageHitsPerCast.toFixed(2)} <small>Average hits per cast</small>
            <br />
            {this.missedOrbs} <small>Orbs cast with no targets hit.</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ArcaneOrb;
