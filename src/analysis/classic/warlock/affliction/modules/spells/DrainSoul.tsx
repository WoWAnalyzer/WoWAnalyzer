import { formatPercentage, formatThousands, formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS/classic/warlock';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ResourceChangeEvent, RemoveDebuffEvent } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Enemies from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

// limit to filter out relevant removedebuffs
// it's still possible that the mob dies and at the same time something falls off somewhere, but shouldn't happen too much
const ENERGIZE_REMOVEDEBUFF_THRESHOLD = 100;

class DrainSoul extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    abilityTracker: AbilityTracker,
  };
  protected abilityTracker!: AbilityTracker;
  protected enemies!: Enemies;

  get suggestionThresholds() {
    return {
      actual: this.mobsSniped / this.totalNumOfAdds,
      isLessThan: {
        minor: 0.9,
        average: 0.75,
        major: 0.5,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  private _lastEnergize = 0;
  _lastEnergizeWasted = false;
  totalNumOfAdds = 0;
  mobsSniped = 0;

  constructor(options: Options) {
    super(options);
    this.active = true;
    this.addEventListener(
      Events.removedebuff.by(SELECTED_PLAYER).spell(SPELLS.DRAIN_SOUL),
      this.onDrainSoulRemove,
    );
    this.addEventListener(Events.fightend, this.onFinished);
  }

  onDrainSoulEnergize(event: ResourceChangeEvent) {
    this.mobsSniped += 1;
    if (this._lastEnergize !== event.timestamp) {
      this._lastEnergize = event.timestamp;
      this._lastEnergizeWasted = event.waste > 0;
    }
  }

  onDrainSoulRemove(event: RemoveDebuffEvent) {
    if (event.timestamp < this._lastEnergize + ENERGIZE_REMOVEDEBUFF_THRESHOLD) {
      const enemy = this.enemies.getEntity(event);
      if (!enemy) {
        return;
      }
    }
  }

  onFinished() {
    const allEnemies = this.enemies.getEntities();
    this.totalNumOfAdds = Object.values(allEnemies)
      .filter((enemy) => enemy.subType === 'NPC')
      .reduce((count, enemy) => count + enemy._baseInfo.fights[0].instances, 0);
  }

  statistic() {
    const damage = this.abilityTracker.getAbilityDamage(SPELLS.DRAIN_SOUL.id);
    const dps = (damage / this.owner.fightDuration) * 1000;
    return (
      <Statistic
        category={STATISTIC_CATEGORY.GENERAL}
        size="flexible"
        tooltip={`${formatThousands(damage)} total damage`}
      >
        <BoringSpellValueText spell={SPELLS.DRAIN_SOUL}>
          {formatNumber(dps)} DPS{' '}
          <small>
            {formatPercentage(this.owner.getPercentageOfTotalDamageDone(damage))} % of total
          </small>
          <br />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default DrainSoul;
