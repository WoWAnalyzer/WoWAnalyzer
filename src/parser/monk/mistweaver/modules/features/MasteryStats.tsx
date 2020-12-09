import React from 'react';

import SPELLS from 'common/SPELLS';

import SpellLink from 'common/SpellLink';
import { formatThousands } from 'common/format';

import Analyzer from 'parser/core/Analyzer';
import EssenceFontMastery from 'parser/monk/mistweaver/modules/features/EssenceFontMastery';
import EnvelopingMists from 'parser/monk/mistweaver/modules/spells/EnvelopingMists';
import SoothingMist from 'parser/monk/mistweaver/modules/spells/SoothingMist';
import RenewingMist from 'parser/monk/mistweaver/modules/spells/RenewingMist';
import Vivify from 'parser/monk/mistweaver/modules/spells/Vivify';

import { STATISTIC_ORDER } from 'interface/others/StatisticsListBox';
import DonutChart from 'interface/statistics/components/DonutChart';
import Statistic from 'interface/statistics/Statistic';
import ExpelHarm from 'parser/monk/mistweaver/modules/spells/ExpelHarm';

class MasteryStats extends Analyzer {
  static dependencies = {
    essenceFontMastery: EssenceFontMastery,
    envelopingMists: EnvelopingMists,
    soothingMist: SoothingMist,
    renewingMist: RenewingMist,
    vivify: Vivify,
    expelHarm: ExpelHarm,
  };

  protected essenceFontMastery!: EssenceFontMastery;
  protected envelopingMists!: EnvelopingMists;
  protected soothingMist!: SoothingMist;
  protected renewingMist!: RenewingMist;
  protected vivify!: Vivify;
  protected expelHarm!: ExpelHarm;

  get totalMasteryHealing() {
    return (this.vivify.gustsHealing || 0)
      + (this.renewingMist.gustsHealing || 0)
      + (this.envelopingMists.gustsHealing || 0)
      + (this.soothingMist.gustsHealing || 0)
      + (this.essenceFontMastery.healing || 0)
      + (this.expelHarm.gustsHealing || 0);
  }

  renderMasterySourceChart() {
    const items = [
      {
        color: '#00b159',
        label: 'Vivify',
        spellId: SPELLS.VIVIFY.id,
        value: this.vivify.gustsHealing,
        valueTooltip: formatThousands(this.vivify.gustsHealing),
      },
      {
        color: '#db00db',
        label: 'Renewing Mist',
        spellId: SPELLS.RENEWING_MIST.id,
        value: this.renewingMist.gustsHealing,
        valueTooltip: formatThousands(this.renewingMist.gustsHealing),
      },
      {
        color: '#f37735',
        label: 'Enveloping Mists',
        spellId: SPELLS.ENVELOPING_MIST.id,
        value: this.envelopingMists.gustsHealing,
        valueTooltip: formatThousands(this.envelopingMists.gustsHealing),
      },
      {
        color: '#ffc425',
        label: 'Soothing Mist',
        spellId: SPELLS.SOOTHING_MIST.id,
        value: this.soothingMist.gustsHealing,
        valueTooltip: formatThousands(this.soothingMist.gustsHealing),
      },
      {
        color: '#00bbcc',
        label: 'Essence font',
        spellId: SPELLS.ESSENCE_FONT.id,
        value: this.essenceFontMastery.healing,
        valueTooltip: formatThousands(this.essenceFontMastery.healing),
      },
      {
        color: '#03fcad',
        label: 'Expel Harm',
        spellId: SPELLS.EXPEL_HARM.id,
        value: this.expelHarm.gustsHealing,
        valueTooltip: formatThousands(this.expelHarm.gustsHealing),
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
          <label><SpellLink id={SPELLS.GUSTS_OF_MISTS.id}>Gusts of Mists</SpellLink> breakdown</label>
          {this.renderMasterySourceChart()}
        </div>
      </Statistic>
    );
  }
}

export default MasteryStats;
