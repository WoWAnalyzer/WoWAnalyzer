import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import { encodeTargetString } from 'parser/shared/modules/EnemyInstances';
import ItemDamageDone from 'interface/ItemDamageDone';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText
  from 'interface/statistics/components/BoringSpellValueText';
import Haste from 'interface/icons/Haste';
import {
  DamageEvent,
  SummonEvent,
} from '../../../../core/Events';

/**
 * Summons a powerful wild beast that attacks the target and roars, increasing
 * your Haste by 5% for 8 sec.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/qZRdFv9Apg74wmMV#fight=3&type=damage-done
 */

export const HASTE_PERCENT = 0.05;

class DireBeast extends Analyzer {

  damage = 0;
  activeDireBeasts: string[] = [];
  targetId = '';

  constructor(options: any) {
    super(options);
    this.active
      = this.selectedCombatant.hasTalent(SPELLS.DIRE_BEAST_TALENT.id);
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.DIRE_BEAST_BUFF.id) /
      this.owner.fightDuration;
  }

  on_byPlayerPet_damage(event: DamageEvent) {
    const sourceId: string = encodeTargetString(event.sourceID);
    if (this.activeDireBeasts.includes(sourceId)) {
      this.damage += event.amount +
        (
          event.absorbed || 0
        );
    }
  }

  on_byPlayer_summon(event: SummonEvent) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.DIRE_BEAST_SUMMON.id) {
      return;
    }
    this.targetId = encodeTargetString(event.targetID);
    this.activeDireBeasts = [];
    this.activeDireBeasts.push(this.targetId);
    this.targetId = '';
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={'TALENTS'}
        tooltip={<>You had {formatPercentage(this.uptime)}% uptime on the Dire Beast Haste buff.</>}
      >
        <BoringSpellValueText spell={SPELLS.DIRE_BEAST_TALENT}>
          <>
            <ItemDamageDone amount={this.damage} /> <br />
            <Haste /> {formatPercentage(HASTE_PERCENT *
            this.uptime)}% Haste<br />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default DireBeast;
