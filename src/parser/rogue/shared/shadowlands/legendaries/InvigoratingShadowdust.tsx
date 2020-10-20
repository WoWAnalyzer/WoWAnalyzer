import React from 'react';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import SPELLS from 'common/SPELLS';
import Events, { CastEvent } from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';

import { ASSASSINATION_ABILITY_COOLDOWNS, SUBTLETY_ABILITY_COOLDOWNS, OUTLAW_ABILITY_COOLDOWNS, SHARED_ABILITY_COOLDOWNS } from 'parser/rogue/shared/constants';
import { SpellList } from 'common/SPELLS/Spell';

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

  protected spellUsable!: SpellUsable;
  spec: string = '';
  cooldownReduction: number = 15000; // 15 seconds

  constructor(options: Options) {
    super(options);
    this.spec = this.selectedCombatant.spec().specName;
    this.active = this.selectedCombatant.hasLegendaryByBonusID(SPELLS.INVIGORATING_SHADOWDUST.bonusID);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.VANISH), this.onCast);
  }

  onCast(event: CastEvent) {
    let cooldowns: SpellList[];
    switch (this.spec) {
      case 'Assassination':
        cooldowns = [ASSASSINATION_ABILITY_COOLDOWNS, SHARED_ABILITY_COOLDOWNS];
        break;
      case 'Outlaw':
        cooldowns = [OUTLAW_ABILITY_COOLDOWNS, SHARED_ABILITY_COOLDOWNS];
        break;
      case 'Subtlety':
        cooldowns = [SUBTLETY_ABILITY_COOLDOWNS, SHARED_ABILITY_COOLDOWNS];
        break;
      default:
        cooldowns = [SHARED_ABILITY_COOLDOWNS]
    }

    cooldowns.map((cooldown, index) => {
      const { id } = cooldown[index];
      return this.spellUsable.reduceCooldown(id, this.cooldownReduction, event.timestamp);
    });
  }
}

export default InvigoratingShadowdust;