import React from 'react';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/index';
import SpellLink from 'common/SpellLink';
import { formatNumber, formatPercentage } from 'common/format';
import DamageTracker from 'parser/shared/modules/AbilityTracker';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import { TooltipElement } from 'common/Tooltip';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';
import Events from 'parser/core/Events';

const RPPERCHARGE = 6;
const MAXCHARGES = 5;

class Tombstone extends Analyzer {
  static dependencies = {
    damageTracker: DamageTracker,
  };

  tombstone = [];
  casts = 0;
  rpGained = 0;
  rpWasted = 0;
  absorbSize = 0;
  totalAbsorbed = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.TOMBSTONE_TALENT.id);
    this.addEventListener(Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.TOMBSTONE_TALENT), this.onApplyBuff);
    this.addEventListener(Events.energize.to(SELECTED_PLAYER).spell(SPELLS.TOMBSTONE_TALENT), this.onEnergize);
    this.addEventListener(Events.absorbed.to(SELECTED_PLAYER).spell(SPELLS.TOMBSTONE_TALENT), this.onAbsorb);
    this.addEventListener(Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.TOMBSTONE_TALENT), this.onRemoveBuff);
  }

  get wastedCasts() {
    return this.tombstone.filter(e => e.charges < MAXCHARGES).length;
  }

  onApplyBuff(event) {
    this.casts += 1;
    this.absorbSize = event.absorb;
  }

  onEnergize(event) {
    this.rpGained = event.resourceChange;
    this.rpWasted = event.waste;
  }

  onAbsorb(event) {
    this.totalAbsorbed += event.amount;
  }

  onRemoveBuff(event) {
    this.tombstone.push({
      rpGained: this.rpGained,
      rpWasted: this.rpWasted,
      absorbSize: this.absorbSize,
      totalAbsorbed: this.totalAbsorbed,
      absorbedWasted: (this.absorbSize - this.totalAbsorbed),
      charges: (this.rpGained / RPPERCHARGE),
    });
    this.totalAbsorbed = 0;
  }

  get suggestionThresholdsEfficiency() {
    return {
      actual: 1 - this.wastedCasts / this.casts,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: .8,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholdsEfficiency)
      .addSuggestion((suggest, actual, recommended) => suggest(<>You casted {this.wastedCasts} <SpellLink id={SPELLS.TOMBSTONE_TALENT.id} /> with less than 5 charges causing a reduced absorb shield.</>)
          .icon(SPELLS.TOMBSTONE_TALENT.icon)
          .actual(i18n._(t('deathknight.blood.suggestions.tomestone.badCasts')`${formatPercentage(actual)}% bad Tombstone casts`))
          .recommended(`<${formatPercentage(recommended)}% is recommended`));
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.TOMBSTONE_TALENT.id}
        position={STATISTIC_ORDER.OPTIONAL(3)}
        value={this.wastedCasts}
        label="Bad Casts"
        tooltip="Any cast without 5 charges is considered a wasted cast."
      >
        <table className="table table-condensed">
          <thead>
            <tr>
              <th>Charges</th>
              <th>RP Wasted</th>
              <th>Absorb Used (%)</th>
            </tr>
          </thead>
          <tbody>
            {Object.values(this.tombstone).map((e, i) => (
              <tr key={i}>
                <th>{this.tombstone[i].charges}</th>
                <td>
                  <TooltipElement content={<><strong>RP Generated:</strong> {this.tombstone[i].rpGained - this.tombstone[i].rpWasted}</>}>
                    {this.tombstone[i].rpWasted}
                  </TooltipElement>
                </td>
                <td>
                  <TooltipElement
                    content={(
                      <>
                        <strong>Damage Absorbed:</strong> {formatNumber(this.tombstone[i].totalAbsorbed)} <br />
                        <strong>Absorb Shield: </strong> {formatNumber(this.tombstone[i].absorbSize)} <br />
                        <strong>Healing: </strong> {this.owner.formatItemHealingDone(this.tombstone[i].totalAbsorbed)}
                      </>
                    )}
                  >
                    {formatPercentage(this.tombstone[i].totalAbsorbed / this.tombstone[i].absorbSize)}%
                  </TooltipElement>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TalentStatisticBox>
    );
  }
}

export default Tombstone;
