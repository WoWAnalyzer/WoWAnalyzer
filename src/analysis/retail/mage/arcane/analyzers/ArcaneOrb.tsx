import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Analyzer from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Events, {
  CastEvent,
  DamageEvent,
  EventType,
  GetRelatedEvent,
  GetRelatedEvents,
} from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import ArcaneChargeTracker from '../core/ArcaneChargeTracker';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { MageStatistic } from '../../shared/components/statistics';
import SpellUsable from 'parser/shared/modules/SpellUsable';

export default class ArcaneOrb extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    arcaneChargeTracker: ArcaneChargeTracker,
    spellUsable: SpellUsable,
  };
  protected abilityTracker!: AbilityTracker;
  protected arcaneChargeTracker!: ArcaneChargeTracker;
  protected spellUsable!: SpellUsable;

  orbData: ArcaneOrbCast[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.ARCANE_ORB_TALENT);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.ARCANE_ORB), this.onOrbCast);
  }

  onOrbCast(event: CastEvent) {
    const damageEvents: DamageEvent[] = GetRelatedEvents(event, EventType.Damage);
    const maxCharges = this.selectedCombatant.hasTalent(TALENTS.CHARGED_ORB_TALENT) ? 2 : 1;
    const orbCapped =
      this.spellUsable.chargesOnCooldown(TALENTS.ARCANE_ORB_TALENT.id) === 0 ||
      (this.spellUsable.chargesOnCooldown(TALENTS.ARCANE_ORB_TALENT.id) === maxCharges - 1 &&
        this.spellUsable.cooldownRemaining(TALENTS.ARCANE_ORB_TALENT.id) < 10000);
    const recentBarrage = GetRelatedEvent(event, 'previousCast');

    this.orbData.push({
      timestamp: event.timestamp,
      targetsHit: damageEvents.length || 0,
      chargesBefore: this.arcaneChargeTracker.current,
      orbCapped,
      clearcasting: this.selectedCombatant.hasBuff(
        SPELLS.CLEARCASTING_ARCANE,
        event.timestamp - 10,
      ),
      salvoStacks: this.selectedCombatant.getBuff(SPELLS.ARCANE_SALVO_BUFF)?.stacks || 0,
      recentBarrage: recentBarrage ? true : false,
      touchCD: this.spellUsable.cooldownRemaining(TALENTS.TOUCH_OF_THE_MAGI_TALENT.id),
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

export interface ArcaneOrbCast {
  timestamp: number;
  targetsHit: number;
  chargesBefore: number;
  orbCapped: boolean;
  clearcasting: boolean;
  salvoStacks: number;
  recentBarrage: boolean;
  touchCD: number;
}
