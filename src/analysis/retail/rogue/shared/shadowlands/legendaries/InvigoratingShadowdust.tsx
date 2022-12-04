import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import {
  ASSASSINATION_ABILITY_COOLDOWNS,
  OUTLAW_ABILITY_COOLDOWNS,
  SHARED_ABILITY_COOLDOWNS,
  SUBTLETY_ABILITY_COOLDOWNS,
} from 'analysis/retail/rogue/shared/constants';

/**
 * The Inigorating Shadowdust legendary reduces the cooldown of ALL abilities by 20 seconds after using Vanish. This is usable by all 3 Rogue specs.
 *
 * 10/20/2020 -- Have not been able to find any logs to test this against during the current Beta. Will implement and modify trackable statistic(s), if any, when there are logs available.
 */

class InvigoratingShadowdust extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    spellUsable: SpellUsable,
  };

  protected abilities!: Abilities;
  protected spellUsable!: SpellUsable;

  cooldownReduction: number = 20_000; // 20 seconds
  cooldowns: Spell[] = [];

  constructor(options: Options) {
    super(options);
    this.cooldowns = [
      ...SHARED_ABILITY_COOLDOWNS,
      ...SUBTLETY_ABILITY_COOLDOWNS,
      ...ASSASSINATION_ABILITY_COOLDOWNS,
      ...OUTLAW_ABILITY_COOLDOWNS,
    ];
    this.active = false;
    if (!this.active) {
      return;
    }

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.VANISH), this.onCast);
  }

  onCast(event: CastEvent) {
    this.cooldowns.map(({ id }, _) => {
      if (!this.spellUsable.isOnCooldown(id)) {
        // eslint-disable-next-line array-callback-return
        return;
      }
      return this.spellUsable.reduceCooldown(id, this.cooldownReduction, event.timestamp);
    });
  }
}

export default InvigoratingShadowdust;
