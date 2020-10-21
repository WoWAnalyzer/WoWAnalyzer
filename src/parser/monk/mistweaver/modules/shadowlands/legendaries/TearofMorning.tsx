import React from 'react';

import SPELLS from 'common/SPELLS';
import Events, { ApplyBuffEvent, HealEvent, RemoveBuffEvent } from 'parser/core/Events';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';

import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import SpellLink from 'common/SpellLink';

import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import { formatThousands } from 'common/format';
import DonutChart from 'interface/statistics/components/DonutChart';


const POWER_TRANSFER = .25;

class TearofMorning extends Analyzer {

  vivHealing: number = 0;
  envHealing: number = 0;
  envbHealing: number = 0;

  numberOExtendLifes: number = 0;

  /**
   * When you cast renewing mist on a target you grant them extend life, Extend life makes it so all vivify and eveloping mist/breath is replicated on the target by 25%
   */
  constructor(options: Options){
    super(options);
    this.active = false;

    if (!this.active) {
      return;
    }

    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.TEAR_OF_MORNING_BUFF), this.manageBuffApplied);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.TEAR_OF_MORNING_BUFF), this.manageBuffRemoved);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.ENVELOPING_MIST), this.envelopingMistHealing);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.ENVELOPING_BREATH), this.envelopingBreathHealing);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.VIVIFY), this.vivifyHealing);
  }

  manageBuffApplied(event: ApplyBuffEvent){
    this.numberOExtendLifes += 1;
  }

  manageBuffRemoved(event: RemoveBuffEvent){
    this.numberOExtendLifes -= 1;
  }

  envelopingMistHealing(event: HealEvent) {
    this.envHealing += ((event.amount || 0) + (event.absorbed || 0) + (event.overheal || 0)) * POWER_TRANSFER * this.numberOExtendLifes;
  }

  envelopingBreathHealing(event: HealEvent) {
    this.envbHealing += ((event.amount || 0) + (event.absorbed || 0) + (event.overheal || 0)) * POWER_TRANSFER * this.numberOExtendLifes;
  }

  vivifyHealing(event: HealEvent){
    this.vivHealing += ((event.amount || 0) + (event.absorbed || 0) + (event.overheal || 0)) * POWER_TRANSFER * this.numberOExtendLifes;
  }

  renderDonutChart() {
    const totalHealing = this.vivHealing + this.envHealing + this.envbHealing;
    const vivRatio = this.vivHealing/totalHealing;
    const envRatio = this.envHealing/totalHealing;
    const envbRatio = this.envbHealing/totalHealing;
    const items = [
      {
        color: '#00b159',
        label: 'Vivify',
        spellId: SPELLS.VIVIFY.id,
        value: vivRatio,
        valueTooltip: formatThousands(this.vivHealing),
      },
      {
        color: '#f37735',
        label: 'Enveloping Mist',
        spellId: SPELLS.ENVELOPING_MIST.id,
        value: envRatio,
        valueTooltip: formatThousands(this.envHealing),
      },
      {
        color: '#db00db',
        label: 'Enveloping Breath',
        spellId: SPELLS.ENVELOPING_BREATH.id,
        value: envbRatio,
        valueTooltip: formatThousands(this.envbHealing),
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
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
      >
        <div className="pad">
          <label><SpellLink id={SPELLS.TEAR_OF_MORNING_BUFF.id}>Tear of Morning</SpellLink> breakdown</label>
          {this.renderDonutChart()}
        </div>
      </Statistic>
    );
  }
}

export default TearofMorning;
