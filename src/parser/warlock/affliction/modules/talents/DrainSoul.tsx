import React from 'react';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Enemies from 'parser/shared/modules/Enemies';
import Events, { EnergizeEvent, RemoveDebuffEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';

import SPELLS from 'common/SPELLS';
import { formatPercentage, formatThousands, formatNumber } from 'common/format';
import SpellLink from 'common/SpellLink';

import CriticalStrikeIcon from 'interface/icons/CriticalStrike';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';

import { t } from '@lingui/macro';

import SoulShardTracker from '../soulshards/SoulShardTracker';

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
    this.active = this.selectedCombatant.hasTalent(SPELLS.DRAIN_SOUL_TALENT.id);
    this.addEventListener(
      Events.energize.by(SELECTED_PLAYER).spell(SPELLS.DRAIN_SOUL_KILL_SHARD_GEN),
      this.onDrainSoulEnergize,
    );
    this.addEventListener(
      Events.removedebuff.by(SELECTED_PLAYER).spell(SPELLS.DRAIN_SOUL_TALENT),
      this.onDrainSoulRemove,
    );
    this.addEventListener(Events.fightend, this.onFinished);
  }

  onDrainSoulEnergize(event: EnergizeEvent) {
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
      if (enemy.type.toLowerCase() === 'boss' && !this._lastEnergizeWasted) {
        // it's a boss kill and we didn't waste the shard, subtract it
        this._subtractBossShards += 1;
      }
    }
  }

  onFinished() {
    const allEnemies = this.enemies.getEntities();
    this.totalNumOfAdds = Object.values(allEnemies)
      .filter((enemy) => enemy.type === 'NPC')
      .reduce((count, enemy) => count + enemy._baseInfo.fights[0].instances, 0);
    this._shardsGained =
      this.soulShardTracker.getGeneratedBySpell(SPELLS.DRAIN_SOUL_KILL_SHARD_GEN.id) -
      this._subtractBossShards;
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You sniped {formatPercentage(actual)} % of mobs in this fight (
          {this.mobsSniped - this._subtractBossShards} / {this.totalNumOfAdds}) for total of
          {this._shardsGained} Soul Shards. You could get up to {this.totalNumOfAdds} Shards from
          them. Try to snipe shards from adds (cast <SpellLink id={SPELLS.DRAIN_SOUL_TALENT.id} />
          on them before they die) as it is a great source of extra Soul Shards.
          <br />
          <br />
          <small>
            Note that the number of adds <em>might be a bit higher than usual</em>, as there
            sometimes are adds that die too quickly, aren't meant to be killed or are not killed in
            the fight.
          </small>
        </>,
      )
        .icon('ability_hunter_snipershot')
        .actual(
          t({
            id: 'warlock.affliction.suggestions.drainSoul.mobsSniped',
            message: `${formatPercentage(actual)} % of mobs sniped.`,
          }),
        )
        .recommended(`>= ${formatPercentage(recommended)} % is recommended`),
    );
  }

  statistic() {
    const ds = this.abilityTracker.getAbility(SPELLS.DRAIN_SOUL_TALENT.id);
    const damage = ds.damageEffective + ds.damageAbsorbed;
    const dps = (damage / this.owner.fightDuration) * 1000;
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={`${formatThousands(damage)} total damage`}
      >
        <BoringSpellValueText spell={SPELLS.DRAIN_SOUL_TALENT}>
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
