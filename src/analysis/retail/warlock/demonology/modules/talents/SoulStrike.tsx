import { formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import Analyzer, { Options, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { DamageEvent, ResourceChangeEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

import SoulShardTracker from '../resources/SoulShardTracker';

class SoulStrike extends Analyzer {
  static dependencies = {
    soulShardTracker: SoulShardTracker,
  };

  soulShardTracker!: SoulShardTracker;
  damage = 0;
  totalCasts = 0;
  wastedShards = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SOUL_STRIKE_TALENT);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER_PET).spell(SPELLS.SOUL_STRIKE_DAMAGE),
      this.handleSoulStrikeDamage,
    );
    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER_PET).spell(SPELLS.SOUL_STRIKE_SHARD_GEN),
      this.handleSoulStrikeShardGen,
    );
  }

  handleSoulStrikeDamage(event: DamageEvent) {
    this.damage += event.amount + (event.absorbed || 0);
  }

  handleSoulStrikeShardGen(event: ResourceChangeEvent) {
    if (event.resourceChangeType === RESOURCE_TYPES.SOUL_SHARDS.id) {
      this.totalCasts += 1;

      // Convert waste from fragments (tenths) to whole shards
      // Each shard = 10 fragments, so divide by 10
      if (event.waste > 0) {
        this.wastedShards += event.waste / 10;
      }
    }
  }

  get shardsGenerated() {
    return this.totalCasts;
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <ul>
            <li>{formatThousands(this.damage)} damage</li>
            {this.wastedShards > 0 && <li>{this.wastedShards} shards wasted due to overcapping</li>}
          </ul>
        }
      >
        <BoringSpellValueText spell={TALENTS.SOUL_STRIKE_TALENT}>
          <ItemDamageDone amount={this.damage} />
          <ul>
            <li>
              {this.shardsGenerated} <small>shards generated</small>
            </li>
            {this.wastedShards > 0 && (
              <li>
                {this.wastedShards} <small>shards wasted</small>
              </li>
            )}
          </ul>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SoulStrike;
