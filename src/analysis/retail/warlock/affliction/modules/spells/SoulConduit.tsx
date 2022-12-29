import { formatPercentage, formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import { findMax, binomialPMF } from 'parser/shared/modules/helpers/Probability';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

import SoulShardTracker from '../resources/SoulShardTracker';

const TICKS_PER_UA = 4;
const SC_PROC_CHANCE = 0.15;

class SoulConduit extends Analyzer {
  static dependencies = {
    soulShardTracker: SoulShardTracker,
  };

  protected soulShardTracker!: SoulShardTracker;

  _totalTicks = 0;
  _totalUAdamage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SOUL_CONDUIT_TALENT);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.UNSTABLE_AFFLICTION),
      this.onUnstableAfflictionDamage,
    );
  }

  onUnstableAfflictionDamage(event: DamageEvent) {
    this._totalTicks += 1;
    this._totalUAdamage += event.amount + (event.absorbed || 0);
  }

  statistic() {
    // if we haven't cast any UAs, _totalTicks would be 0 and we would get an exception
    const avgDamage = this._totalUAdamage / Math.max(this._totalTicks, 1);
    const shardsGained = this.soulShardTracker.getGeneratedBySpell(
      SPELLS.SOUL_CONDUIT_SHARD_GEN.id,
    );
    const estimatedUAdamage = shardsGained * TICKS_PER_UA * avgDamage;
    const totalSpent = this.soulShardTracker.spent;
    // find number of Shards we were MOST LIKELY to get in the fight
    const { max } = findMax(totalSpent, (k, n) => binomialPMF(k, n, SC_PROC_CHANCE));
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            You gained {shardsGained} Shards from this talent,{' '}
            {max > 0 ? (
              <>
                which is <strong>{formatPercentage(shardsGained / max)}%</strong> of Shards you were
                most likely to get in this fight ({max} Shards).
              </>
            ) : (
              'while you were most likely to not get any Shards.'
            )}
            <br />
            Estimated damage: {formatThousands(estimatedUAdamage)} (
            {this.owner.formatItemDamageDone(estimatedUAdamage)})<br />
            <br />
            This result is estimated by multiplying number of Soul Shards gained from this talent by
            the average Unstable Affliction damage for the whole fight.
          </>
        }
      >
        <BoringSpellValueText spellId={TALENTS.SOUL_CONDUIT_TALENT.id}>
          {shardsGained} <small>Soul Shards generated</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SoulConduit;
