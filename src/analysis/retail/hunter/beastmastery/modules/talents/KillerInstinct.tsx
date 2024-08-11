import { formatNumber } from 'common/format';
import TALENTS from 'common/TALENTS/hunter';
import { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import ExecuteHelper from 'parser/shared/modules/helpers/ExecuteHelper';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import { KILLER_INSTINCT_MULTIPLIER, KILLER_INSTINCT_THRESHOLD } from '../../constants';

/**
 * Kill Command deals 50% increased damage against enemies below 35% health.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/DFZVfmhkj9bYa6rn#fight=1&type=damage-done
 */
class KillerInstinct extends ExecuteHelper {
  static executeSpells = [TALENTS.KILL_COMMAND_BEAST_MASTERY_TALENT];
  static executeSources = SELECTED_PLAYER_PET | SELECTED_PLAYER;
  static lowerThreshold = KILLER_INSTINCT_THRESHOLD;
  static modifiesDamage = true;
  static damageModifier = KILLER_INSTINCT_MULTIPLIER;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.KILLER_INSTINCT_TALENT);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            You cast a total of {this.casts} Kill Commands, of which {this.castsWithExecute} were on
            enemies with less than 35% of their health remaining. <br />
            These {this.castsWithExecute} casts provided you a total of {formatNumber(this.damage)}{' '}
            extra damage throughout the fight.
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS.KILLER_INSTINCT_TALENT}>
          <>
            <ItemDamageDone amount={this.damage} />
            <br />
            {formatNumber(this.castsWithExecute)} <small>casts at {'<'}35% health</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default KillerInstinct;
