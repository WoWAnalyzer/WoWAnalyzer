import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS';
import ItemDamageDone from 'interface/ItemDamageDone';
import AverageTargetsHit from 'interface/others/AverageTargetsHit';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Events, { DamageEvent } from 'parser/core/Events';

/**
 * A powerful shot which deals (112.5% of Attack power)% Physical damage to the target and up to [(112.5% of Attack power)% / (3)] Physical damage to all enemies between you and the target.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/fpgqv29ktHrcnTz3#fight=49&type=damage-done&source=241&ability=198670
 */

class PiercingShot extends Analyzer {

  damage = 0;
  casts = 0;
  hits = 0;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.PIERCING_SHOT_TALENT.id);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.PIERCING_SHOT_TALENT), this.onCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.PIERCING_SHOT_TALENT), this.onDamage);
  }

  onCast() {
    this.casts += 1;
  }

  onDamage(event: DamageEvent) {
    this.hits += 1;
    this.damage += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={SPELLS.PIERCING_SHOT_TALENT}>
          <>
            <ItemDamageDone amount={this.damage} /><br />
            <AverageTargetsHit casts={this.casts} hits={this.hits} unique />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default PiercingShot;
