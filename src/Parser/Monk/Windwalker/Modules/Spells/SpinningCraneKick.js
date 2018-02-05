import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import Combatants from 'Parser/Core/Modules/Combatants';
import Analyzer from 'Parser/Core/Analyzer';
import MarkoftheCraneTarget from './MarkoftheCraneTarget';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class SpinningCraneKick extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  badcasts = 0;
  averagestacks = 0;
  averagetargets = 0;
  markofthecranetargets = MarkoftheCraneTarget[];

  on_byPlayer_applydebuff(event) {
    const spellId = event.ability.guid;
    const targetId = event.targetId;
    const targetInstance = event.targetInstance;
    if (spellId !== SPELLS.MARK_OF_THE_CRANE.id) {
      return;
    }
    motcTarget = MarkoftheCraneTarget(targetId, targetInstance, event.timestamp);
    this.markofthecranetargets.add(motcTarget);
  }

  on_byPlayer_refreshdebuff(event) {
    const spellId = event.ability.guid;
    const targetId = event.targetID;
    const tagetInstance = event.targetInstance;
    if (spellId !== SPELLS.MARK_OF_THE_CRANE.id) {
      return;
    }
    markoftheCraneTarget = MarkoftheCraneTarget(targetId, targetInstance, event.timestamp);
    if (this.markofthecranetargets.includes(markoftheCraneTarget)) {
      this.markofthecranetargets.find(markoftheCraneTarget).refreshMark;
    }
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    markoftheCraneStacks = 0;
    if (spellId !== SPELLS.SPINNING_CRANE_KICK_DAMAGE.id) {
      return;
    }
  }




}
