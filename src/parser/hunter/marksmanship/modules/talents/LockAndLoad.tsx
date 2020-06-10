import React from 'react';

import Analyzer from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS';
import { formatNumber, formatPercentage } from 'common/format';
import Abilities from 'parser/core/modules/Abilities';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import { ApplyBuffEvent, CastEvent, DamageEvent, RefreshBuffEvent } from 'parser/core/Events';
import { binomialCDF, plotOneVariableBinomChart, probabilityPN } from 'parser/shared/modules/helpers/Probability';
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
  wastedInstants = 0;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.LOCK_AND_LOAD_TALENT.id);
  }

  on_byPlayer_applybuff(event: ApplyBuffEvent) {
    const buffId = event.ability.guid;
    if (buffId !== SPELLS.LOCK_AND_LOAD_BUFF.id) {
      return;
    }
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

  on_byPlayer_cast(event: CastEvent) {
    const spellId = event.ability.guid;
    if (!this.selectedCombatant.hasBuff(SPELLS.LOCK_AND_LOAD_BUFF.id, event.timestamp) || spellId !== SPELLS.AIMED_SHOT.id) {
      return;
    }
    this.hasLnLBuff = false;
  }

  on_byPlayer_refreshbuff(event: RefreshBuffEvent) {
    const buffId = event.ability.guid;
    if (buffId !== SPELLS.LOCK_AND_LOAD_BUFF.id) {
      return;
    }
    if (this.hasLnLBuff) {
      this.noGainLNLProcs += 1;
      this.wastedInstants += 1;
    }
    this.totalProcs += 1;
  }

  on_byPlayer_damage(event: DamageEvent) {
    const spellID = event.ability.guid;
    if (spellID !== SPELLS.AUTO_SHOT.id) {
      return;
    }
    this.autoShots += 1;
  }

  get expectedProcs() {
    return probabilityPN(PROC_CHANCE, this.autoShots);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(10)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={(
          <>
            You had {this.noGainLNLProcs} {this.noGainLNLProcs > 1 || this.noGainLNLProcs === 0 ? `procs` : `proc`} with LnL already active. <br />
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
            {this.wastedInstants} ({formatPercentage(this.wastedInstants / (this.totalProcs))}%) <small>lost procs</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default LockAndLoad;
