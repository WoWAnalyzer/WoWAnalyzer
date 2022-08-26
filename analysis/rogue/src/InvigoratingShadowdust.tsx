import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import SPECS from 'game/SPECS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import SpellUsable from 'parser/shared/modules/SpellUsable';

import {
  ASSASSINATION_ABILITY_COOLDOWNS,
  OUTLAW_ABILITY_COOLDOWNS,
  SUBTLETY_ABILITY_COOLDOWNS,
} from './constants';

/**
 * The Inigorating Shadowdust legendary reduces the cooldown of ALL abilities by 15 seconds after using Vanish. This is usable by all 3 Rogue specs.
 *
 * 10/20/2020 -- Have not been able to find any logs to test this against during the current Beta. Will implement and modify trackable statistic(s), if any, when there are logs available.
 */

class InvigoratingShadowdust extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    spellUsable: SpellUsable,
  };
  cooldownReduction: number = 15000; // 15 seconds
  cooldowns: Spell[] = [];
  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    switch (this.selectedCombatant.specId) {
      case SPECS.ASSASSINATION_ROGUE.id:
        this.cooldowns = ASSASSINATION_ABILITY_COOLDOWNS;
        break;
      case SPECS.OUTLAW_ROGUE.id:
        this.cooldowns = OUTLAW_ABILITY_COOLDOWNS;
        break;
      case SPECS.SUBTLETY_ROGUE.id:
        this.cooldowns = SUBTLETY_ABILITY_COOLDOWNS;
        break;
      default:
        break;
    }
    this.active = this.selectedCombatant.hasLegendary(SPELLS.INVIGORATING_SHADOWDUST);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.VANISH), this.onCast);
  }

  onCast(event: CastEvent) {
    this.cooldowns.map(({ id }, index) => {
      if (!this.spellUsable.isOnCooldown(id)) {
        // eslint-disable-next-line array-callback-return
        return;
      }
      return this.spellUsable.reduceCooldown(id, this.cooldownReduction, event.timestamp);
    });
  }
}

export default InvigoratingShadowdust;
