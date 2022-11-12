import { formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import DonutChart from 'parser/ui/DonutChart';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticsListBox';

import { SPELL_COLORS } from '../../constants';
import EssenceFont from '../spells/EssenceFont';

class EssenceFontHealingBreakdown extends Analyzer {
  static dependencies = {
    essenceFont: EssenceFont,
  };

  protected essenceFont!: EssenceFont;

  renderEssenceFontChart() {
    const items = [
      {
        color: SPELL_COLORS.ESSENCE_FONT,
        label: 'Bolt',
        spellId: TALENTS_MONK.ESSENCE_FONT_TALENT.id,
        value: this.essenceFont.boltHealing,
        valueTooltip: formatThousands(this.essenceFont.boltHealing),
      },
      {
        color: SPELL_COLORS.ESSENCE_FONT_BUFF,
        label: 'Hot',
        spellId: SPELLS.ESSENCE_FONT_BUFF.id,
        value: this.essenceFont.hotHealing,
        valueTooltip: formatThousands(this.essenceFont.hotHealing),
      },
      {
        color: SPELL_COLORS.GUSTS_OF_MISTS,
        label: 'Mastery',
        spellId: SPELLS.GUSTS_OF_MISTS.id,
        value: this.essenceFont.gomHealing,
        valueTooltip: formatThousands(this.essenceFont.gomHealing),
      },
    ];

    return <DonutChart items={items} />;
  }

  statistic() {
    return (
      <Statistic position={STATISTIC_ORDER.CORE(1)} size="flexible">
        <div className="pad">
          <label>
            <SpellLink id={TALENTS_MONK.ESSENCE_FONT_TALENT.id}>Essence Font</SpellLink> breakdown
          </label>
          {this.renderEssenceFontChart()}
        </div>
      </Statistic>
    );
  }
}

export default EssenceFontHealingBreakdown;
