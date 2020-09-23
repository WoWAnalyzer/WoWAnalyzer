import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS';
import { formatNumber, formatPercentage } from 'common/format';
import Abilities from 'parser/core/modules/Abilities';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Events, { ApplyBuffEvent } from 'parser/core/Events';
import { binomialCDF, expectedProcCount, plotOneVariableBinomChart } from 'parser/shared/modules/helpers/Probability';
import SpellLink from 'common/SpellLink';

/**
 * Your ranged auto attacks have a 5% chance to trigger Lock and Load, causing your next Aimed Shot to cost no Focus and be instant.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/wPdQLfFnhTVYRyJm#fight=12&type=auras&source=640&ability=194594
 */

const PROC_CHANCE = 0.05;

class LockAndLoad extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    abilities: Abilities,
  };

  protected spellUsable!: SpellUsable;
  protected abilities!: Abilities;

  hasLnLBuff = false;
  noGainLNLProcs = 0;
  totalProcs = 0;
  autoShots = 0;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.LOCK_AND_LOAD_TALENT.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.AUTO_SHOT), this.autoshotDamage);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.AIMED_SHOT), this.onAimedCast);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.LOCK_AND_LOAD_BUFF), this.onLNLApplication);
    this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.LOCK_AND_LOAD_BUFF), this.onLNLRefresh);
  }

  autoshotDamage() {
    this.autoShots += 1;
  }

  onAimedCast() {
    if (!this.selectedCombatant.hasBuff(SPELLS.LOCK_AND_LOAD_BUFF.id)) {
      return;
    }
    this.hasLnLBuff = false;
  }

  onLNLApplication(event: ApplyBuffEvent) {
    this.totalProcs += 1;
    this.hasLnLBuff = true;
    if (this.spellUsable.isOnCooldown(SPELLS.AIMED_SHOT.id)) {
      const expectedCooldownDuration = this.abilities.getExpectedCooldownDuration(SPELLS.AIMED_SHOT.id, this.spellUsable.cooldownTriggerEvent(SPELLS.AIMED_SHOT.id));
      if (expectedCooldownDuration) {
        const newChargeCDR = expectedCooldownDuration - this.spellUsable.cooldownRemaining(SPELLS.AIMED_SHOT.id);
        this.spellUsable.endCooldown(SPELLS.AIMED_SHOT.id, false, event.timestamp, newChargeCDR);
      }
    }
  }

  onLNLRefresh() {
    if (this.hasLnLBuff) {
      this.noGainLNLProcs += 1;
    }
    this.totalProcs += 1;
  }

  get expectedProcs() {
    return expectedProcCount(PROC_CHANCE, this.autoShots);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(10)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={(
          <>
            You had {this.noGainLNLProcs} {this.noGainLNLProcs === 1 ? `proc` : `procs`} with LnL already active. <br />
            You had {formatPercentage(this.totalProcs / this.expectedProcs, 1)}% procs of what you could expect to get over the encounter. <br />
            You had a total of {this.totalProcs} procs, and your expected amount of procs was {formatNumber(this.expectedProcs)}. <br />
            <ul>
              <li>You have a ≈{formatPercentage(binomialCDF(this.totalProcs, this.autoShots, PROC_CHANCE))}% chance of getting this amount of procs or fewer in the future with this amount of auto attacks.</li>
            </ul>
          </>
        )}
        dropdown={(
          <>
            <div style={{ padding: '8px' }}>
              {plotOneVariableBinomChart(this.totalProcs, this.autoShots, PROC_CHANCE)}
              <p>Likelihood of getting <em>exactly</em> as many procs as estimated on a fight given your number of <SpellLink id={SPELLS.AUTO_SHOT.id} /> hits.</p>
            </div>
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.LOCK_AND_LOAD_TALENT}>
          <>
            {this.noGainLNLProcs} ({formatPercentage(this.noGainLNLProcs / (this.totalProcs))}%) <small>lost procs</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default LockAndLoad;
