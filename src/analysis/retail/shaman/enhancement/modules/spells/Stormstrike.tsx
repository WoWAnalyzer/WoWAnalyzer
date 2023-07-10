import ExecuteHelper from 'parser/shared/modules/helpers/ExecuteHelper';
import Abilities from 'parser/core/modules/Abilities';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import { TALENTS_SHAMAN } from 'common/TALENTS';

class Stormstrike extends ExecuteHelper {
  static dependencies = {
    ...ExecuteHelper.dependencies,
    abilities: Abilities,
  };
  static executeSpells = [SPELLS.WINDSTRIKE_CAST];
  static executeOutsideRangeEnablers = [TALENTS_SHAMAN.ASCENDANCE_ENHANCEMENT_TALENT];
  static executeSources = SELECTED_PLAYER;
  static lowerThreshold = -1;
  static modifiesDamage = false;
  static countCooldownAsExecuteTime = true;

  protected abilities!: Abilities;

  constructor(options: Options) {
    super(options);
    this.active =
      this.selectedCombatant.hasTalent(TALENTS_SHAMAN.ASCENDANCE_ENHANCEMENT_TALENT) ||
      this.selectedCombatant.hasTalent(TALENTS_SHAMAN.DEEPLY_ROOTED_ELEMENTS_TALENT);

    if (!this.active) {
      return;
    }
  }
}

export default Stormstrike;
