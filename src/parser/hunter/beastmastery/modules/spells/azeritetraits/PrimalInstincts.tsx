import React from 'react';

import { formatNumber, formatPercentage } from 'common/format';
import { calculateAzeriteEffects } from 'common/stats';
import SPELLS from 'common/SPELLS';
import MasteryIcon from 'interface/icons/Mastery';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import StatTracker from 'parser/shared/modules/StatTracker';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Statistic from 'interface/statistics/Statistic';
import Events, { ApplyBuffEvent } from 'parser/core/Events';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';

const primalInstinctsStats = (traits: number[]) => Object.values(traits).reduce((obj, rank) => {
      const [mastery] = calculateAzeriteEffects(SPELLS.PRIMAL_INSTINCTS.id, rank);
      obj.mastery += mastery;
      return obj;
    },
    {
      mastery: 0,
    },
  );

/**
 * Aspect of the Wild increases your Mastery by X, and grants you a charge of
 * Barbed Shot.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/9mWQv1XZJT8M6GBV#fight=1&type=damage-done
 */
class PrimalInstincts extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
    spellUsable: SpellUsable,
  };

  mastery = 0;
  wastedBarbedShots = 0;
  chargesGained = 0;

  protected statTracker!: StatTracker;
  protected spellUsable!: SpellUsable;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTrait(SPELLS.PRIMAL_INSTINCTS.id);
    if (!this.active) {
      return;
    }

    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.PRIMAL_INSTINCTS_BUFF), this.onApplyPrimalInsticts);
    const { mastery } = primalInstinctsStats(this.selectedCombatant.traitsBySpellId[SPELLS.PRIMAL_INSTINCTS.id]);
    this.mastery = mastery;

    options.statTracker.add(SPELLS.PRIMAL_INSTINCTS_BUFF.id, {
      mastery: this.mastery,
    });
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.PRIMAL_INSTINCTS_BUFF.id) /
      this.owner.fightDuration;
  }

  get avgMastery() {
    return this.uptime * this.mastery;
  }

  onApplyPrimalInsticts(event: ApplyBuffEvent) {
    const hasTwoBarbedCharges = this.spellUsable.chargesAvailable(SPELLS.BARBED_SHOT.id) === 2;
    if (hasTwoBarbedCharges) {
      this.wastedBarbedShots += 1;
    } else {
      this.chargesGained += 1;
    }
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.AZERITE_POWERS}
        tooltip={(
          <>
            Primal Instincts granted <strong>{formatNumber(this.mastery)}</strong> Mastery for <strong>{formatPercentage(this.uptime)}%</strong> of the fight. <br />
            Wasted Barbed Shot charges: {this.wastedBarbedShots}
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.PRIMAL_INSTINCTS}>
          <>
            <MasteryIcon /> {formatNumber(this.avgMastery)}
            <small> average Mastery gained</small><br />
            {this.chargesGained}/{this.chargesGained + this.wastedBarbedShots} <small>Barbed Shot charges regained</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default PrimalInstincts;
