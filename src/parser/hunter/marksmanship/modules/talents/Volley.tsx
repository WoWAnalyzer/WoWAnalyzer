import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS/index';
import ItemDamageDone from 'interface/ItemDamageDone';
import { formatNumber, formatPercentage } from 'common/format';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Events, { DamageEvent } from 'parser/core/Events';
import { binomialCDF, expectedProcCount, plotOneVariableBinomChart } from 'parser/shared/modules/helpers/Probability';
import SpellLink from 'common/SpellLink';

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
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.AUTO_SHOT), this.onAutoshot);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.VOLLEY_DAMAGE), this.onVolleyProc);
  }

  onVolleyProc(event: DamageEvent) {
    this.damage += event.amount + (event.absorbed || 0);
    if (event.timestamp > (this.lastVolleyHit + BUFFER_MS)) {
      this.procs += 1;
      this.lastVolleyHit = event.timestamp;
    }
  }

  onAutoshot() {
    this.autoShots += 1;
  }

  get expectedProcs() {
    return expectedProcCount(PROC_CHANCE, this.autoShots);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={(
          <>
            You had {this.procs} {this.procs === 1 ? `proc` : `procs`}. <br />
            You had {formatPercentage(this.procs / this.expectedProcs)}% procs of what you could expect to get over the encounter. <br />
            You had a total of {this.procs} procs, and your expected amount of procs was {formatNumber(this.expectedProcs)}. <br />
            <ul>
              <li>You have a ≈{formatPercentage(binomialCDF(this.procs, this.autoShots, PROC_CHANCE))}% chance of getting this amount of procs or fewer in the future with this amount of autoattacks.</li>
            </ul>
          </>
        )}
        dropdown={(
          <>
            <div style={{ padding: '8px' }}>
              {plotOneVariableBinomChart(this.procs, this.autoShots, PROC_CHANCE)}
              <p>Likelihood of getting <em>exactly</em> as many procs as estimated on a fight given your number of <SpellLink id={SPELLS.AUTO_SHOT.id} /> hits.</p>
            </div>
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
