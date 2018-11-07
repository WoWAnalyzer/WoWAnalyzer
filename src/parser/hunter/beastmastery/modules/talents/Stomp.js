import React from 'react';

import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import ItemDamageDone from 'interface/others/ItemDamageDone';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import SpellIcon from 'common/SpellIcon';

/**
 * When you cast Barbed Shot, your pet stomps the ground, dealing [((50% of Attack power)) * (1 + Versatility)] Physical damage to all nearby enemies.
 *
 * Example log: https://www.warcraftlogs.com/reports/PLyFT2hcmCv39X7R#fight=1&type=damage-done&source=6
 */

class Stomp extends Analyzer {

  damage = 0;
  hits = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.STOMP_TALENT.id);
  }

  on_byPlayer_cast(event) {

  }

  on_byPlayerPet_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.STOMP_DAMAGE.id) {
      return;
    }
    this.hits += 1;
    this.damage += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <TalentStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        icon={<SpellIcon id={SPELLS.STOMP_TALENT.id} />}
        value={<>
          <ItemDamageDone amount={this.damage} /> <br />

        </>}
        label="Stomp"
      />
    );
  }
}

export default Stomp;
