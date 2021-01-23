import React from 'react';

import SPELLS from 'common/SPELLS';

import { SpellLink } from 'interface';
import { formatThousands } from 'common/format';

import Analyzer from 'parser/core/Analyzer';
import EssenceFontMastery from 'parser/monk/mistweaver/modules/features/EssenceFontMastery';

import { STATISTIC_ORDER } from 'parser/ui/StatisticsListBox';
import DonutChart from 'parser/ui/DonutChart';
import Statistic from 'parser/ui/Statistic';

import EssenceFont from '../spells/EssenceFont';

class EssenceFontHealingBreakdown extends Analyzer {
  static dependencies = {
    essenceFontMastery: EssenceFontMastery,
    essenceFont: EssenceFont,
  };

  protected essenceFontMastery!: EssenceFontMastery;
  protected essenceFont!: EssenceFont;

  renderEssenceFontChart() {
    const items = [
      {
        color: '#00bbcc',
        label: 'Bolt',
        spellId: SPELLS.ESSENCE_FONT.id,
        value: (this.essenceFont.totalHealing + this.essenceFont.totalAbsorbs),
        valueTooltip: formatThousands((this.essenceFont.totalHealing + this.essenceFont.totalAbsorbs)),
      },
      {
        color: '#f37735',
        label: 'Hot',
        spellId: SPELLS.ESSENCE_FONT_BUFF.id,
        value: this.essenceFont.efHotHeal,
        valueTooltip: formatThousands(this.essenceFont.efHotHeal),
      },
      {
        color: '#00b159',
        label: 'Mastery',
        spellId: SPELLS.GUSTS_OF_MISTS.id,
        value: this.essenceFontMastery.healing,
        valueTooltip: formatThousands(this.essenceFontMastery.healing),
      },
    ];

    return (
      <DonutChart
        items={items}
      />
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(20)}
        size="flexible"
      >
        <div className="pad">
          <label><SpellLink id={SPELLS.ESSENCE_FONT.id}>Essence Font</SpellLink> breakdown</label>
          {this.renderEssenceFontChart()}
        </div>
      </Statistic>
    );
  }
}

export default EssenceFontHealingBreakdown;
