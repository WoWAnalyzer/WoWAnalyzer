import React from 'react';
import ItemDamageDone from 'parser/ui/ItemDamageDone';

import SPELLS from 'common/SPELLS';
import { Options, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import { formatNumber } from 'common/format';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ExecuteHelper from 'parser/shared/modules/helpers/ExecuteHelper';

import { KILLER_INSTINCT_MULTIPLIER, KILLER_INSTINCT_THRESHOLD } from '../../constants';

/**
 * Kill Command deals 50% increased damage against enemies below 35% health.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/DFZVfmhkj9bYa6rn#fight=1&type=damage-done
 */
class KillerInstinct extends ExecuteHelper {
  static executeSpells = [SPELLS.KILL_COMMAND_DAMAGE_BM];
  static executeSources = SELECTED_PLAYER_PET;
  static lowerThreshold = KILLER_INSTINCT_THRESHOLD;
  static modifiesDamage = true;
  static damageModifier = KILLER_INSTINCT_MULTIPLIER;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.KILLER_INSTINCT_TALENT.id);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={(
          <>
            You cast a total of {this.casts} Kill Commands, of which {this.castsWithExecute} were on enemies with less than 35% of their health remaining. <br />
            These {this.castsWithExecute} casts provided you a total of {formatNumber(this.damage)} extra damage throughout the fight.
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.KILLER_INSTINCT_TALENT}>
          <>
            <ItemDamageDone amount={this.damage} /><br />
            {formatNumber(this.castsWithExecute)} <small>casts at {'<'}35% health</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default KillerInstinct;
