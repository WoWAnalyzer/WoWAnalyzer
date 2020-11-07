import React from 'react';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import { encodeTargetString } from 'parser/shared/modules/EnemyInstances';
import ItemDamageDone from 'interface/ItemDamageDone';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Haste from 'interface/icons/Haste';
import Events, { DamageEvent, SummonEvent } from 'parser/core/Events';
import { DIRE_BEAST_HASTE_PERCENT } from 'parser/hunter/shared/constants';

/**
 * Summons a powerful wild beast that attacks the target and roars, increasing your Haste by 5% for 8 sec.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/TY846VxkCwAfPLbG#fight=46&type=damage-done&source=411
 *
 * TODO: Ensure it doesn't conflict with Dire Command legendary.
 */

class DireBeast extends Analyzer {

  damage = 0;
  activeDireBeasts: string[] = [];
  targetId = '';

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.DIRE_BEAST_TALENT.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET), this.onPetDamage);
    this.addEventListener(Events.summon.by(SELECTED_PLAYER).spell(SPELLS.DIRE_BEAST_SUMMON), this.onDireSummon);
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.DIRE_BEAST_BUFF.id) / this.owner.fightDuration;
  }

  onPetDamage(event: DamageEvent) {
    const sourceId: string = encodeTargetString(event.sourceID);
    if (this.activeDireBeasts.includes(sourceId)) {
      this.damage += event.amount + (event.absorbed || 0);
    }
  }

  onDireSummon(event: SummonEvent) {
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
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={<>You had {formatPercentage(this.uptime)}% uptime on the Dire Beast Haste buff.</>}
      >
        <BoringSpellValueText spell={SPELLS.DIRE_BEAST_TALENT}>
          <>
            <ItemDamageDone amount={this.damage} />
            <br />
            <Haste /> {formatPercentage(DIRE_BEAST_HASTE_PERCENT * this.uptime)}% Haste<br />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default DireBeast;
