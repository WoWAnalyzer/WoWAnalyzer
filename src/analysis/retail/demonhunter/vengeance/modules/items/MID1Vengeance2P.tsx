import SPELLS from 'common/SPELLS/demonhunter';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import { MID1_2PC_DAMAGE_MULTIPLIER } from '../../constants';
//import { TIERS } from 'game/TIERS';

/**
 * (2) Set Vengeance: Fracture damage increased by 30%.
 */

class MID1Vengeance2P extends Analyzer {
  extraDamage = 0;

  constructor(options: Options) {
    super(options);
    this.active = false;
    //this.active = this.selectedCombatant.has2PieceByTier(TIERS.MIDNIGHT1);
    //Midnight tiers not implemented yet
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell([SPELLS.FRACTURE]),
      this.onDamage,
    );
  }
  onDamage(event: DamageEvent) {
    this.extraDamage += calculateEffectiveDamage(event, MID1_2PC_DAMAGE_MULTIPLIER);
  }
}

export default MID1Vengeance2P;
