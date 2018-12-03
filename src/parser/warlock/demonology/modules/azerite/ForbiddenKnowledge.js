import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';

import SPELLS from 'common/SPELLS';
import { formatThousands } from 'common/format';

import TraitStatisticBox from 'interface/others/TraitStatisticBox';
import ItemDamageDone from 'interface/others/ItemDamageDone';

import ShadowsBiteForbiddenKnowledgeCore from './ShadowsBiteForbiddenKnowledgeCore';

const BUFF_DURATION = 15000;

class ForbiddenKnowledge extends Analyzer {
  static dependencies = {
    core: ShadowsBiteForbiddenKnowledgeCore,
  };

  _lastBuffApply = null;
  usedProcs = 0;
  allProcs = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.FORBIDDEN_KNOWLEDGE.id);

    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.FORBIDDEN_KNOWLEDGE_BUFF), this.onFKBuffApply);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.FORBIDDEN_KNOWLEDGE_BUFF), this.onFKBuffRemove);
  }

  onFKBuffApply(event) {
    this._lastBuffApply = event.timestamp;
  }

  onFKBuffRemove(event) {
    if (event.timestamp < this._lastBuffApply + BUFF_DURATION) {
      this.usedProcs += 1;
    }
    this.allProcs += 1;
  }

  statistic() {
    return (
      <TraitStatisticBox
        trait={SPELLS.FORBIDDEN_KNOWLEDGE.id}
        value={<ItemDamageDone amount={this.core.forbiddenKnowledgeDamage} approximate />}
        tooltip={`Estimated bonus Demonbolt damage: ${formatThousands(this.core.forbiddenKnowledgeDamage)}<br />
                You utilized ${this.usedProcs} out of ${this.allProcs} Forbidden Knowledge procs<br /><br />
                The damage is an approximation using current Intellect values at given time, but because we might miss some Intellect buffs (e.g. trinkets, traits), the value of current Intellect might be a little incorrect.`}
      />
    );
  }
}

export default ForbiddenKnowledge;
