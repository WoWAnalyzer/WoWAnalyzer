import { formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import COVENANTS from 'game/shadowlands/COVENANTS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import DonutChart from 'parser/ui/DonutChart';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import React from 'react';

import RisingSunRevival from '../shadowlands/conduits/RisingSunRevival';

const BUFFER = 500;

class Revival extends Analyzer {
  static dependencies = {
    risingSunRevival: RisingSunRevival,
  };

  protected risingSunRevival!: RisingSunRevival;

  revivalDirectHealing: number = 0;
  revivalDirectOverHealing: number = 0;

  gustsHealing: number = 0;
  gustOverHealing: number = 0;

  bdbMasteryHeal: number = 0;
  bdbMasteryOverHealing: number = 0;

  lastRevival: number = Number.MIN_SAFE_INTEGER;

  constructor(options: Options) {
    super(options);

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.REVIVAL), this.revivalCast);

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.REVIVAL),
      this.handleRevivalDirect,
    );

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.GUSTS_OF_MISTS),
      this.handleGustsOfMists,
    );

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.BONEDUST_BREW_GUST_OF_MIST),
      this.handleBDBGustsOfMist,
    );
  }

  revivalCast(event: CastEvent) {
    this.lastRevival = event.timestamp + BUFFER;
  }

  handleRevivalDirect(event: HealEvent) {
    if (this.lastRevival > event.timestamp) {
      this.revivalDirectHealing += event.amount + (event.absorbed || 0);
      this.revivalDirectOverHealing += event.overheal || 0;
    }
  }

  handleGustsOfMists(event: HealEvent) {
    if (this.lastRevival > event.timestamp) {
      this.gustsHealing += event.amount + (event.absorbed || 0);
      this.gustOverHealing += event.overheal || 0;
    }
  }

  handleBDBGustsOfMist(event: HealEvent) {
    if (this.lastRevival > event.timestamp) {
      this.bdbMasteryHeal += event.amount + (event.absorbed || 0);
      this.bdbMasteryOverHealing += event.overheal || 0;
    }
  }

  renderRevivalChart() {
    const items = [
      {
        color: '#ccccff',
        label: 'Revival',
        spellId: SPELLS.REVIVAL.id,
        value: this.revivalDirectHealing,
        valueTooltip: formatThousands(this.revivalDirectHealing),
      },
      {
        color: '#00b159',
        label: 'Gust Of Mist',
        spellId: SPELLS.GUSTS_OF_MISTS.id,
        value: this.gustsHealing,
        valueTooltip: formatThousands(this.gustsHealing),
      },
    ];

    if (this.selectedCombatant.conduitRankBySpellID(SPELLS.RISING_SUN_REVIVAL.id)) {
      items.push({
        color: '#f37735',
        label: 'Rising Sun Revival',
        spellId: SPELLS.RISING_SUN_REVIVAL.id,
        value: this.risingSunRevival.rsrHealing,
        valueTooltip: formatThousands(this.risingSunRevival.rsrHealing),
      });
    }

    if (this.selectedCombatant.hasCovenant(COVENANTS.NECROLORD.id)) {
      items.push({
        color: '#ffc425',
        label: 'Gust Of Mist (bdb)',
        spellId: SPELLS.BONEDUST_BREW_GUST_OF_MIST.id,
        value: this.bdbMasteryHeal,
        valueTooltip: formatThousands(this.bdbMasteryHeal),
      });
    }

    return <DonutChart items={items} />;
  }

  statistic() {
    return (
      <Statistic position={STATISTIC_ORDER.CORE(20)} size="flexible">
        <div className="pad">
          <label>
            <SpellLink id={SPELLS.REVIVAL.id}>Revival</SpellLink> breakdown
          </label>
          {this.renderRevivalChart()}
        </div>
      </Statistic>
    );
  }
}

export default Revival;
