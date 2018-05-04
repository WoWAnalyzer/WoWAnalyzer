import SPELLS from 'common/SPELLS';

import Analyzer from 'Parser/Core/Analyzer';

/**
 * Core analyzer for Battle Cry usage, to be extended to create suggestions and statistics.
 * @extends Analyzer
 */
class BattleCryAnalyzer extends Analyzer {
  static BATTLE_CRY_DURATION = 5000;

  battleCryCount = 0;
  battleCrying = false;

  on_byPlayer_cast(event) {
    if(SPELLS.BATTLE_CRY.id === event.ability.guid) {
      // If a Battle Cry was cast trigger the start event.
      this.battleCryCount += 1;
      this.battleCrying = true;
      this.startBattleCry(event);
      return;
    }

    if(!this.battleCrying) {
      // Ignore any other casts if we aren't Battle Crying.
      return;
    }

    // If a spell was cast during Battle Cry trigger the cast event.
    this.battleCryCast(event);
  }

  on_byPlayer_damage(event) {
    // If damage is dealt during Battle Cry, or if damage is dealt by Corrupted Blood of Zakajz, trigger the damage event.
    if (!event.targetIsFriendly && (this.battleCrying || SPELLS.CORRUPTED_BLOOD_OF_ZAKAJZ.id === event.ability.guid)) {
      this.battleCryDamage(event);
    }
  }

  on_byPlayer_removebuff(event) {
    if(SPELLS.BATTLE_CRY.id === event.ability.guid) {
      // If Battle Cry ends trigger the end event.
      this.battleCrying = false;
      this.endBattleCry(event);
    }
  }

  // Override these with functions to capture Battle Cry information.
  startBattleCry(event) {}
  battleCryCast(event) {}
  battleCryDamage(event) {}
  endBattleCry(event) {}
}

export default BattleCryAnalyzer;
