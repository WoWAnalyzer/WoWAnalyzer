import React from 'react';

import Analyzer from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS/index';
import ItemDamageDone from 'interface/ItemDamageDone';
import { formatNumber, formatPercentage } from 'common/format';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import { DamageEvent } from 'parser/core/Events';
import { binProbabilitySingleProcChance, singleProbabilityPN } from 'parser/shared/modules/helpers/Probabilities';

/**
 * Your auto-shots have a 25% chance to cause a volley of arrows to rain down around the target, dealing Physical damage to each enemy within 8 yards.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/qxZ674PKakR1rjTA#fight=21&type=damage-done&source=119&ability=260247
 */

const PROC_CHANCE = 0.25;
const BUFFER_MS = 100;

class Volley extends Analyzer {

  damage = 0;
  autoShots = 0;
  procs = 0;
  lastVolleyHit = 0;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.VOLLEY_TALENT.id);
  }

  on_byPlayer_damage(event: DamageEvent) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.VOLLEY_DAMAGE.id && spellId !== SPELLS.AUTO_SHOT.id) {
      return;
    }
    if (spellId === SPELLS.VOLLEY_DAMAGE.id) {
      this.damage += event.amount + (event.absorbed || 0);
      if (event.timestamp > (this.lastVolleyHit + BUFFER_MS)) {
        this.procs += 1;
        this.lastVolleyHit = event.timestamp;
      }
    }
    if (spellId === SPELLS.AUTO_SHOT.id) {
      this.autoShots += 1;
    }
  }

  get expectedProcs() {
    return singleProbabilityPN(PROC_CHANCE, this.autoShots);
  }

  statistic() {
    const binomCalc = binProbabilitySingleProcChance(this.procs, this.autoShots, PROC_CHANCE);
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={(
          <>
            You had {this.procs} {this.procs > 1 ? `procs` : `proc`}. <br />
            You had {formatPercentage(this.procs / this.expectedProcs, 1)}% procs of what you could expect to get over the encounter. <br />
            You had a total of {this.procs} procs, and your expected amount of procs was {formatNumber(this.expectedProcs)}. <br />
            <ul>
              <li>You have a ~{formatPercentage(binomCalc)}% chance of getting this amount of procs or fewer in the future with this amount of autoattacks.</li>
            </ul>
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.VOLLEY_TALENT}>
          <>
            <ItemDamageDone amount={this.damage} /><br />
            {this.procs} <small>procs</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Volley;
