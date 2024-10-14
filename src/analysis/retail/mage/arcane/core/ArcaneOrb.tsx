import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  CastEvent,
  DamageEvent,
  GetRelatedEvents,
  ResourceChangeEvent,
} from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import ArcaneChargeTracker from '../core/ArcaneChargeTracker';
import { encodeEventTargetString } from 'parser/shared/modules/Enemies';

class ArcaneOrb extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    arcaneChargeTracker: ArcaneChargeTracker,
  };
  protected abilityTracker!: AbilityTracker;
  protected arcaneChargeTracker!: ArcaneChargeTracker;

  orbCasts: {
    timestamp: number;
    targetsHit: number;
    chargesBefore: number;
  }[] = [];

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.ARCANE_ORB), this.onOrbCast);
  }

  onOrbCast(event: CastEvent) {
    const damageEvents: DamageEvent[] = GetRelatedEvents(event, 'SpellDamage');
    const energize: ResourceChangeEvent[] = GetRelatedEvents(event, 'Energize');

    const targetsHit = new Set(damageEvents.map((d) => encodeEventTargetString(d))).size;
    const chargesBefore =
      this.arcaneChargeTracker.current -
      (energize && energize.filter((e) => e.timestamp < event.timestamp).length > 0 ? 1 : 0);

    this.orbCasts.push({
      timestamp: event.timestamp,
      targetsHit,
      chargesBefore,
    });
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
