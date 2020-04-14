import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import BoringItemValueText from 'interface/statistics/components/BoringItemValueText';
import Abilities from 'parser/core/modules/Abilities';
import Buffs from 'parser/core/modules/Buffs';
import Channeling from 'parser/shared/modules/Channeling';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import UptimeIcon from 'interface/icons/Uptime';
import { formatPercentage, formatNumber } from 'common/format';
import PrimaryStatIcon from 'interface/icons/PrimaryStat';
import { calculatePrimaryStat } from 'common/stats';

/**
 * Azshara's Font of Power
 * Use: Channel latent magic for up to 4 sec, increasing your primary stat by x.
 * The duration is extended for each second spent channeling, up to 30 sec. (2 Min Cooldown)
 *
 * Test Log: https://www.warcraftlogs.com/reports/B9JHtCwyprmFARbx/#fight=34&source=15
 */
class AzsharasFontofPower extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    abilities: Abilities,
    buffs: Buffs,
    channeling: Channeling,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrinket(ITEMS.AZSHARAS_FONT_OF_POWER.id);
    if (this.active) {
      this.abilities.add({
        spell: SPELLS.LATENT_ARCANA_CHANNEL,
        name: ITEMS.AZSHARAS_FONT_OF_POWER.name,
        category: Abilities.SPELL_CATEGORIES.ITEMS,
        cooldown: 120,
        castEfficiency: {
          suggestions: true,
        },
      });
      this.buffs.add({
        spellId: SPELLS.LATENT_ARCANA_BUFF.id,
        timelineHightlight: true,
      });
      this.statBuff = calculatePrimaryStat(400, 2203, this.selectedCombatant.getItem(ITEMS.AZSHARAS_FONT_OF_POWER.id).itemLevel);
    }
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.LATENT_ARCANA_CHANNEL), this.onChannelStart);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.LATENT_ARCANA_CHANNEL), this.onChannelEnd);
  }

  onChannelStart(event) {
    this.channeling.beginChannel(event);
  }

  onChannelEnd(event) {
    this.channeling.endChannel(event);
  }

  get buffUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.LATENT_ARCANA_BUFF.id) / this.owner.fightDuration;
  }

  statistic() {
    return (
      <ItemStatistic
        size="flexible"
      >
        <BoringItemValueText item={ITEMS.AZSHARAS_FONT_OF_POWER}>
          <UptimeIcon /> {formatPercentage(this.buffUptime)}% uptime<br />
          <PrimaryStatIcon stat={this.selectedCombatant.spec.primaryStat} /> {formatNumber(this.buffUptime * this.statBuff)} <small>average {this.selectedCombatant.spec.primaryStat} gained</small>

        </BoringItemValueText>
      </ItemStatistic>
    );
  }
}

export default AzsharasFontofPower;
