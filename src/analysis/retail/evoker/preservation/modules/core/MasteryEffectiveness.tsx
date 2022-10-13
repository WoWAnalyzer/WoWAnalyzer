import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  AbsorbedEvent,
  AnyEvent,
  CastEvent,
  HasHitpoints,
  HealEvent,
  ResourceActor,
} from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import HealingValue from 'parser/shared/modules/HealingValue';
import StatTracker from 'parser/shared/modules/StatTracker';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

type MasteryEvent = {
  sourceEvent: HealEvent | AbsorbedEvent;
  effectiveHealing: number;
  rawMasteryGain: number;
};

class MasteryEffectiveness extends Analyzer {
  static dependencies = {
    combatant: Combatants,
    statTracker: StatTracker,
  };

  protected combatants!: Combatants;
  protected statTracker!: StatTracker;

  masteryEffectiveHealSpellsCount: number = 0;
  totalHealSpellsCount: number = 0;
  totalHealingEffectedByMastery: number = 0;

  lastKnownTargetHP = {};
  prevokerHealth: number = 0;

  /**
   * @type {number} The total amount of healing done by just the mastery gain. Precisely calculated for every spell.
   */
  totalMasteryHealingDone: number = 0;

  masteryHealEvents: MasteryEvent[] = [];

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
    this.addEventListener(Events.absorbed.by(SELECTED_PLAYER), this.onAbsorbedByPlayer);
    this.addEventListener(Events.any, this.onEvent);
  }

  onEvent(event: AnyEvent) {
    if (HasHitpoints(event)) {
      const unitId = event.resourceActor === ResourceActor.Target ? event.targetID : event.sourceID;
      (this.lastKnownTargetHP as any)[unitId] = event.hitPoints;
      console.log(`LAST KNOWN HP: ${JSON.stringify(this.lastKnownTargetHP)}`);
    }
  }

  isTargetHealthierThanPlayer(playerHealth: number, targetHealth: number): boolean {
    return playerHealth > targetHealth;
  }

  onHeal(event: HealEvent) {
    this.processHealForMastery(event);
  }
  onCast(event: CastEvent) {
    this.prevokerHealth = event.hitPoints || 0;
  }
  onAbsorbedByPlayer(event: AbsorbedEvent) {
    return;
  }

  processHealForMastery(event: HealEvent) {
    const heal = new HealingValue(event.amount, event.absorbed, event.overheal);
    const targetPlayerHealth = event.hitPoints - event.amount;

    const baseHealing = heal.raw / (1 + this.statTracker.currentMasteryPercentage);
    const rawMasteryGain = heal.raw - baseHealing;
    const actualMasteryHealingDone = Math.max(0, heal.effective - baseHealing);
    this.totalMasteryHealingDone += actualMasteryHealingDone;

    if (this.isTargetHealthierThanPlayer(this.prevokerHealth, targetPlayerHealth)) {
      this.masteryHealEvents.push({
        sourceEvent: event,
        effectiveHealing: heal.effective,
        rawMasteryGain,
      });
    }
    console.log(`totalMasteryHealingDone IS: ${this.totalMasteryHealingDone}`);
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.CORE(10)}
        category={STATISTIC_CATEGORY.GENERAL}
      >
        <BoringSpellValueText spellId={SPELLS.LIFEBLOOM_HOT_HEAL.id}>
          <ItemHealingDone amount={this.totalMasteryHealingDone} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default MasteryEffectiveness;
