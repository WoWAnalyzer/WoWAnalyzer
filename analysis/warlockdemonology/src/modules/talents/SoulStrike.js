import { formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import React from 'react';

import SoulShardTracker from '../soulshards/SoulShardTracker';

class SoulStrike extends Analyzer {
  static dependencies = {
    soulShardTracker: SoulShardTracker,
  };

  damage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SOUL_STRIKE_TALENT.id);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER_PET).spell(SPELLS.SOUL_STRIKE_DAMAGE),
      this.handleSoulStrikeDamage,
    );
  }

  handleSoulStrikeDamage(event) {
    this.damage += event.amount + (event.absorbed || 0);
  }

  statistic() {
    const shardsGained = this.soulShardTracker.getGeneratedBySpell(SPELLS.SOUL_STRIKE_SHARD_GEN.id);
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={`${formatThousands(this.damage)} damage`}
      >
        <BoringSpellValueText spellId={SPELLS.SOUL_STRIKE_TALENT.id}>
          <ItemDamageDone amount={this.damage} />
          <br />
          {shardsGained} <small>Shards generated</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SoulStrike;
