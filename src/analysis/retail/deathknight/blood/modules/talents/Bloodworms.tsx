import { formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/deathknight';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, {
  DamageEvent,
  EventType,
  HealEvent,
  SummonEvent,
  TargettedEvent,
} from 'parser/core/Events';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

//Worms last 15 sec. But sometimes lag and such makes them expire a little bit early.
const WORM_LIFESPAN = 14900;
class Bloodworms extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  protected abilityTracker!: AbilityTracker;

  totalSummons = 0;
  totalHealing = 0;
  totalDamage = 0;
  poppedEarly = 0;
  wormID = 0;

  bloodworm: Array<{ uniqueID: number; summonedTime: number; killedTime?: number }> = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.BLOODWORMS_TALENT);

    if (!this.active) {
      return;
    }

    this.addEventListener(Events.summon.by(SELECTED_PLAYER).spell(SPELLS.BLOODWORM), this.onSummon);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET), this.onDamage);
    this.addEventListener(
      Events.instakill.by(SELECTED_PLAYER_PET).spell(SPELLS.BLOODWORM_DEATH),
      this.onInstakill,
    );
    this.addEventListener(
      Events.heal.to(SELECTED_PLAYER).spell(SPELLS.BLOODWORM_DEATH),
      this.onHeal,
    );
  }

  get poppedWorms() {
    return this.bloodworm.filter(
      (worm) => worm.killedTime && worm.killedTime - worm.summonedTime <= WORM_LIFESPAN,
    ).length;
  }

  onSummon(event: SummonEvent) {
    this.bloodworm.push({
      uniqueID: event.targetInstance,
      summonedTime: event.timestamp,
    });
    this.totalSummons += 1;
    this.wormID = event.targetID;
  }

  onDamage(event: DamageEvent) {
    if (event.sourceID !== this.wormID) {
      return;
    }
    this.totalDamage += event.amount + (event.absorbed || 0);
  }

  onInstakill(event: TargettedEvent<EventType.Instakill>) {
    const index = this.bloodworm.findIndex((worm) => worm.uniqueID === event.targetInstance);

    if (index === -1) {
      return;
    }
    this.bloodworm[index].killedTime = event.timestamp;
  }

  onHeal(event: HealEvent) {
    this.totalHealing += (event.amount || 0) + (event.absorbed || 0);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(2)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            <strong>Damage:</strong> {formatThousands(this.totalDamage)} /{' '}
            {this.owner.formatItemDamageDone(this.totalDamage)}
            <br />
            <strong>Number of worms summoned:</strong> {this.totalSummons}
            <br />
            <strong>Number of worms popped early:</strong> {this.poppedWorms}
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS.BLOODWORMS_TALENT}>
          <ItemHealingDone amount={this.totalHealing} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Bloodworms;
