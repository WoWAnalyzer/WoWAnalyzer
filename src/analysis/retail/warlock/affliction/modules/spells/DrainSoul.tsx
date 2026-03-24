import { formatPercentage, formatThousands, formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import CriticalStrikeIcon from 'interface/icons/CriticalStrike';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ResourceChangeEvent, RemoveDebuffEvent } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Enemies from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

import SoulShardTracker from '../resources/SoulShardTracker';

// limit to filter out relevant removedebuffs (those what I'm interested in happen either at the same timestamp as energize, or about 20ms afterwards (tested on 2 logs, didn't surpass 30ms))
// it's still possible that it can be a coincidence (mob dies and at the same time something falls off somewhere unrelated), but shouldn't happen too much
const ENERGIZE_REMOVEDEBUFF_THRESHOLD = 100;

class DrainSoul extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    soulShardTracker: SoulShardTracker,
    abilityTracker: AbilityTracker,
  };
  protected abilityTracker!: AbilityTracker;
  protected enemies!: Enemies;
  protected soulShardTracker!: SoulShardTracker;

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
  // this is to avoid counting soul shards from boss kill, the SoulShardTracker module tracks all shards gained and we're not interested in those we gained from boss kill
  _subtractBossShards = 0;
  _lastEnergizeWasted = false;
  _shardsGained = 0;
  totalNumOfAdds = 0;
  mobsSniped = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.DRAIN_SOUL_TALENT);
    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(SPELLS.DRAIN_SOUL_KILL_SHARD_GEN),
      this.onDrainSoulEnergize,
    );
    this.addEventListener(
      Events.removedebuff.by(SELECTED_PLAYER).spell(SPELLS.DRAIN_SOUL_DEBUFF),
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
      if (enemy.subType.toLowerCase() === 'boss' && !this._lastEnergizeWasted) {
        // it's a boss kill and we didn't waste the shard, subtract it
        this._subtractBossShards += 1;
      }
    }
  }

  onFinished() {
    const allEnemies = this.enemies.getEntities();
    this.totalNumOfAdds = Object.values(allEnemies)
      .filter((enemy) => enemy.subType === 'NPC')
      .reduce((count, enemy) => count + enemy._baseInfo.fights[0].instances, 0);
    this._shardsGained =
      this.soulShardTracker.getGeneratedBySpell(SPELLS.DRAIN_SOUL_KILL_SHARD_GEN.id) -
      this._subtractBossShards;
  }

  statistic() {
    const damage = this.abilityTracker.getAbilityDamage(SPELLS.DRAIN_SOUL_DEBUFF.id);
    const dps = (damage / this.owner.fightDuration) * 1000;
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={`${formatThousands(damage)} total damage`}
      >
        <BoringSpellValueText spell={TALENTS.DRAIN_SOUL_TALENT}>
          {formatNumber(dps)} DPS{' '}
          <small>
            {formatPercentage(this.owner.getPercentageOfTotalDamageDone(damage))} % of total
          </small>
          <br />
          <CriticalStrikeIcon /> {this._shardsGained} <small>shards sniped</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default DrainSoul;
