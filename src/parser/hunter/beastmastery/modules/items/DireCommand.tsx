import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import React from 'react';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import SPELLS from 'common/SPELLS';
import Events, { DamageEvent, SummonEvent } from 'parser/core/Events';
import { plotOneVariableBinomChart } from 'parser/shared/modules/helpers/Probability';
import SpellLink from 'common/SpellLink';
import { DIRE_COMMAND_PROC_CHANCE } from 'parser/hunter/beastmastery/constants';
import ItemDamageDone from 'interface/ItemDamageDone';
import Haste from 'interface/icons/Haste';
import { formatPercentage } from 'common/format';
import { DIRE_BEAST_HASTE_PERCENT } from 'parser/hunter/shared/constants';
import { encodeTargetString } from 'parser/shared/modules/EnemyInstances';

/**
 * TODO Find a log with both Dire Command and Dire Beast talent and account for them using the same spell for buff
 * Kill Command has a 20% chance to also summon a Dire Beast to attack your target.
 *
 * Example log:
 *
 */
class DireCommand extends Analyzer {

  damage: number = 0;
  activeDireBeasts: string[] = [];
  targetId: string = '';
  direCommandProcs: number = 0;
  killCommandHits: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasLegendaryByBonusID(SPELLS.DIRE_COMMAND_EFFECT.bonusID);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.summon.by(SELECTED_PLAYER).spell(SPELLS.DIRE_BEAST_SUMMON), this.direBeastSummon);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET).spell(SPELLS.KILL_COMMAND_DAMAGE_BM), this.killCommandDamage);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET), this.onPetDamage);
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.DIRE_BEAST_BUFF.id) / this.owner.fightDuration;
  }

  direBeastSummon(event: SummonEvent) {
    this.direCommandProcs += 1;
    this.targetId = encodeTargetString(event.targetID);
    this.activeDireBeasts = [];
    this.activeDireBeasts.push(this.targetId);
    this.targetId = '';
  }

  onPetDamage(event: DamageEvent) {
    const sourceId: string = encodeTargetString(event.sourceID);
    if (this.activeDireBeasts.includes(sourceId)) {
      this.damage += event.amount + (event.absorbed || 0);
    }
  }

  killCommandDamage(event: DamageEvent) {
    this.killCommandHits += 1;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={<>You had {formatPercentage(this.uptime)}% uptime on the Dire Beast Haste buff.</>}
        dropdown={(
          <>
            <div style={{ padding: '8px' }}>
              {plotOneVariableBinomChart(this.direCommandProcs, this.killCommandHits, DIRE_COMMAND_PROC_CHANCE)}
              <p>Likelihood of getting <em>exactly</em> as many procs as estimated on a fight given your number of <SpellLink id={SPELLS.KILL_COMMAND_CAST_BM.id} /> casts.</p>
            </div>
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.DIRE_COMMAND_EFFECT}>
          <ItemDamageDone amount={this.damage} />
          <br />
          <Haste /> {formatPercentage(DIRE_BEAST_HASTE_PERCENT * this.uptime)}% <small>Haste</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default DireCommand;
