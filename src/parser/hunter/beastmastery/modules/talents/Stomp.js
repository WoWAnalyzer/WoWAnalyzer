import React from 'react';

import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import ItemDamageDone from 'interface/others/ItemDamageDone';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import AverageTargetsHit from 'interface/others/AverageTargetsHit';

/**
 * When you cast Barbed Shot, your pet stomps the ground, dealing [((50% of Attack power)) * (1 + Versatility)] Physical damage to all nearby enemies.
 *
 * Example log: https://www.warcraftlogs.com/reports/PLyFT2hcmCv39X7R#fight=1&type=damage-done&source=6
 */

class Stomp extends Analyzer {

  damage = 0;
  hits = 0;
  casts = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.STOMP_TALENT.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.BARBED_SHOT.id && spellId !== SPELLS.DIRE_BEAST_TALENT.id) {
      return;
    }
    this.casts += 1;
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
        talent={SPELLS.STOMP_TALENT.id}
        value={<>
          <ItemDamageDone amount={this.damage} /> <br />
          <AverageTargetsHit casts={this.casts} hits={this.hits} />
        </>}
      />
    );
  }
}

export default Stomp;
