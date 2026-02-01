import TALENTS from 'common/TALENTS/paladin';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent, HealEvent } from 'parser/core/Events';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { formatNumber, formatPercentage } from 'common/format';
import Combatants from 'parser/shared/modules/Combatants';
import { calculateEffectiveHealing, calculateOverhealing } from 'parser/core/EventCalculateLib';
import { RISING_SUNLIGHT_MAX_INCREASE } from '../../constants';
import BeaconTargets from '../beacons/BeaconTargets';

interface BeaconTargetHealth {
  hitPoints: number;
  maxHitPoints: number;
}

class RisingSunlight extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    beaconTargets: BeaconTargets,
  };

  protected combatants!: Combatants;
  protected beaconTargets!: BeaconTargets;

  healing = 0;
  overheal = 0;
  totalHealingIncreaseSum = 0;
  healCount = 0;

  beaconTargetHealth: Map<number, BeaconTargetHealth> = new Map();

  constructor(args: Options) {
    super(args);
    this.active = this.selectedCombatant.hasTalent(TALENTS.RISING_SUNLIGHT_TALENT);

    this.addEventListener(Events.heal, this.trackHealthFromHeal);
    this.addEventListener(Events.damage, this.trackHealthFromDamage);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
  }

  trackHealthFromHeal(event: HealEvent) {
    if (this.beaconTargets.hasBeacon(event.targetID)) {
      if (event.hitPoints !== undefined && event.maxHitPoints !== undefined) {
        this.beaconTargetHealth.set(event.targetID, {
          hitPoints: event.hitPoints,
          maxHitPoints: event.maxHitPoints,
        });
      }
    }
  }

  trackHealthFromDamage(event: DamageEvent) {
    if (this.beaconTargets.hasBeacon(event.targetID)) {
      if (event.hitPoints !== undefined && event.maxHitPoints !== undefined) {
        this.beaconTargetHealth.set(event.targetID, {
          hitPoints: event.hitPoints,
          maxHitPoints: event.maxHitPoints,
        });
      }
    }
  }

  // always applied via an inverse linear relationship
  getCurrentHealingIncrease(): number {
    const beaconTargetIds = this.beaconTargets.currentBeaconTargets;

    if (beaconTargetIds.length === 0) return 0;

    let totalHealthPercent = 0;
    let validTargets = 0;

    for (const targetId of beaconTargetIds) {
      const healthInfo = this.beaconTargetHealth.get(targetId);
      if (healthInfo && healthInfo.maxHitPoints > 0) {
        const healthPercent = healthInfo.hitPoints / healthInfo.maxHitPoints;
        totalHealthPercent += healthPercent;
        validTargets += 1;
      }
    }

    if (validTargets === 0) return 0;

    const averageHealthPercent = totalHealthPercent / validTargets;
    const healingIncrease = (1 - averageHealthPercent) * RISING_SUNLIGHT_MAX_INCREASE;

    return healingIncrease;
  }

  onHeal(event: HealEvent) {
    const healingIncrease = this.getCurrentHealingIncrease();
    if (healingIncrease <= 0) return;

    this.healing += calculateEffectiveHealing(event, healingIncrease);
    this.overheal += calculateOverhealing(event, healingIncrease);
    this.totalHealingIncreaseSum += healingIncrease;
    this.healCount += 1;
  }

  averageHealingIncrease(): number {
    return this.healCount > 0 ? this.totalHealingIncreaseSum / this.healCount : 0;
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.CORE(1)}
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            Effective Healing: {formatNumber(this.healing)} <br />
            Overhealing: {formatNumber(this.overheal)} <br />
            Average Healing Increase: {formatPercentage(this.averageHealingIncrease())}%
          </>
        }
      >
        <TalentSpellText talent={TALENTS.RISING_SUNLIGHT_TALENT}>
          <ItemHealingDone amount={this.healing} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default RisingSunlight;
