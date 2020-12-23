import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import SpellUsable from 'parser/shared/modules/SpellUsable';

import SPELLS from 'common/SPELLS/index';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import SCHOOLS from 'game/MAGIC_SCHOOLS';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';

import { t } from '@lingui/macro';
import Events from 'parser/core/Events';

class DemonSpikes extends Analyzer {
  get mitigatedUptime() {
    return formatPercentage(this.hitsWithDS / (this.hitsWithDS + this.hitsWithoutDS));
  }

  get hitsWithDSOffCDPercent() {
    return this.hitsWithDSOffCD / (this.hitsWithDS + this.hitsWithoutDS);
  }

  get suggestionThresholdsEfficiency() {
    return {
      actual: this.hitsWithDSOffCDPercent,
      isGreaterThan: {
        minor: 0.20,
        average: 0.30,
        major: 0.40,
      },
      style: 'percentage',
    };
  }

  static dependencies = {
    spellUsable: SpellUsable,
  };
  hitsWithDS = 0;
  hitsWithoutDS = 0;
  hitsWithDSOffCD = 0;

  constructor(options) {
    super(options);
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.onDamageTaken);
  }

  onDamageTaken(event) {
    // Physical
    if (event.ability.type !== SCHOOLS.ids.PHYSICAL) {
      return;
    }
    if (this.selectedCombatant.hasBuff(SPELLS.DEMON_SPIKES_BUFF.id, event.timestamp)) {
      this.hitsWithDS += 1;
    } else {
      this.hitsWithoutDS += 1;

      const isAvailable = this.spellUsable.isAvailable(SPELLS.DEMON_SPIKES.id);
      if (isAvailable) {
        this.hitsWithDSOffCD += 1;
      }
    }
  }

  suggestions(when) {
    when(this.suggestionThresholdsEfficiency)
      .addSuggestion((suggest, actual, recommended) => suggest(<> Cast <SpellLink id={SPELLS.DEMON_SPIKES.id} /> more regularly while actively tanking the boss or when they use a big phsyical attack. You missed having it up for {formatPercentage(this.hitsWithDSOffCDPercent)}% of physical hits.</>)
        .icon(SPELLS.DEMON_SPIKES.icon)
        .actual(t({
      id: "demonhunter.vengeance.suggestions.demonSpikes.unmitgatedHits",
      message: `${formatPercentage(actual)}% unmitigated physical hits`
    }))
        .recommended(`<${formatPercentage(recommended)}% is recommended`));
  }

  statistic() {
    const demonSpikesUptime = this.selectedCombatant.getBuffUptime(SPELLS.DEMON_SPIKES_BUFF.id);

    const demonSpikesUptimePercentage = demonSpikesUptime / this.owner.fightDuration;

    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(2)}
        size="flexible"
        tooltip={(
          <>
            Demon Spikes usage breakdown:
            <ul>
              <li>You were hit <strong>{this.hitsWithDS}</strong> times with your Demon Spikes buff.</li>
              <li>You were hit <strong>{this.hitsWithoutDS}</strong> times <strong><em>without</em></strong> your Demon Spikes buff.</li>
              <li>You were hit <strong>{this.hitsWithDSOffCD}</strong> times <strong><em>with</em></strong> Demon Spikes avalible for use but not used.</li>
            </ul>
            <b>Your overall uptime was {formatPercentage(demonSpikesUptimePercentage)}%</b>.
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.DEMON_SPIKES}>
          <>
            {this.mitigatedUptime}% <small>hits mitigated</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default DemonSpikes;
