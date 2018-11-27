import React from 'react';

import Analyzer from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS';
import { formatThousands } from 'common/format';

import TraitStatisticBox from 'interface/others/TraitStatisticBox';
import ItemDamageDone from 'interface/others/ItemDamageDone';

import ShadowsBiteForbiddenKnowledgeCore from './ShadowsBiteForbiddenKnowledgeCore';

class ShadowsBite extends Analyzer {
  static dependencies = {
    core: ShadowsBiteForbiddenKnowledgeCore,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.SHADOWS_BITE.id);
  }

  statistic() {
    return (
      <TraitStatisticBox
        trait={SPELLS.SHADOWS_BITE.id}
        value={<ItemDamageDone amount={this.core.shadowsBiteDamage} approximate />}
        tooltip={`Estimated bonus Demonbolt damage: ${formatThousands(this.core.shadowsBiteDamage)}<br /><br />
                The damage is an approximation using current Intellect values at given time, but because we might miss some Intellect buffs (e.g. trinkets, traits), the value of current Intellect might be a little incorrect.`}
      />
    );
  }
}

export default ShadowsBite;
